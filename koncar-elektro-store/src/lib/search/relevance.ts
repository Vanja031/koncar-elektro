/**
 * Diacritic/case-insensitive text search helpers shared by the multi-word
 * product search (see `wc-store/products.ts` → `searchStoreProductsMultiWord`).
 */

/** Lowercase + strip Latin diacritics (č/ć/š/ž → c/c/s/z, đ/Đ → d). */
export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim();
}

/** Split a raw query into normalized, non-empty word tokens. */
export function tokenizeQuery(query: string): string[] {
  return normalizeSearchText(query)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 0);
}

export type RelevanceSource = {
  name: string;
  sku?: string;
  brand?: string;
  categories?: string[];
};

/**
 * Heuristic relevance score for a product against a set of query tokens.
 * Order-independent: rewards matches anywhere in the name/SKU/brand/category,
 * with bonuses for whole-word, prefix, and literal-phrase matches in the name.
 */
export function scoreProductRelevance(tokens: string[], source: RelevanceSource): number {
  if (tokens.length === 0) return 0;

  const nameNorm = normalizeSearchText(source.name);
  const skuNorm = source.sku ? normalizeSearchText(source.sku) : '';
  const brandNorm = source.brand ? normalizeSearchText(source.brand) : '';
  const categoryNorm = (source.categories ?? []).map(normalizeSearchText).join(' ');
  const nameWords = nameNorm.split(/[^a-z0-9]+/).filter(Boolean);

  let score = 0;

  const phrase = tokens.join(' ');
  if (tokens.length > 1 && nameNorm.includes(phrase)) score += 60;

  for (const token of tokens) {
    if (nameWords.includes(token)) score += 30;
    else if (nameNorm.startsWith(token)) score += 22;
    else if (nameNorm.includes(token)) score += 14;

    if (skuNorm.includes(token)) score += 18;
    if (brandNorm === token || brandNorm.includes(token)) score += 16;
    if (categoryNorm.includes(token)) score += 6;
  }

  return score;
}
