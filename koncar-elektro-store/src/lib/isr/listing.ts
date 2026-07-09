import type { ListingRouteParams } from '@/lib/routeParser';
import { isParentListingRoute, isLeafProgramListingRoute } from '@/lib/catalogUrls';
import { getParentListing, getProductListing, getProgramListing } from '@/data/catalogListing';
import { resolveListingCategorySlug } from '@/lib/wcSlugs';
import { fetchListingPageData } from '@/lib/isr/server';

/** Resolve WC category slug for ISR prefetch on listing pages. */
export function resolveListingWcSlug(
  categorySlug: string,
  parentSlug: string,
  listingSlug?: string,
): string | undefined {
  const parentData = isParentListingRoute(categorySlug, parentSlug, listingSlug)
    ? getParentListing(categorySlug, parentSlug)
    : undefined;

  if (parentData) return undefined;

  const listingData = listingSlug
    ? getProductListing(categorySlug, parentSlug, listingSlug)
    : isLeafProgramListingRoute(categorySlug, parentSlug, listingSlug)
      ? getProgramListing(categorySlug, parentSlug)
      : undefined;

  if (!listingData) return undefined;
  return resolveListingCategorySlug(parentSlug, listingSlug);
}

export async function fetchListingForRoute(params: ListingRouteParams) {
  const wcSlug = resolveListingWcSlug(
    params.categorySlug,
    params.parentSlug,
    params.listingSlug,
  );
  if (!wcSlug) return undefined;
  return fetchListingPageData(wcSlug);
}
