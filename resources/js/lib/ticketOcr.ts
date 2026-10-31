import { extractNumbersFromText } from '@/lib/extractNumbers';
import { buildDigitTemplates, classifyCandidate } from '@/lib/glyphTemplates';
import { candidateIoU, detectNumberCandidates, type GrayImage, type NumberCandidate } from '@/lib/ticketNumberDetector';
import Tesseract from 'tesseract.js';

type PreparedImage = GrayImage & {
    /** Grayscale canvas used by the whole-page fallback OCR pass. */
    fallbackCanvas: HTMLCanvasElement;
};

type PackedCandidate = {
    candidate: NumberCandidate;
    canvas: HTMLCanvasElement;
};

type OcrReading = {
    number: string | null;
    confidence: number;
};

type NumberHit = {
    number: string;
    confidence: number;
    candidate: NumberCandidate;
};

const MIN_WIDTH = 900;
const MAX_SIDE = 2000;
const GLYPH_HEIGHT = 48;
const GLYPH_PADDING = 2;
const GLYPH_GAP = 8;
const MARGIN_X = 14;
const MARGIN_Y = 12;
const BASELINE_OFFSET = 4;

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function computeScale(width: number, height: number) {
    let scale = 1;

    const longestSide = Math.max(width, height);
    if (longestSide > MAX_SIDE) {
        scale = MAX_SIDE / longestSide;
    }

    if (width * scale < MIN_WIDTH) {
        const widthScale = MIN_WIDTH / width;
        const heightScale = MAX_SIDE / height;
        scale = Math.min(widthScale, heightScale);
    }

    return scale;
}

/**
 * Draw the photo into a grayscale canvas and normalise its tonal range.
 * Everything runs locally in the browser.
 */
async function prepareImage(file: File): Promise<PreparedImage> {
    const bitmap = await createImageBitmap(file);
    const scale = computeScale(bitmap.width, bitmap.height);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
        bitmap.close();
        throw new Error('Canvas is not supported in this browser.');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    const gray = new Uint8ClampedArray(width * height);

    for (let index = 0, offset = 0; index < gray.length; index += 1, offset += 4) {
        gray[index] = Math.round(pixels[offset] * 0.299 + pixels[offset + 1] * 0.587 + pixels[offset + 2] * 0.114);
    }

    // A light autocontrast pass helps dim phone photos without changing the
    // tonal balance of already-well-lit ticket scans.
    const histogram = new Uint32Array(256);
    for (const value of gray) histogram[value] += 1;

    const cutoff = Math.floor(gray.length * 0.01);
    let low = 0;
    let high = 255;
    let accumulated = 0;

    for (let value = 0; value < 256; value += 1) {
        accumulated += histogram[value];
        if (accumulated > cutoff) {
            low = value;
            break;
        }
    }

    accumulated = 0;
    for (let value = 255; value >= 0; value -= 1) {
        accumulated += histogram[value];
        if (accumulated > cutoff) {
            high = value;
            break;
        }
    }

    if (high > low) {
        const range = high - low;
        for (let index = 0; index < gray.length; index += 1) {
            gray[index] = clamp(Math.round(((gray[index] - low) * 255) / range), 0, 255);
        }
    }

    // Build a grayscale canvas for the fallback OCR pass.
    const fallbackCanvas = document.createElement('canvas');
    fallbackCanvas.width = width;
    fallbackCanvas.height = height;

    const fallbackContext = fallbackCanvas.getContext('2d');
    if (!fallbackContext) {
        throw new Error('Canvas is not supported in this browser.');
    }

    const fallbackData = fallbackContext.createImageData(width, height);
    for (let index = 0, offset = 0; index < gray.length; index += 1, offset += 4) {
        fallbackData.data[offset] = gray[index];
        fallbackData.data[offset + 1] = gray[index];
        fallbackData.data[offset + 2] = gray[index];
        fallbackData.data[offset + 3] = 255;
    }
    fallbackContext.putImageData(fallbackData, 0, 0);

    return { data: gray, width, height, fallbackCanvas };
}

