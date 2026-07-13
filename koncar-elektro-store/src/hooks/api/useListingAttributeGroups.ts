import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStoreAttributeCounts } from '@/lib/api/wc-store/products';
import { useLiveApi } from '@/lib/api/config';
import {
  BRAND_ATTRIBUTE_SLUG,
  buildAttributeFilterGroups,
  collectAttributeFacetsFromCounts,
  getFacetTaxonomies,
  type AttributeFilterGroup,
  type ListingFilters,
} from '@/lib/listingFilters';

export type ListingFacetContext = {
  category?: string;
  search?: string;
  onSale?: boolean;
};

/**
 * Derives which attribute filters are relevant for the current listing via
 * Store API collection-data counts (e.g. snaga on aku alat, not empty taxonomies).
 */
export function useListingAttributeGroups(
  context: ListingFacetContext,
  filters: ListingFilters,
): {
  groups: AttributeFilterGroup[];
  isLoading: boolean;
} {
  const hasContext =
    Boolean(context.category?.trim()) ||
    Boolean(context.search?.trim()) ||
    Boolean(context.onSale);

  const taxonomies = useMemo(() => getFacetTaxonomies(), []);

  const facetsQuery = useQuery({
    queryKey: [
      'listing-attr-facets',
      context.category ?? null,
      context.search?.trim() || null,
      context.onSale ?? false,
      taxonomies,
    ],
    queryFn: async () => {
      const counts = await getStoreAttributeCounts({
        category: context.category?.trim() || undefined,
        search: context.search?.trim() || undefined,
        on_sale: context.onSale ? true : undefined,
        taxonomies,
      });
      return collectAttributeFacetsFromCounts(counts);
    },
    enabled: useLiveApi && hasContext && taxonomies.length > 0,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const groups = useMemo(() => {
    if (!useLiveApi || !hasContext) {
      return buildAttributeFilterGroups(
        { [BRAND_ATTRIBUTE_SLUG]: new Set(['*']) },
        filters.attributes,
      );
    }

    const facets = facetsQuery.isSuccess ? facetsQuery.data : undefined;
    return buildAttributeFilterGroups(facets, filters.attributes);
  }, [hasContext, facetsQuery.isSuccess, facetsQuery.data, filters.attributes]);

  return {
    groups,
    isLoading: Boolean(useLiveApi && hasContext && facetsQuery.isLoading),
  };
}
