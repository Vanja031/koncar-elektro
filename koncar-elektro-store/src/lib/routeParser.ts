import { alatiSubcategories } from '@/data/categoryPages';
import {
  PROGRAM_WC_SLUGS,
  toInternalParentSlug,
  wcToProgramSlug,
} from '@/lib/wcSlugs';

export type ListingRouteParams = {
  categorySlug: string;
  parentSlug: string;
  listingSlug?: string;
};

const alatiParentSlugs = new Set(alatiSubcategories.map((s) => s.slug));

/** Single-segment `/product-category/:slug` that renders a program hub (CategoryPage). */
export const isProgramCategoryHub = (segments: string[]): boolean =>
  segments.length === 1 && PROGRAM_WC_SLUGS.has(segments[0]);

export const parseProductCategoryPath = (segments: string[]): ListingRouteParams | null => {
  if (segments.length === 0) return null;

  const wcFirst = segments[0];
  const programSlug = wcToProgramSlug(wcFirst);

  if (programSlug) {
    if (segments.length === 1) {
      return { categorySlug: programSlug, parentSlug: programSlug };
    }
    return {
      categorySlug: programSlug,
      parentSlug: programSlug,
      listingSlug: segments.slice(1).join('/'),
    };
  }

  const parentSlug = toInternalParentSlug(wcFirst);
  if (!alatiParentSlugs.has(parentSlug)) return null;

  if (segments.length === 1) {
    return { categorySlug: 'alati', parentSlug };
  }

  return {
    categorySlug: 'alati',
    parentSlug,
    listingSlug: segments.slice(1).join('/'),
  };
};
