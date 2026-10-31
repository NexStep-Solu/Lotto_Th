/**
 * Helpers for turning OCR text / spreadsheet cells into lottery numbers.
 * Lottery numbers are fixed-length digit strings (6 for Thai, 7 for Singapore).
 */

function pushUnique(target: string[], seen: Set<string>, value: string, length: number) {
    if (value.length !== length || seen.has(value)) return;
    seen.add(value);
    target.push(value);
}

/**
 * Extract fixed-length numbers from raw OCR text.
 *
 * Handles:
 *  - contiguous numbers: `011781`
 *  - numbers split by spaces/hyphens by the OCR engine: `011 781`
 *  - several numbers on the same line: `011781 011780`
 *
 * Long digit runs (e.g. 12-digit serial numbers) are intentionally ignored
 * rather than split, to avoid creating false ticket numbers.
 */
export function extractNumbersFromText(text: string, length: number): string[] {
    const found: string[] = [];
    const seen = new Set<string>();

    for (const line of text.split(/\r?\n/)) {
        const groups = line.match(/\d+/g);
        if (!groups) continue;

        const compact = groups.join('');

        // A single number broken into groups, e.g. "011 781" or "011-781".
        if (compact.length === length) {
            pushUnique(found, seen, compact, length);
            continue;
        }

        // Otherwise keep every complete number on the line.
        for (const group of groups) {
            pushUnique(found, seen, group, length);
        }
    }

    // Fallback for a single number with stray line breaks around its digits.
    if (found.length === 0) {
        const compact = text.replace(/\D/g, '');
        if (compact.length === length) {
            pushUnique(found, seen, compact, length);
        }
    }

    return found;
}

/**
 * Normalise a spreadsheet cell into a lottery number.
 * Numeric cells lose leading zeros in Excel, so short numeric values are
 * padded back to the expected length (e.g. 11781 -> 011781).
 */
export function normalizeImportedNumber(value: unknown, length: number): string | null {
    if (value === null || value === undefined) return null;

    const raw = String(value).trim();
    if (!raw) return null;

    const digits = raw.replace(/\D/g, '');
    if (digits.length === length) return digits;

    // Preserve leading zeros for plain numeric cells (11781 -> 011781).
    if (/^\d+$/.test(raw) && digits.length > 0 && digits.length < length) {
        return digits.padStart(length, '0');
    }

    return null;
}

/**
 * Parse the numbers textarea. Accepts one number per line, and also comma or
 * semicolon separated values. Internal spaces are removed so grouped numbers
 * such as "011 781" are accepted.
 */
export function parseNumberList(value: string, length: number): { numbers: string[]; skipped: number } {
    const tokens = value
        .split(/[\n,;]+/)
        .map((token) => token.replace(/\s+/g, '').trim())
        .filter(Boolean);

    const numbers: string[] = [];
    let skipped = 0;

    for (const token of tokens) {
        if (/^\d+$/.test(token) && token.length === length) {
            numbers.push(token);
        } else {
            skipped++;
        }
    }

    return { numbers, skipped };
}
