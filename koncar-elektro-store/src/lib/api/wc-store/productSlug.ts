/**
 * Product slugs occasionally contain literal percent-sequences (e.g. `%e2%80%b3`
 * for ″) when WP/WC mis-encoded a character into `post_name`. Browsers decode
 * those in the URL path, and the Store API `?slug=` filter often returns nothing
 * for `%` in the slug. These helpers keep lookup resilient across encodings.
 */

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Encode non-ASCII chars as lowercase `%xx` sequences (matches broken WP slugs). */
export function encodeNonAsciiAsPercentLiteral(value: string): string {
  return value.replace(/[^\x00-\x7F]/g, (ch) => encodeURIComponent(ch).toLowerCase());
}

/** Distinct slug strings to try against WC `slug=` / exact match. */
export function productSlugLookupVariants(slug: string): string[] {
  const out: string[] = [];
  const add = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !out.includes(trimmed)) out.push(trimmed);
  };

  add(slug);
  add(safeDecodeURIComponent(slug));
  add(encodeNonAsciiAsPercentLiteral(safeDecodeURIComponent(slug)));

  return out;
}

export function productSlugsEqual(a: string, b: string): boolean {
  const right = new Set(productSlugLookupVariants(b));
  return productSlugLookupVariants(a).some((variant) => right.has(variant));
}

/**
 * Compact search string for Store API fallback when `slug=` fails.
 * Prefer a single digit-bearing token (SKU-like) — multi-word Store `search`
 * is AND-ish and often returns empty for otherwise valid products.
 */
export function slugSearchFallbackQuery(slug: string): string {
  const tokens = safeDecodeURIComponent(slug)
    .replace(/%[0-9a-f]{2}/gi, ' ')
    .split(/[^a-zA-Z0-9šđčćžŠĐČĆŽ]+/u)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3);

  tokens.sort((a, b) => {
    const digitScore = Number(/\d/.test(b)) - Number(/\d/.test(a));
    if (digitScore !== 0) return digitScore;
    return b.length - a.length;
  });

  return tokens[0] ?? '';
}
