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
  shortDescription?: string;
  description?: string;
};

const MIN_PREFIX_LEN = 4;

function haystackWords(haystack: string): string[] {
  return haystack.split(/[^a-z0-9]+/).filter(Boolean);
}

/** Flatten searchable product fields into one normalized string. */
export function buildProductSearchHaystack(source: RelevanceSource): string {
  return normalizeSearchText(
    [
      source.name,
      source.sku,
      source.brand,
      ...(source.categories ?? []),
      source.shortDescription,
      source.description,
    ]
      .filter(Boolean)
      .join(' '),
  );
}

/**
 * Whether a token appears in the haystack — substring or shared word prefix
 * (e.g. "cirkular" matches "cirkularna").
 */
export function tokenMatchesHaystack(token: string, haystack: string, words?: string[]): boolean {
  if (!token) return true;
  if (haystack.includes(token)) return true;

  if (token.length < MIN_PREFIX_LEN) return false;

  const nameWords = words ?? haystackWords(haystack);
  return nameWords.some(
    (word) =>
      word.startsWith(token) || (word.length >= MIN_PREFIX_LEN && token.startsWith(word)),
  );
}

/** All query tokens must match somewhere in the product's searchable fields. */
export function productMatchesAllTokens(source: RelevanceSource, tokens: string[]): boolean {
  if (tokens.length === 0) return true;

  const haystack = buildProductSearchHaystack(source);
  const words = haystackWords(haystack);
  return tokens.every((token) => tokenMatchesHaystack(token, haystack, words));
}

/** Count how many tokens match (for relaxed fallback ranking). */
export function countMatchingTokens(source: RelevanceSource, tokens: string[]): number {
  if (tokens.length === 0) return 0;

  const haystack = buildProductSearchHaystack(source);
  const words = haystackWords(haystack);
  return tokens.filter((token) => tokenMatchesHaystack(token, haystack, words)).length;
}

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
