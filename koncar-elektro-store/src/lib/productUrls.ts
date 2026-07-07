import { getProductUrl as getMockProductUrl } from '@/data/productDetail';
import { getProdavnicaUrl, ROUTES } from '@/lib/catalogUrls';

type ProductWithSlug = {
  id: number;
  categorySlug?: string;
  slug?: string;
  permalink?: string;
};

/** Resolve product URL — live API products use WC permalink; mock uses id lookup. */
export function getCatalogProductUrl(product: ProductWithSlug): string {
  if (product.permalink) {
    try {
      const path = new URL(product.permalink).pathname.replace(/\/$/, '');
      if (path.startsWith(`${ROUTES.prodavnica}/`)) return `${path}/`;
    } catch {
      /* fall through */
    }
  }
  if (product.slug && product.categorySlug) {
    return getProdavnicaUrl(product.categorySlug, product.slug);
  }
  return getMockProductUrl(product.id);
}
