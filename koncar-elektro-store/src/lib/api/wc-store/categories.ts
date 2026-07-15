import { fetchJson } from '@/lib/api/client';
import { wcStoreApiBase } from '@/lib/api/config';
import type { WcStoreCategoriesQuery, WcStoreCategory } from '@/lib/api/types/wc-store';

export async function getStoreCategories(
  query: WcStoreCategoriesQuery = {},
): Promise<WcStoreCategory[]> {
  return fetchJson<WcStoreCategory[]>(wcStoreApiBase, '/products/categories', {
    searchParams: {
      page: query.page,
      per_page: query.per_page ?? 100,
      parent: query.parent,
      search: query.search,
      slug: query.slug,
    },
  });
}

export async function getStoreCategoryBySlug(slug: string): Promise<WcStoreCategory | null> {
  const categories = await getStoreCategories({ slug, per_page: 1 });
  return categories[0] ?? null;
}

export async function getStoreTopLevelCategories(): Promise<WcStoreCategory[]> {
  return getStoreCategories({ parent: 0, per_page: 100 });
}

/** Fetch all product categories (paginated, ~184 on live site). */
export async function fetchAllStoreCategories(): Promise<WcStoreCategory[]> {
  const { fetchJsonPaginated } = await import('@/lib/api/client');
  const all: WcStoreCategory[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const result = await fetchJsonPaginated<WcStoreCategory>(
      wcStoreApiBase,
      '/products/categories',
      { searchParams: { per_page: 100, page } },
    );
    all.push(...result.data);
    totalPages = result.totalPages;
    page += 1;
  }

  return all;
}
