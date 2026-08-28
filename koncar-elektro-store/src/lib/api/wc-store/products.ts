import { fetchJson, fetchJsonPaginated } from '@/lib/api/client';
import { wcStoreApiBase } from '@/lib/api/config';
import type { WcStoreProduct, WcStoreProductsQuery } from '@/lib/api/types/wc-store';
import type { PaginatedResult } from '@/lib/api/client';
import { getAttributeValue } from '@/lib/api/mappers/product';
import { BRAND_ATTRIBUTE_SLUG } from '@/lib/listingFilters';
import { decodeHtmlEntities } from '@/lib/htmlEntities';
import {
  countMatchingTokens,
  productMatchesAllTokens,
  scoreProductRelevance,
  tokenizeQuery,
} from '@/lib/search/relevance';

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

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function toRelevanceSource(product: WcStoreProduct) {
  return {
    name: decodeHtmlEntities(product.name),
    sku: product.sku,
    brand: getAttributeValue(
      product,
      'Proizvodjač',
      'Proizvođač',
      'Proizvodjac',
      'Brend',
      BRAND_ATTRIBUTE_SLUG,
      'pa_brend',
      'pa_proizvodjac',
    ),
    categories: product.categories?.map((c) => decodeHtmlEntities(c.name)),
    shortDescription: stripHtml(decodeHtmlEntities(product.short_description ?? '')),
    description: stripHtml(decodeHtmlEntities(product.description ?? '')),
  };
}

/**
 * WooCommerce Store API's `search` treats multi-word queries as a literal
 * phrase ("cirkular ingco" → 1 hit) and caps each single-word fetch by
 * popularity — intersecting those pages drops valid matches (e.g. INGCO
 * circular saws that aren't in the top 300 "ingco" hits).
 *
 * Strategy: union candidates from the full phrase + each token, then require
 * every token to match locally in name/SKU/brand/category/description before
 * ranking and paginating in-memory.
 *
 * Single-word queries pass straight through to the normal paginated endpoint.
 */
export async function searchStoreProductsMultiWord(
  query: WcStoreProductsQuery = {},
): Promise<PaginatedResult<WcStoreProduct>> {
  const rawSearch = query.search?.trim() ?? '';
  const tokens = tokenizeQuery(rawSearch);
  const page = query.page ?? 1;
  const perPage = query.per_page ?? 20;

  if (tokens.length <= 1) {
    return getStoreProductsPaginated(query);
  }

  const baseQuery: WcStoreProductsQuery = { ...query, search: undefined, page: undefined, per_page: undefined };
  const searchTerms = [...new Set([rawSearch, ...tokens])];
  const tokenResultSets = await Promise.all(
    searchTerms.map((term) => fetchAllMatchesForToken(term, baseQuery)),
  );

  const [primarySet] = tokenResultSets;
  const byId = new Map<number, WcStoreProduct>();
  for (const set of tokenResultSets) {
    for (const product of set) {
      if (!byId.has(product.id)) byId.set(product.id, product);
    }
  }

  let matched = [...byId.values()].filter((product) =>
    productMatchesAllTokens(toRelevanceSource(product), tokens),
  );

  if (matched.length === 0) {
    const scored = [...byId.values()]
      .map((product) => ({
        product,
        matchCount: countMatchingTokens(toRelevanceSource(product), tokens),
      }))
      .filter((entry) => entry.matchCount > 0);
    const maxCount = Math.max(0, ...scored.map((entry) => entry.matchCount));
    if (maxCount > 0) {
      matched = scored.filter((entry) => entry.matchCount === maxCount).map((entry) => entry.product);
    }
  }

  const explicitSort = query.orderby && query.orderby !== 'popularity';
  if (explicitSort) {
    const matchedIds = new Set(matched.map((p) => p.id));
    const ordered = primarySet.filter((p) => matchedIds.has(p.id));
    const orderedIds = new Set(ordered.map((p) => p.id));
    matched = [...ordered, ...matched.filter((p) => !orderedIds.has(p.id))];
  } else {
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
 * WooCommerce / nginx reject collection-data requests with too many
 * `calculate_attribute_counts` params (≈30+ taxonomies → HTTP 400). Batch
 * under that limit and merge — we currently sync ~39 filterable attributes.
 */
const ATTRIBUTE_COUNT_TAXONOMY_BATCH = 20;

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

  const batches: string[][] = [];
  for (let i = 0; i < query.taxonomies.length; i += ATTRIBUTE_COUNT_TAXONOMY_BATCH) {
    batches.push(query.taxonomies.slice(i, i + ATTRIBUTE_COUNT_TAXONOMY_BATCH));
  }

  const batchResults = await Promise.all(
    batches.map(async (taxonomies) => {
      const searchParams: Record<string, string | number | boolean | undefined> = {
        category: query.category,
        search: query.search,
        on_sale: query.on_sale ? true : undefined,
      };

      taxonomies.forEach((taxonomy, index) => {
        searchParams[`calculate_attribute_counts[${index}][taxonomy]`] = taxonomy;
        searchParams[`calculate_attribute_counts[${index}][query_type]`] = 'or';
      });

      const data = await fetchJson<WcStoreCollectionData>(
        wcStoreApiBase,
        '/products/collection-data',
        { searchParams },
      );

      return data.attribute_counts ?? [];
    }),
  );

  return batchResults.flat();
}
