import { wcAttributes } from '@/data/wcAttributes';

export const BRAND_ATTRIBUTE_SLUG = 'pa_proizvodjac';

export type ListingFilters = {
  brandSlugs?: string[];
  priceMin?: number;
  priceMax?: number;
  inStockOnly?: boolean;
};

export type BrandFilterOption = {
  label: string;
  slug: string;
};

export function getBrandFilterOptions(): BrandFilterOption[] {
  const attr = wcAttributes.find((a) => a.slug === BRAND_ATTRIBUTE_SLUG);
  return (
    attr?.terms.map((t) => ({ label: t.name, slug: t.slug })) ?? []
  ).sort((a, b) => a.label.localeCompare(b.label, 'sr'));
}

/** Store API expects prices in minor units (×100 for RSD). */
export function listingFiltersToSearchParams(
  filters: ListingFilters,
): Record<string, string> {
  const params: Record<string, string> = {};

  if (filters.brandSlugs?.length) {
    params['attributes[0][attribute]'] = BRAND_ATTRIBUTE_SLUG;
    params['attributes[0][slug]'] =
      filters.brandSlugs.length === 1
        ? filters.brandSlugs[0]
        : filters.brandSlugs.join(',');
  }
  if (filters.priceMin != null && filters.priceMin > 0) {
    params.min_price = String(Math.round(filters.priceMin * 100));
  }
  if (filters.priceMax != null && filters.priceMax > 0) {
    params.max_price = String(Math.round(filters.priceMax * 100));
  }
  if (filters.inStockOnly) {
    params.in_stock = 'true';
  }

  return params;
}

export const emptyListingFilters = (): ListingFilters => ({});

export function countActiveFilters(filters: ListingFilters): number {
  let count = 0;
  if (filters.brandSlugs?.length) count += filters.brandSlugs.length;
  if (filters.priceMin != null && filters.priceMin > 0) count += 1;
  if (filters.priceMax != null && filters.priceMax > 0) count += 1;
  if (filters.inStockOnly) count += 1;
  return count;
}
