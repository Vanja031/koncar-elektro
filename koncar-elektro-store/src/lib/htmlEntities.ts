/** Decode WP/WooCommerce HTML entities in plain-text fields (React does not). */

const NAMED: Record<string, string> = {
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  times: '×',
  quot: '"',
  apos: "'",
  hellip: '…',
  lt: '<',
  gt: '>',
  amp: '&',
};

function fromCode(code: number): string {
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return '';
  try {
    return String.fromCodePoint(code);
  } catch {
    return '';
  }
}

function decodeOnce(str: string): string {
  return str
    .replace(/&([a-z]+);/gi, (match, name: string) => NAMED[name.toLowerCase()] ?? match)
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => fromCode(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code: string) => fromCode(Number(code)));
}

export function decodeHtmlEntities(str: string): string {
  if (!str) return str;
  let prev = '';
  let out = str;
  for (let i = 0; i < 3 && out !== prev; i += 1) {
    prev = out;
    out = decodeOnce(out);
  }
  return out;
}

export function stripHtmlToText(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

export function decodeWcCategory<T extends { name: string; description?: string }>(category: T): T {
  return {
    ...category,
    name: decodeHtmlEntities(category.name),
    ...(category.description != null
      ? { description: decodeHtmlEntities(category.description) }
      : {}),
  };
}
