import { alatiSubcategories } from '@/data/categoryPages';
import { alatiMenuDefs } from '@/data/navigationMenuConfig';
import { MEGA_MENU_PARENT_SLUG } from '@/lib/catalogUrls';

const staticByInternalSlug = Object.fromEntries(
  alatiSubcategories.map((s) => [s.slug, s.image]),
);

const menuIdByInternalSlug = Object.fromEntries(
  Object.entries(MEGA_MENU_PARENT_SLUG).map(([menuId, internal]) => [internal, menuId]),
);

/** Curated/static thumbnail when live WC or product image is missing. */
export function getSubcategoryFallbackImage(internalSlug: string): string {
  if (staticByInternalSlug[internalSlug]) return staticByInternalSlug[internalSlug];
  const menuId = menuIdByInternalSlug[internalSlug];
  const def = menuId ? alatiMenuDefs.find((d) => d.id === menuId) : undefined;
  return def?.fallbackImage ?? '';
}

export function resolveSubcategoryImage(
  wcSlug: string | undefined,
  internalSlug: string,
  productImages: Record<string, string> | undefined,
  existingImage?: string,
): string {
  const key = wcSlug ?? internalSlug;
  const productImg = productImages?.[key];
  if (productImg) return productImg;

  const fallback = getSubcategoryFallbackImage(internalSlug);
  if (fallback) return fallback;

  if (existingImage && !existingImage.includes('product-generic')) {
    return existingImage;
  }

  return '';
}
