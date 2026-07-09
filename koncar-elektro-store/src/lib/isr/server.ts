import { mapStoreProductToCatalog } from '@/lib/api/mappers/product';
import { mapStoreProductToDetail } from '@/lib/api/mappers/productDetail';
import {
  getStoreProductBySlugServer,
  getStoreProductsPaginatedServer,
  getStoreProductsServer,
} from '@/lib/api/wc-store/server';
import type { ProductDetail } from '@/data/productDetail';
import type { CatalogProduct } from '@/data/catalogListing';
import { listingSortToStoreQuery } from '@/lib/listingSort';

export type ProductPageData = {
  product: ProductDetail | null;
  related: CatalogProduct[];
};

/** Server fetch for ISR product pages (read-only, live WC API). */
export async function fetchProductPageData(slug: string): Promise<ProductPageData> {
  if (!slug) return { product: null, related: [] };

  try {
    const raw = await getStoreProductBySlugServer(slug);
    if (!raw) return { product: null, related: [] };

    const product = mapStoreProductToDetail(raw);
    const categorySlug = product.categorySlug;

    let related: CatalogProduct[] = [];
    if (categorySlug) {
      const siblings = await getStoreProductsServer({
        category: categorySlug,
        per_page: 8,
        orderby: 'popularity',
      });
      related = siblings
        .filter((p) => p.id !== product.id)
        .slice(0, 6)
        .map(mapStoreProductToCatalog);
    }

    return { product, related };
  } catch {
    return { product: null, related: [] };
  }
}

export type ListingPageData = {
  products: CatalogProduct[];
  total: number;
  totalPages: number;
  page: number;
};

/** Default listing (page 1, bestsellers) for ISR category pages. */
export async function fetchListingPageData(
  categorySlug: string,
  page = 1,
  perPage = 24,
): Promise<ListingPageData | null> {
  if (!categorySlug) return null;

  try {
    const sortQuery = listingSortToStoreQuery('bestsellers');
    const result = await getStoreProductsPaginatedServer({
      category: categorySlug,
      page,
      per_page: perPage,
      ...sortQuery,
    });

    return {
      products: result.data.map(mapStoreProductToCatalog),
      total: result.total,
      totalPages: result.totalPages,
      page,
    };
  } catch {
    return null;
  }
}

/** Sale listing page 1 for ISR. */
export async function fetchSalePageData(
  page = 1,
  perPage = 48,
): Promise<ListingPageData> {
  try {
    const result = await getStoreProductsPaginatedServer({
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
  } catch {
    return { products: [], total: 0, totalPages: 0, page: 1 };
  }
}
