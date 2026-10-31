import type { GlyphBox, NumberCandidate } from '@/lib/ticketNumberDetector';

/**
 * Self-supervised digit templates.
 *
 * Tesseract is very good at reading clean ticket digits, but the font used on
 * some tickets makes 5 and 6 (and occasionally 3/8) look nearly identical. Once
 * a photo has been read, the high-confidence digits provide a font-specific
 * template for every digit. Comparing each glyph to those templates is much
 * more reliable than asking a general-purpose OCR model to disambiguate an
 * isolated glyph.
 */

const TEMPLATE_WIDTH = 24;
const TEMPLATE_HEIGHT = 32;
const TEMPLATE_SIZE = TEMPLATE_WIDTH * TEMPLATE_HEIGHT;

export type TemplateReading = {
    number: string | null;
    confidence: number;
};

export type GlyphClassification = {
    number: string;
    meanDistance: number;
    maxDistance: number;
};

function inkAt(gray: Uint8ClampedArray, width: number, x: number, y: number, threshold: number) {
    return gray[y * width + x] < threshold ? 1 : 0;
}

/**
 * Crop one glyph, trim its white border, and resample it to a fixed 24x32
 * bitmap. The result is a 0..1 ink map that can be compared by mean squared
 * distance.
 */
export function normalizeGlyph(gray: Uint8ClampedArray, width: number, height: number, candidate: NumberCandidate, glyph: GlyphBox) {
    const sourceX = Math.max(0, glyph.x - 1);
    const sourceY = Math.max(0, glyph.y - 1);
    const sourceRight = Math.min(width, glyph.x + glyph.w + 1);
    const sourceBottom = Math.min(height, glyph.y + glyph.h + 1);
    // Candidate boxes can come from a high binarisation threshold where faint
    // ticket artwork touches a glyph. A slightly lower threshold gives the
    // template matcher a cleaner glyph without changing the OCR image.
    const threshold = Math.min(candidate.threshold, 115);

    let minX = sourceRight;
    let minY = sourceBottom;
    let maxX = -1;
    let maxY = -1;

    for (let y = sourceY; y < sourceBottom; y += 1) {
        for (let x = sourceX; x < sourceRight; x += 1) {
            if (inkAt(gray, width, x, y, threshold) === 0) continue;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
    }

    const result = new Float32Array(TEMPLATE_SIZE);
    if (maxX < minX || maxY < minY) return result;

    const inkWidth = maxX - minX + 1;
    const inkHeight = maxY - minY + 1;

    for (let targetY = 0; targetY < TEMPLATE_HEIGHT; targetY += 1) {
        const sourceCenterY = ((targetY + 0.5) * inkHeight) / TEMPLATE_HEIGHT - 0.5;
        const y0 = Math.floor(sourceCenterY);
        const fy = sourceCenterY - y0;

        for (let targetX = 0; targetX < TEMPLATE_WIDTH; targetX += 1) {
            const sourceCenterX = ((targetX + 0.5) * inkWidth) / TEMPLATE_WIDTH - 0.5;
            const x0 = Math.floor(sourceCenterX);
            const fx = sourceCenterX - x0;

            const xa = Math.min(inkWidth - 1, Math.max(0, x0));
            const xb = Math.min(inkWidth - 1, Math.max(0, x0 + 1));
            const ya = Math.min(inkHeight - 1, Math.max(0, y0));
            const yb = Math.min(inkHeight - 1, Math.max(0, y0 + 1));

            const top = inkAt(gray, width, minX + xa, minY + ya, threshold) * (1 - fx) + inkAt(gray, width, minX + xb, minY + ya, threshold) * fx;
            const bottom = inkAt(gray, width, minX + xa, minY + yb, threshold) * (1 - fx) + inkAt(gray, width, minX + xb, minY + yb, threshold) * fx;

            result[targetY * TEMPLATE_WIDTH + targetX] = top * (1 - fy) + bottom * fy;
        }
    }

    return result;
}

function distance(a: Float32Array, b: Float32Array) {
    let total = 0;
    for (let index = 0; index < a.length; index += 1) {
        const difference = a[index] - b[index];
        total += difference * difference;
    }
    return total / a.length;
}

/**
 * Build one average template per digit from the high-confidence OCR readings
 * of this photo. Returns null when the photo contains too few reliable digits
 * to cover all ten classes.
 */
export function buildDigitTemplates(
    gray: Uint8ClampedArray,
    width: number,
    height: number,
    candidates: NumberCandidate[],
    readings: TemplateReading[],
    minimumConfidence = 80,
) {
    const sums = Array.from({ length: 10 }, () => new Float32Array(TEMPLATE_SIZE));
    const counts = new Uint32Array(10);

    for (let index = 0; index < candidates.length; index += 1) {
        const reading = readings[index];
        const candidate = candidates[index];

        if (!reading?.number || reading.confidence < minimumConfidence) continue;
        if (reading.number.length !== candidate.glyphs.length) continue;

        for (let glyphIndex = 0; glyphIndex < candidate.glyphs.length; glyphIndex += 1) {
            const digit = reading.number.charCodeAt(glyphIndex) - 48;
            if (digit < 0 || digit > 9) continue;

            const vector = normalizeGlyph(gray, width, height, candidate, candidate.glyphs[glyphIndex]);
            const sum = sums[digit];
            for (let pixel = 0; pixel < TEMPLATE_SIZE; pixel += 1) {
                sum[pixel] += vector[pixel];
            }
            counts[digit] += 1;
        }
    }

    // Fewer than two examples of a digit means the template is too fragile to
    // trust for corrections.
    for (let digit = 0; digit < 10; digit += 1) {
        if (counts[digit] < 2) return null;
    }

    for (let digit = 0; digit < 10; digit += 1) {
        for (let pixel = 0; pixel < TEMPLATE_SIZE; pixel += 1) {
            sums[digit][pixel] /= counts[digit];
        }
    }

    return sums;
}

export function classifyCandidate(
    gray: Uint8ClampedArray,
    width: number,
    height: number,
    candidate: NumberCandidate,
    templates: Float32Array[],
): GlyphClassification {
    let number = '';
    let totalDistance = 0;
    let maxDistance = 0;

    for (const glyph of candidate.glyphs) {
        const vector = normalizeGlyph(gray, width, height, candidate, glyph);

        let bestDigit = 0;
        let bestDistance = Number.POSITIVE_INFINITY;

        for (let digit = 0; digit < 10; digit += 1) {
            const current = distance(vector, templates[digit]);
            if (current < bestDistance) {
                bestDistance = current;
                bestDigit = digit;
            }
        }

        number += String(bestDigit);
        totalDistance += bestDistance;
        if (bestDistance > maxDistance) maxDistance = bestDistance;
    }

    const glyphCount = Math.max(1, candidate.glyphs.length);

    return {
        number,
        meanDistance: totalDistance / glyphCount,
        maxDistance,
    };
}
