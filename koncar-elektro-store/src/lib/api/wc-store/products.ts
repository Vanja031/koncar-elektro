import { fetchJson, fetchJsonPaginated } from '@/lib/api/client';
import { wcStoreApiBase } from '@/lib/api/config';
import type { WcStoreProduct, WcStoreProductsQuery } from '@/lib/api/types/wc-store';
import type { PaginatedResult } from '@/lib/api/client';

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
