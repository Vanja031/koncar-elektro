import { useQuery } from '@tanstack/react-query';
import { mapStoreProductToDetail } from '@/lib/api/mappers/productDetail';
import { mapStoreProductToCatalog } from '@/lib/api/mappers/product';
import { getStoreProductBySlug, getStoreProducts, getStoreProductsPaginated } from '@/lib/api/wc-store/products';
import { getStoreCategories } from '@/lib/api/wc-store/categories';
import { useLiveApi } from '@/lib/api/config';
import type { WcStoreProductsQuery } from '@/lib/api/types/wc-store';
import type { WcStoreCategory } from '@/lib/api/types/wc-store';
import { toWcParentSlug } from '@/lib/wcSlugs';
import type { ListingFilters } from '@/lib/listingFilters';
import { listingFiltersToSearchParams } from '@/lib/listingFilters';
import type { ListingSort } from '@/lib/listingSort';
import { listingSortToStoreQuery } from '@/lib/listingSort';

export function useLiveProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ['live-product', slug],
    queryFn: async () => {
      if (!slug) return null;
      const product = await getStoreProductBySlug(slug);
      return product ? mapStoreProductToDetail(product) : null;
    },
    enabled: useLiveApi && Boolean(slug),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export type LiveProductsOptions = {
  page?: number;
  perPage?: number;
  sort?: ListingSort;
  filters?: ListingFilters;
};

function buildProductsQuery(
  categorySlug: string,
  options: LiveProductsOptions,
): WcStoreProductsQuery {
  const { page = 1, perPage = 24, sort = 'bestsellers', filters = {} } = options;
  const sortQuery = listingSortToStoreQuery(sort);
  const filterParams = listingFiltersToSearchParams(filters);
  const { min_price, max_price, ...attributeParams } = filterParams;

  return {
    category: categorySlug,
    page,
    per_page: perPage,
    ...sortQuery,
    in_stock: filters.inStockOnly ? true : undefined,
    attributeParams,
    min_price: min_price ? Number(min_price) : undefined,
    max_price: max_price ? Number(max_price) : undefined,
  };
}

export function useLiveProductsByCategory(
  categorySlug: string | undefined,
  options: LiveProductsOptions = {},
) {
  const { page = 1, perPage = 24, sort = 'bestsellers', filters = {} } = options;

  return useQuery({
    queryKey: ['live-products', categorySlug, page, perPage, sort, filters],
    queryFn: async () => {
      if (!categorySlug) {
        return { products: [], total: 0, totalPages: 0, page: 1 };
      }
      const result = await getStoreProductsPaginated(buildProductsQuery(categorySlug, options));
      return {
        products: result.data.map(mapStoreProductToCatalog),
        total: result.total,
        totalPages: result.totalPages,
        page,
      };
    },
    enabled: useLiveApi && Boolean(categorySlug),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useLiveRelatedProducts(categorySlug: string | undefined, excludeId?: number) {
  return useQuery({
    queryKey: ['live-related', categorySlug, excludeId],
    queryFn: async () => {
      if (!categorySlug) return [];
      const products = await getStoreProducts({
        category: categorySlug,
        per_page: 8,
        orderby: 'popularity',
      });
      return products
        .filter((p) => p.id !== excludeId)
        .slice(0, 6)
        .map(mapStoreProductToCatalog);
    },
    enabled: useLiveApi && Boolean(categorySlug),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLiveSaleProducts(options: { page?: number; perPage?: number } = {}) {
  const { page = 1, perPage = 48 } = options;

  return useQuery({
    queryKey: ['live-sale-products', page, perPage],
    queryFn: async () => {
      const result = await getStoreProductsPaginated({
        on_sale: true,
        per_page: perPage,
        page,
        orderby: 'popularity',
      });
      return {
        products: result.data.map(mapStoreProductToCatalog),
        total: result.total,
        totalPages: result.totalPages,
        page,
      };
    },
    enabled: useLiveApi,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useLiveBestSellers(
  options: { page?: number; perPage?: number; categorySlug?: string } = {},
) {
  const { page = 1, perPage = 12, categorySlug } = options;

  return useQuery({
    queryKey: ['live-best-sellers', page, perPage, categorySlug],
    queryFn: async () => {
      const result = await getStoreProductsPaginated({
        category: categorySlug,
        page,
        per_page: perPage,
        orderby: 'popularity',
      });
      return {
        products: result.data.map(mapStoreProductToCatalog),
        total: result.total,
        totalPages: result.totalPages,
        page,
      };
    },
    enabled: useLiveApi,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useLiveSearchProducts(
  options: LiveProductsOptions & {
    search?: string;
    category?: string;
    onSale?: boolean;
  } = {},
) {
  const {
    search,
    category,
    onSale,
    page = 1,
    perPage = 24,
    sort = 'bestsellers',
    filters = {},
  } = options;

  const hasQuery = Boolean(search?.trim()) || Boolean(category) || onSale;

  return useQuery({
    queryKey: ['live-search-products', search, category, onSale, page, perPage, sort, filters],
    queryFn: async () => {
      const sortQuery = listingSortToStoreQuery(sort);
      const filterParams = listingFiltersToSearchParams(filters);
      const { min_price, max_price, ...attributeParams } = filterParams;

      const result = await getStoreProductsPaginated({
        search: search?.trim() || undefined,
        category,
        on_sale: onSale ? true : undefined,
        page,
        per_page: perPage,
        ...sortQuery,
        in_stock: filters.inStockOnly ? true : undefined,
        attributeParams,
        min_price: min_price ? Number(min_price) : undefined,
        max_price: max_price ? Number(max_price) : undefined,
      });

      return {
        products: result.data.map(mapStoreProductToCatalog),
        total: result.total,
        totalPages: result.totalPages,
        page,
      };
    },
    enabled: useLiveApi && hasQuery,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useLiveSaleCount(categorySlug: string | undefined) {
  return useQuery({
    queryKey: ['live-sale-count', categorySlug],
    queryFn: async () => {
      if (!categorySlug) return 0;
      const result = await getStoreProductsPaginated({
        category: categorySlug,
        on_sale: true,
        per_page: 1,
      });
      return result.total;
    },
    enabled: useLiveApi && Boolean(categorySlug),
    staleTime: 5 * 60 * 1000,
  });
}

export function useWcCategories(parent?: number) {
  return useQuery({
    queryKey: ['wc-categories', parent ?? 'all'],
    queryFn: () => getStoreCategories({ per_page: 100, parent }),
    enabled: useLiveApi,
    staleTime: 30 * 60 * 1000,
  });
}

/** WC category slug for Store API `category` filter from route segments. */
export function resolveListingCategorySlug(
  parentSlug: string,
  listingSlug?: string,
): string {
  // Leaf categories can be nested (e.g. `mid/leaf`); the Store API filters by the
  // deepest slug, so always use the last path segment.
  if (listingSlug) {
    const segments = listingSlug.split('/').filter(Boolean);
    return segments[segments.length - 1] ?? listingSlug;
  }
  return toWcParentSlug(parentSlug);
}

export type { WcStoreCategory };