function createBinaryCanvas(gray: Uint8ClampedArray, width: number, height: number, threshold: number) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is not supported in this browser.');

    const imageData = ctx.createImageData(width, height);
    const pixels = imageData.data;

    for (let index = 0, offset = 0; index < gray.length; index += 1, offset += 4) {
        const value = gray[index] < threshold ? 0 : 255;
        pixels[offset] = value;
        pixels[offset + 1] = value;
        pixels[offset + 2] = value;
        pixels[offset + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

/**
 * Build a tightly packed, normalised image containing only the six/seven
 * digits of one candidate. Removing the background artwork and the wide gaps
 * between digits is what makes Tesseract reliable on dense ticket sheets.
 */
function packCandidate(binaryCanvas: HTMLCanvasElement, candidate: NumberCandidate) {
    const scale = GLYPH_HEIGHT / Math.max(1, candidate.glyphHeight);
    const pieces = candidate.glyphs.map((glyph) => {
        const sourceX = Math.max(0, glyph.x - GLYPH_PADDING);
        const sourceY = Math.max(0, glyph.y - GLYPH_PADDING);
        const sourceRight = Math.min(binaryCanvas.width, glyph.x + glyph.w + GLYPH_PADDING);
        const sourceBottom = Math.min(binaryCanvas.height, glyph.y + glyph.h + GLYPH_PADDING);

        return {
            sourceX,
            sourceY,
            sourceWidth: Math.max(1, sourceRight - sourceX),
            sourceHeight: Math.max(1, sourceBottom - sourceY),
            width: Math.max(1, Math.round((sourceRight - sourceX) * scale)),
            height: Math.max(1, Math.round((sourceBottom - sourceY) * scale)),
        };
    });

    const contentWidth = pieces.reduce((total, piece) => total + piece.width, 0) + GLYPH_GAP * (pieces.length - 1);
    const maxGlyphHeight = pieces.reduce((max, piece) => Math.max(max, piece.height), 0);

    const canvas = document.createElement('canvas');
    canvas.width = contentWidth + MARGIN_X * 2;
    canvas.height = maxGlyphHeight + MARGIN_Y * 2;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas is not supported in this browser.');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    let x = MARGIN_X;
    for (const piece of pieces) {
        const y = MARGIN_Y + maxGlyphHeight - BASELINE_OFFSET - piece.height;
        ctx.drawImage(binaryCanvas, piece.sourceX, piece.sourceY, piece.sourceWidth, piece.sourceHeight, x, y, piece.width, piece.height);
        x += piece.width + GLYPH_GAP;
    }

    // Re-binarise after scaling so anti-aliased grey edges do not confuse OCR.
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    for (let offset = 0; offset < pixels.length; offset += 4) {
        const value = pixels[offset] < 160 ? 0 : 255;
        pixels[offset] = value;
        pixels[offset + 1] = value;
        pixels[offset + 2] = value;
        pixels[offset + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);

    return canvas;
}

async function readCandidates(
    worker: Tesseract.Worker,
    packed: PackedCandidate[],
    digitLength: number,
    psm: Tesseract.PSM,
    onProgress?: (progress: number) => void,
): Promise<OcrReading[]> {
    await worker.setParameters({
        tessedit_char_whitelist: '0123456789',
        tessedit_pageseg_mode: psm,
        preserve_interword_spaces: '1',
    });

    const readings: OcrReading[] = [];

    for (let index = 0; index < packed.length; index += 1) {
        const { data } = await worker.recognize(packed[index].canvas);
        const numbers = extractNumbersFromText(data.text ?? '', digitLength);

        readings.push({
            number: numbers[0] ?? null,
            confidence: data.confidence ?? 0,
        });

        onProgress?.((index + 1) / packed.length);
    }

    return readings;
}

function chooseReading(raw: OcrReading, line: OcrReading): OcrReading | null {
    const options: Array<OcrReading & { priority: number }> = [];

    if (raw.number) options.push({ ...raw, priority: 0 });
    if (line.number) options.push({ ...line, priority: 1 });

    if (options.length === 0) return null;

    options.sort((a, b) => b.confidence - a.confidence || a.priority - b.priority);
    return { number: options[0].number, confidence: options[0].confidence };
}

function selectNumbers(hits: NumberHit[]) {
    const sorted = [...hits].sort((a, b) => b.confidence - a.confidence || a.candidate.heightCv - b.candidate.heightCv);

    const groups: NumberHit[][] = [];
    for (const hit of sorted) {
        const group = groups.find((item) => item.some((existing) => candidateIoU(hit.candidate, existing.candidate) > 0.3));

        if (group) {
            group.push(hit);
        } else {
            groups.push([hit]);
        }
    }

    // The best reading in each overlapping group wins. Overlapping candidates
    // are almost always alternate readings of the same printed number.
    const selected = groups
        .map((group) => group[0])
        .filter((hit) => {
            // A very low-confidence reading is only trusted when its glyph heights
            // are consistent (some genuine, line-damaged numbers report 0).
            return !(hit.confidence < 20 && hit.candidate.heightCv > 0.12);
        });

    selected.sort((a, b) => a.candidate.boxY - b.candidate.boxY || a.candidate.boxX - b.candidate.boxX);

    const seen = new Set<string>();
    const numbers: string[] = [];

    for (const hit of selected) {
        if (!hit.number || seen.has(hit.number)) continue;
        seen.add(hit.number);
        numbers.push(hit.number);
    }

    return numbers;
}

/**
 * Scan one ticket photo and return every detected number.
 *
 * The image is first searched for digit-sized glyph groups. Each group is
 * packed into a clean one-line image and read twice by Tesseract. If glyph
 * detection finds nothing at all, the old whole-image OCR path is used as a
 * fallback for simple, uncrowded photos.
 */
export async function scanTicketImage(
    file: File,
    digitLength: number,
    worker: Tesseract.Worker,
    onProgress?: (progress: number) => void,
): Promise<string[]> {
    let lastProgress = -1;
    const report = (value: number) => {
        const rounded = clamp(Math.round(value), 0, 100);
        if (rounded === lastProgress) return;
        lastProgress = rounded;
        onProgress?.(rounded);
    };

    report(3);
    const prepared = await prepareImage(file);
    report(8);

    const candidates = await detectNumberCandidates(prepared, digitLength, (progress) => {
        report(8 + progress * 22);
    });
    report(30);

    if (candidates.length === 0) {
        await worker.setParameters({
            tessedit_char_whitelist: '0123456789',
            tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT,
            preserve_interword_spaces: '1',
        });

        const { data } = await worker.recognize(prepared.fallbackCanvas);
        report(100);
        return extractNumbersFromText(data.text ?? '', digitLength);
    }

    const byThreshold = new Map<number, NumberCandidate[]>();
    for (const candidate of candidates) {
        const group = byThreshold.get(candidate.threshold) ?? [];
        group.push(candidate);
        byThreshold.set(candidate.threshold, group);
    }

    const packed: PackedCandidate[] = [];
    for (const [threshold, group] of byThreshold) {
        const binaryCanvas = createBinaryCanvas(prepared.data, prepared.width, prepared.height, threshold);

        for (const candidate of group) {
            packed.push({ candidate, canvas: packCandidate(binaryCanvas, candidate) });
        }
    }
    report(36);

    if (packed.length === 0) {
        await worker.setParameters({
            tessedit_char_whitelist: '0123456789',
            tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT,
            preserve_interword_spaces: '1',
        });

        const { data } = await worker.recognize(prepared.fallbackCanvas);
        report(100);
        return extractNumbersFromText(data.text ?? '', digitLength);
    }

    // RAW_LINE is excellent at keeping closely spaced digits together, while
    // SINGLE_LINE wins on the occasional damaged glyph. Reading both and
    // keeping the more confident result recovered every number in testing.
    const rawReadings = await readCandidates(worker, packed, digitLength, Tesseract.PSM.RAW_LINE, (progress) => {
        report(36 + progress * 27);
    });
    const lineReadings = await readCandidates(worker, packed, digitLength, Tesseract.PSM.SINGLE_LINE, (progress) => {
        report(63 + progress * 27);
    });
    report(91);

    const chosenReadings = packed.map((_, index) => chooseReading(rawReadings[index], lineReadings[index]));
    const templates = buildDigitTemplates(
        prepared.data,
        prepared.width,
        prepared.height,
        packed.map((item) => item.candidate),
        chosenReadings.map((reading) => reading ?? { number: null, confidence: 0 }),
    );

    const hits: NumberHit[] = [];
    for (let index = 0; index < packed.length; index += 1) {
        const reading = chosenReadings[index];
        if (!reading?.number) continue;

        let number = reading.number;
        let confidence = reading.confidence;

        if (templates) {
            const classification = classifyCandidate(prepared.data, prepared.width, prepared.height, packed[index].candidate, templates);

            // Only override OCR when every glyph has a very close template
            // match. A single damaged glyph can otherwise turn a good reading
            // into a confident-looking mistake.
            if (classification.meanDistance < 0.12 && classification.maxDistance < 0.25) {
                number = classification.number;
                confidence = Math.max(confidence, Math.round(80 - classification.meanDistance * 100));
            }
        }

        hits.push({
            number,
            confidence,
            candidate: packed[index].candidate,
        });
    }

    let numbers = selectNumbers(hits);
    report(95);

    if (numbers.length === 0) {
        await worker.setParameters({
            tessedit_char_whitelist: '0123456789',
            tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT,
            preserve_interword_spaces: '1',
        });

        const { data } = await worker.recognize(prepared.fallbackCanvas);
        numbers = extractNumbersFromText(data.text ?? '', digitLength);
    }

    report(100);
    return numbers;
}
