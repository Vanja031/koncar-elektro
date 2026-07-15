import { fetchJson, fetchJsonPaginated } from '@/lib/api/client';
import { wcStoreApiBase } from '@/lib/api/config';
import type { WcStoreProduct, WcStoreProductsQuery } from '@/lib/api/types/wc-store';
import type { PaginatedResult } from '@/lib/api/client';
import { getAttributeValue } from '@/lib/api/mappers/product';
import { BRAND_ATTRIBUTE_SLUG } from '@/lib/listingFilters';
import { scoreProductRelevance, tokenizeQuery } from '@/lib/search/relevance';

const productsSearchParams = (query: WcStoreProductsQuery = {}) => ({
  page: query.page,
  per_page: query.per_page ?? 20,
  search: query.search,
  slug: query.slug,
  category: query.category,
  orderby: query.orderby,
  order: query.order,
  on_sale: query.on_sale ? 'true' : undefined,
  in_stock: query.in_stock ? 'true' : undefined,
  min_price: query.min_price,
  max_price: query.max_price,
  ...query.attributeParams,
});

export async function getStoreProducts(
  query: WcStoreProductsQuery = {},
): Promise<WcStoreProduct[]> {
  return fetchJson<WcStoreProduct[]>(wcStoreApiBase, '/products', {
    searchParams: productsSearchParams(query),
  });
}

export async function getStoreProductsPaginated(
  query: WcStoreProductsQuery = {},
): Promise<PaginatedResult<WcStoreProduct>> {
  return fetchJsonPaginated<WcStoreProduct>(wcStoreApiBase, '/products', {
    searchParams: productsSearchParams(query),
  });
}

const MULTI_WORD_TOKEN_PER_PAGE = 100;
/** Safety cap per token (3 × 100 = 300 candidates) — plenty for a boutique catalog. */
const MULTI_WORD_TOKEN_MAX_PAGES = 3;

/** Fetch every match for a single word (up to the safety cap), same filters as the full query. */
async function fetchAllMatchesForToken(
  token: string,
  baseQuery: WcStoreProductsQuery,
): Promise<WcStoreProduct[]> {
  const all: WcStoreProduct[] = [];
  let page = 1;
  while (page <= MULTI_WORD_TOKEN_MAX_PAGES) {
    const result = await getStoreProductsPaginated({
      ...baseQuery,
      search: token,
      page,
      per_page: MULTI_WORD_TOKEN_PER_PAGE,
    });
    all.push(...result.data);
    if (result.data.length < MULTI_WORD_TOKEN_PER_PAGE || all.length >= result.total) break;
    page += 1;
  }
  return all;
}

function toRelevanceSource(product: WcStoreProduct) {
  return {
    name: product.name,
    sku: product.sku,
    brand: getAttributeValue(product, 'Proizvodjač', 'Proizvođač', 'Proizvodjac', BRAND_ATTRIBUTE_SLUG),
    categories: product.categories?.map((c) => c.name),
  };
}

/**
 * WooCommerce Store API's `search` matches multi-word queries as something
 * close to a literal phrase, so "kruna bihui" finds nothing even though
 * "kruna" and "bihui" each match plenty of products individually. This
 * fetches per-word candidate sets and intersects them (AND across words,
 * any order, matched independently on title/content/SKU/etc.), then ranks
 * the result by a relevance heuristic before paginating locally.
 *
 * Single-word (or empty) queries pass straight through to the normal
 * paginated endpoint — no behavior change there.
 */
