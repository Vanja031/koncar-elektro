import { useQuery } from '@tanstack/react-query';
import { mapStoreProductToDetail } from '@/lib/api/mappers/productDetail';
import { mapStoreProductToCatalog } from '@/lib/api/mappers/product';
import { getStoreProductBySlug, getStoreProducts, getStoreProductsPaginated } from '@/lib/api/wc-store/products';
import { getStoreCategories } from '@/lib/api/wc-store/categories';
import { useLiveApi } from '@/lib/api/config';
import type { WcStoreProductsQuery } from '@/lib/api/types/wc-store';
import type { WcStoreCategory } from '@/lib/api/types/wc-store';
import type { ListingFilters } from '@/lib/listingFilters';
import {
  countActiveFilters,
  listingFiltersToSearchParams,
  resolveFilterCategorySlug,
} from '@/lib/listingFilters';
import type { ListingSort } from '@/lib/listingSort';
import { listingSortToStoreQuery } from '@/lib/listingSort';
import type { ProductDetail } from '@/data/productDetail';
import type { CatalogProduct } from '@/data/catalogListing';

export { resolveListingCategorySlug } from '@/lib/wcSlugs';
export function useLiveProduct(
  slug: string | undefined,
  initialData?: ProductDetail | null,
) {
  return useQuery({
    queryKey: ['live-product', slug],
    queryFn: async () => {
      if (!slug) return null;
      const product = await getStoreProductBySlug(slug);
      return product ? mapStoreProductToDetail(product) : null;
    },
    enabled: useLiveApi && Boolean(slug),
    initialData: initialData ?? undefined,
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

export type LiveProductsResult = {
  products: CatalogProduct[];
  total: number;
  totalPages: number;
  page: number;
};

export function useLiveProductsByCategory(
  categorySlug: string | undefined,
  options: LiveProductsOptions = {},
  initialData?: LiveProductsResult,
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
    initialData,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useLiveRelatedProducts(
  categorySlug: string | undefined,
  excludeId?: number,
  initialData?: CatalogProduct[],
) {
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
    initialData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLiveSaleProducts(
  options: {
    page?: number;
    perPage?: number;
    filters?: ListingFilters;
  } = {},
  initialData?: LiveProductsResult,
) {
  const { page = 1, perPage = 48, filters = {} } = options;
  const filterParams = listingFiltersToSearchParams(filters);
  const { min_price, max_price, ...attributeParams } = filterParams;
  const hasFilters = countActiveFilters(filters) > 0;

  return useQuery({
    queryKey: ['live-sale-products', page, perPage, filters],
    queryFn: async () => {
      const result = await getStoreProductsPaginated({
        on_sale: true,
        category: resolveFilterCategorySlug(filters),
        per_page: perPage,
        page,
        orderby: 'popularity',
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
    enabled: useLiveApi,
    initialData: hasFilters ? undefined : initialData,
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

  const hasAttributeFilters = Object.values(filters.attributes ?? {}).some((slugs) => slugs?.length);
  const hasQuery = Boolean(search?.trim()) || Boolean(category) || onSale || hasAttributeFilters;

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

export type { WcStoreCategory };
