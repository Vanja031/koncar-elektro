import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStoreAttributeCounts } from '@/lib/api/wc-store/products';
import { useLiveApi } from '@/lib/api/config';
import {
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
 * Store API collection-data counts — only attrs/terms that exist on matching products.
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
      // No listing context — only keep already-selected attributes visible.
      return buildAttributeFilterGroups({}, filters.attributes);
    }

    if (!facetsQuery.isSuccess) {
      // Loading / error: don't flash the full global attribute dump.
      return buildAttributeFilterGroups({}, filters.attributes);
    }

    return buildAttributeFilterGroups(facetsQuery.data, filters.attributes);
  }, [hasContext, facetsQuery.isSuccess, facetsQuery.data, filters.attributes]);

  return {
    groups,
    isLoading: Boolean(useLiveApi && hasContext && facetsQuery.isLoading),
  };
}