export async function searchStoreProductsMultiWord(
  query: WcStoreProductsQuery = {},
): Promise<PaginatedResult<WcStoreProduct>> {
  const tokens = tokenizeQuery(query.search ?? '');
  const page = query.page ?? 1;
  const perPage = query.per_page ?? 20;

  if (tokens.length <= 1) {
    return getStoreProductsPaginated(query);
  }

  const baseQuery: WcStoreProductsQuery = { ...query, search: undefined, page: undefined, per_page: undefined };
  const tokenResultSets = await Promise.all(
    tokens.map((token) => fetchAllMatchesForToken(token, baseQuery)),
  );

  const [primarySet, ...restSets] = tokenResultSets;
  const byId = new Map(primarySet.map((p) => [p.id, p]));
  for (const set of restSets) {
    const ids = new Set(set.map((p) => p.id));
    for (const id of [...byId.keys()]) {
      if (!ids.has(id)) byId.delete(id);
    }
  }

  let matched = [...byId.values()];

  // Strict AND across every word found nothing — relax to "matched the most
  // words" so a slightly-off multi-word query still surfaces something useful.
  if (matched.length === 0) {
    const counts = new Map<number, { product: WcStoreProduct; count: number }>();
    for (const set of tokenResultSets) {
      for (const p of set) {
        const entry = counts.get(p.id);
        if (entry) entry.count += 1;
        else counts.set(p.id, { product: p, count: 1 });
      }
    }
    const maxCount = Math.max(0, ...[...counts.values()].map((v) => v.count));
    if (maxCount > 0) {
      matched = [...counts.values()].filter((v) => v.count === maxCount).map((v) => v.product);
    }
  }

  const explicitSort = query.orderby && query.orderby !== 'popularity';
  if (explicitSort) {
    // Preserve WC's own ordering (already correct for price/date/title) by
    // filtering the first token's sorted list down to the matched id set.
    const matchedIds = new Set(matched.map((p) => p.id));
    const ordered = primarySet.filter((p) => matchedIds.has(p.id));
    const orderedIds = new Set(ordered.map((p) => p.id));
    matched = [...ordered, ...matched.filter((p) => !orderedIds.has(p.id))];
  } else {
    // Tiebreak equal relevance scores using each product's rank in the
    // (popularity-sorted, by default) first-token result set.
    const popularityRank = new Map(primarySet.map((p, idx) => [p.id, idx]));
    matched = matched
      .map((product) => ({
        product,
        score: scoreProductRelevance(tokens, toRelevanceSource(product)),
        rank: popularityRank.get(product.id) ?? Number.MAX_SAFE_INTEGER,
      }))
      .sort((a, b) => b.score - a.score || a.rank - b.rank)
      .map(({ product }) => product);
  }

  const total = matched.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;

  return { data: matched.slice(start, start + perPage), total, totalPages };
}

export async function getStoreProductBySlug(slug: string): Promise<WcStoreProduct | null> {
  const products = await getStoreProducts({ slug, per_page: 1 });
  return products[0] ?? null;
}

export async function getStoreProductById(id: number): Promise<WcStoreProduct> {
  return fetchJson<WcStoreProduct>(wcStoreApiBase, `/products/${id}`);
}

/** Thumbnail/src of the first (most popular) product in a category. */
export async function getFirstProductImageForCategory(
  categorySlug: string,
): Promise<string | undefined> {
  const products = await getStoreProducts({
    category: categorySlug,
    per_page: 1,
    orderby: 'popularity',
  });
  const image = products[0]?.images?.[0];
  return image?.thumbnail || image?.src;
}

export type WcStoreAttributeCount = {
  term: number;
  count: number;
};

export type WcStoreCollectionData = {
  attribute_counts?: WcStoreAttributeCount[];
};

/**
 * Facet counts for product attributes in the current listing context.
 * Uses Store API `/products/collection-data` (covers the full result set, not just a page sample).
 */
export async function getStoreAttributeCounts(query: {
  category?: string;
  search?: string;
  on_sale?: boolean;
  taxonomies: string[];
}): Promise<WcStoreAttributeCount[]> {
  if (!query.taxonomies.length) return [];

  const searchParams: Record<string, string | number | boolean | undefined> = {
    category: query.category,
    search: query.search,
    on_sale: query.on_sale ? true : undefined,
  };

  query.taxonomies.forEach((taxonomy, index) => {
    searchParams[`calculate_attribute_counts[${index}][taxonomy]`] = taxonomy;
    searchParams[`calculate_attribute_counts[${index}][query_type]`] = 'or';
  });

  const data = await fetchJson<WcStoreCollectionData>(
    wcStoreApiBase,
    '/products/collection-data',
    { searchParams },
  );

  return data.attribute_counts ?? [];
}
