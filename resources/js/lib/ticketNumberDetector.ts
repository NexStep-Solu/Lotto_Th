/**
 * Locates lottery-number groups in a ticket photo by finding digit-sized
 * connected components and grouping them into fixed-length sequences.
 *
 * Ticket numbers are printed with wide gaps between digits, which makes
 * whole-page OCR unreliable. Detecting the glyphs first lets the scanner OCR
 * each number on its own, and also handles dense sheets with dozens of
 * tickets in one photo.
 */

export type GrayImage = {
    data: Uint8ClampedArray;
    width: number;
    height: number;
};

export type GlyphBox = {
    x: number;
    y: number;
    w: number;
    h: number;
    area: number;
};

export type NumberCandidate = {
    glyphs: GlyphBox[];
    /** Bounding box around all glyphs in the sequence. */
    boxX: number;
    boxY: number;
    boxWidth: number;
    boxHeight: number;
    /** Median glyph height, used to normalise the packed number image. */
    glyphHeight: number;
    /** Coefficient of variation of the glyph heights. Lower is cleaner. */
    heightCv: number;
    /** Binarisation threshold that produced this candidate. */
    threshold: number;
};

const THRESHOLDS = [95, 105, 115, 125, 135];

function overlapRatio(a: GlyphBox, b: GlyphBox) {
    const top = Math.max(a.y, b.y);
    const bottom = Math.min(a.y + a.h, b.y + b.h);
    return Math.max(0, bottom - top) / Math.min(a.h, b.h);
}

function median(values: number[]) {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
}

function extractGlyphs(gray: Uint8ClampedArray, width: number, height: number, threshold: number): GlyphBox[] {
    const size = width * height;
    const dark = new Uint8Array(size);
    for (let index = 0; index < size; index += 1) {
        dark[index] = gray[index] < threshold ? 1 : 0;
    }

    const visited = new Uint8Array(size);
    const stack = new Int32Array(size);
    const glyphs: GlyphBox[] = [];

    for (let start = 0; start < size; start += 1) {
        if (dark[start] === 0 || visited[start] === 1) continue;

        let stackSize = 0;
        stack[stackSize] = start;
        stackSize += 1;
        visited[start] = 1;

        let minX = width;
        let minY = height;
        let maxX = -1;
        let maxY = -1;
        let area = 0;

        while (stackSize > 0) {
            stackSize -= 1;
            const index = stack[stackSize];
            area += 1;

            const y = Math.floor(index / width);
            const x = index - y * width;

            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;

            for (let nextY = y - 1; nextY <= y + 1; nextY += 1) {
                if (nextY < 0 || nextY >= height) continue;
                const rowOffset = nextY * width;

                for (let nextX = x - 1; nextX <= x + 1; nextX += 1) {
                    if (nextX < 0 || nextX >= width) continue;
                    const nextIndex = rowOffset + nextX;
                    if (dark[nextIndex] === 0 || visited[nextIndex] === 1) continue;

                    visited[nextIndex] = 1;
                    stack[stackSize] = nextIndex;
                    stackSize += 1;
                }
            }
        }

        const boxWidth = maxX - minX + 1;
        const boxHeight = maxY - minY + 1;
        const aspect = boxWidth / boxHeight;

        if (
            boxHeight >= 10 &&
            boxHeight <= 120 &&
            boxWidth >= 3 &&
            boxWidth <= 100 &&
            area >= 25 &&
            aspect >= 0.04 &&
            aspect <= 2 &&
            area / (boxWidth * boxHeight) >= 0.06
        ) {
            glyphs.push({ x: minX, y: minY, w: boxWidth, h: boxHeight, area });
        }
    }

    return glyphs;
}

