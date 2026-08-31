import { stripHtmlToText } from '@/lib/htmlEntities';

export type DescriptionSpec = {
  label: string;
  value: string;
};

/** Matches "Tehničke karakteristike" and the common WP typo "Tehničke karkteristike" (with or without diacritics). */
const HEADING_REGEX = /tehni[cč]ke\s+kar[a-z]*istike[^<]*/i;

/**
 * Some descriptions drop "Tehničke" and use a bare "Karakteristike proizvoda:" heading instead
 * (e.g. Hyundai listings). Only used when the primary heading above isn't found, and requires
 * the "proizvoda" suffix so we don't match unrelated marketing sentences that merely mention
 * "karakteristike".
 */
const FALLBACK_HEADING_REGEX = /\bkar[a-z]*istike\s+proizvoda[^<]*/i;

/** How far past the heading we'll look for the bullet list — keeps us from grabbing an unrelated list further down the description. */
const MAX_HEADING_TO_LIST_GAP = 400;

/** Defensive cap so a malformed description can't blow up the specs table. */
const MAX_SPECS = 30;

type ListRange = { start: number; end: number };

function findFirstListAfter(html: string, fromIndex: number): ListRange | null {
  const window = html.slice(fromIndex, fromIndex + MAX_HEADING_TO_LIST_GAP);
  const openMatch = /<(ul|ol)[^>]*>/i.exec(window);
  if (!openMatch) return null;

  const tagName = openMatch[1].toLowerCase();
  const start = fromIndex + openMatch.index + openMatch[0].length;
  const closeMatch = new RegExp(`</${tagName}>`, 'i').exec(html.slice(start));
  if (!closeMatch) return null;

  return { start, end: start + closeMatch.index };
}

function parseSpecLine(liHtml: string): DescriptionSpec | null {
  const text = stripHtmlToText(liHtml);
  if (!text) return null;

  const colonIndex = text.indexOf(':');
  if (colonIndex === -1) return null;

  const label = text.slice(0, colonIndex).trim();
  const value = text.slice(colonIndex + 1).trim();
  if (!label || !value) return null;

  return { label, value };
}

/**
 * Parses the "Tehničke karakteristike proizvoda:" bullet list that WooCommerce product
 * descriptions embed as HTML, e.g.:
 *
 *   <p><strong>Tehničke karakteristike proizvoda:</strong></p>
 *   <ul><li>Snaga: 190 W</li><li>Težina: 1,4 kg.</li></ul>
 *
 * Bullets without a "Label: value" shape (plain marketing bullets, package contents, etc.)
 * are skipped here — that text still renders in full on the "Opis" tab, so nothing is lost.
 */
export function extractSpecsFromDescriptionHtml(html: string | undefined | null): DescriptionSpec[] {
  if (!html) return [];

  const headingMatch = HEADING_REGEX.exec(html) ?? FALLBACK_HEADING_REGEX.exec(html);
  if (!headingMatch) return [];

  const list = findFirstListAfter(html, headingMatch.index + headingMatch[0].length);
  if (!list) return [];

  const listHtml = html.slice(list.start, list.end);
  const items = listHtml.match(/<li[^>]*>[\s\S]*?<\/li>/gi) ?? [];

  const specs: DescriptionSpec[] = [];
  const seenLabels = new Set<string>();

  for (const item of items) {
    const spec = parseSpecLine(item);
    if (!spec) continue;

    const key = spec.label.toLowerCase();
    if (seenLabels.has(key)) continue;
    seenLabels.add(key);

    specs.push(spec);
    if (specs.length >= MAX_SPECS) break;
  }

  return specs;
}
