import { fetchJson, fetchJsonPaginated } from '@/lib/api/client';
import { serverWcStoreApiBase } from '@/lib/api/server-config';
import type { WcStoreCategory, WcStoreProduct, WcStoreProductsQuery } from '@/lib/api/types/wc-store';

function productsSearchParams(query: WcStoreProductsQuery = {}) {
  return {
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
  };
}

export async function getStoreProductBySlugServer(
  slug: string,
): Promise<WcStoreProduct | null> {
  const products = await fetchJson<WcStoreProduct[]>(serverWcStoreApiBase, '/products', {
    searchParams: { slug, per_page: 1 },
  });
  return products[0] ?? null;
}

export async function getStoreProductsServer(
  query: WcStoreProductsQuery = {},
): Promise<WcStoreProduct[]> {
  return fetchJson<WcStoreProduct[]>(serverWcStoreApiBase, '/products', {
    searchParams: productsSearchParams(query),
  });
}

export async function getStoreProductsPaginatedServer(
  query: WcStoreProductsQuery = {},
) {
  return fetchJsonPaginated<WcStoreProduct>(serverWcStoreApiBase, '/products', {
    searchParams: productsSearchParams(query),
  });
}

export async function getStoreCategoryBySlugServer(
  slug: string,
): Promise<WcStoreCategory | null> {
  const categories = await fetchJson<WcStoreCategory[]>(
    serverWcStoreApiBase,
    '/products/categories',
    { searchParams: { slug, per_page: 1 } },
  );
  return categories[0] ?? null;
}
