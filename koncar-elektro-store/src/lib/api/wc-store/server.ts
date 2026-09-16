import { fetchJson, fetchJsonPaginated } from '@/lib/api/client';
import { serverWcStoreApiBase, serverWpApiBase } from '@/lib/api/server-config';
import type { WcStoreCategory, WcStoreProduct, WcStoreProductsQuery } from '@/lib/api/types/wc-store';
import { decodeWcCategory } from '@/lib/htmlEntities';
import {
  productSlugLookupVariants,
  productSlugsEqual,
  slugSearchFallbackQuery,
} from '@/lib/api/wc-store/productSlug';

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

async function fetchStoreProductsServer(
  searchParams: Record<string, string | number | boolean | undefined>,
): Promise<WcStoreProduct[]> {
  return fetchJson<WcStoreProduct[]>(serverWcStoreApiBase, '/products', { searchParams });
}

/** WC REST v3 accepts slugs with literal `%xx` that Store API `slug=` drops. */
async function fetchStoreProductViaV3Slug(slug: string): Promise<WcStoreProduct | null> {
  try {
    const rows = await fetchJson<Array<{ id?: number }>>(`${serverWpApiBase}/wc/v3`, '/products', {
      searchParams: { slug, per_page: 1, _fields: 'id' },
      wcAuth: true,
    });
    const id = rows[0]?.id;
    if (!id) return null;
    return fetchJson<WcStoreProduct>(serverWcStoreApiBase, `/products/${id}`);
  } catch {
    return null;
  }
}

export async function getStoreProductBySlugServer(
  slug: string,
): Promise<WcStoreProduct | null> {
  if (!slug.trim()) return null;

  for (const candidate of productSlugLookupVariants(slug)) {
    const products = await fetchStoreProductsServer({ slug: candidate, per_page: 1 });
    if (products[0]) return products[0];

    const fromV3 = await fetchStoreProductViaV3Slug(candidate);
    if (fromV3) return fromV3;
  }

  const search = slugSearchFallbackQuery(slug);
  if (!search) return null;

  const matches = await fetchStoreProductsServer({ search, per_page: 40 });
  return matches.find((product) => productSlugsEqual(product.slug, slug)) ?? null;
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
  return categories[0] ? decodeWcCategory(categories[0]) : null;
}