function findSequences(glyphs: GlyphBox[], digitLength: number, threshold: number): NumberCandidate[] {
    const sorted = [...glyphs].sort((a, b) => a.x - b.x || a.y - b.y);
    const candidates: NumberCandidate[] = [];

    for (const first of sorted) {
        const sequence = [first];
        const used = new Set<GlyphBox>([first]);
        let current = first;

        while (sequence.length < digitLength) {
            let best: GlyphBox | null = null;

            for (const glyph of sorted) {
                if (used.has(glyph) || glyph.x <= current.x) continue;

                const startSpacing = glyph.x - current.x;
                const averageHeight = (current.h + glyph.h) / 2;

                // Compare the distance between digit starts, not the ink gap.
                // Narrow glyphs such as "1" otherwise look artificially far
                // apart on fixed-pitch ticket printers.
                if (startSpacing > 2.2 * averageHeight) continue;
                if (glyph.h / current.h < 0.5 || glyph.h / current.h > 2) continue;
                if (overlapRatio(current, glyph) < 0.4) continue;
                if (best === null || glyph.x < best.x) best = glyph;
            }

            if (best === null) break;

            sequence.push(best);
            used.add(best);
            current = best;
        }

        if (sequence.length !== digitLength) continue;

        const heights = sequence.map((glyph) => glyph.h);
        const widths = sequence.map((glyph) => glyph.w);
        const glyphHeight = median(heights);
        const medianWidth = median(widths);

        // Printed lottery digits are at least ~18px tall after preprocessing
        // and are much wider than the thin vertical strokes found in dates and
        // decorative ticket text. These checks remove those false groups before
        // any OCR work is done.
        if (glyphHeight < 18) continue;
        if (medianWidth / glyphHeight < 0.3) continue;

        const meanHeight = heights.reduce((total, height) => total + height, 0) / heights.length;
        const variance = heights.reduce((total, height) => total + (height - meanHeight) ** 2, 0) / heights.length;
        const heightCv = Math.sqrt(variance) / meanHeight;

        if (heightCv > 0.12) continue;

        const gaps: number[] = [];
        for (let index = 0; index < sequence.length - 1; index += 1) {
            gaps.push(sequence[index + 1].x - sequence[index].x);
        }

        if (Math.min(...gaps) < 0.25 * glyphHeight || Math.max(...gaps) > 2.2 * glyphHeight) continue;

        const boxX = Math.min(...sequence.map((glyph) => glyph.x));
        const boxY = Math.min(...sequence.map((glyph) => glyph.y));
        const boxRight = Math.max(...sequence.map((glyph) => glyph.x + glyph.w));
        const boxBottom = Math.max(...sequence.map((glyph) => glyph.y + glyph.h));

        if ((boxRight - boxX) / glyphHeight < 4.5) continue;

        candidates.push({
            glyphs: sequence,
            boxX,
            boxY,
            boxWidth: boxRight - boxX,
            boxHeight: boxBottom - boxY,
            glyphHeight,
            heightCv,
            threshold,
        });
    }

    return candidates;
}

export function candidateIoU(a: NumberCandidate, b: NumberCandidate) {
    const overlapX = Math.max(0, Math.min(a.boxX + a.boxWidth, b.boxX + b.boxWidth) - Math.max(a.boxX, b.boxX));
    const overlapY = Math.max(0, Math.min(a.boxY + a.boxHeight, b.boxY + b.boxHeight) - Math.max(a.boxY, b.boxY));
    const intersection = overlapX * overlapY;
    const union = a.boxWidth * a.boxHeight + b.boxWidth * b.boxHeight - intersection;

    return union > 0 ? intersection / union : 0;
}

function dedupeCandidates(candidates: NumberCandidate[]) {
    // Keep the cleanest variant of each physical number. Different thresholds
    // usually produce almost identical boxes; OCR is still run on several
    // distinct candidates so a single misread glyph cannot lose a number.
    const sorted = [...candidates].sort((a, b) => a.heightCv - b.heightCv);
    const unique: NumberCandidate[] = [];

    for (const candidate of sorted) {
        if (unique.some((existing) => candidateIoU(candidate, existing) > 0.85)) continue;
        unique.push(candidate);
    }

    return unique.sort((a, b) => a.boxY - b.boxY || a.boxX - b.boxX);
}

const nextFrame = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/**
 * Find every plausible fixed-length number in a grayscale image.
 *
 * The scan runs at several binarisation thresholds because ticket stock and
 * lighting vary. Candidates that overlap almost completely are merged, but
 * partially overlapping variants are kept as a safety net for OCR.
 */
export async function detectNumberCandidates(
    image: GrayImage,
    digitLength: number,
    onThreshold?: (progress: number) => void,
): Promise<NumberCandidate[]> {
    const all: NumberCandidate[] = [];

    for (let index = 0; index < THRESHOLDS.length; index += 1) {
        const threshold = THRESHOLDS[index];
        const glyphs = extractGlyphs(image.data, image.width, image.height, threshold);
        all.push(...findSequences(glyphs, digitLength, threshold));

        onThreshold?.((index + 1) / THRESHOLDS.length);
        await nextFrame();
    }

    return dedupeCandidates(all);
}
