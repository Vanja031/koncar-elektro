import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStoreProductsForAttributeFacets } from '@/lib/api/wc-store/products';
import { useLiveApi } from '@/lib/api/config';
import {
  buildAttributeFilterGroups,
  collectAttributeFacets,
  listingFiltersToSearchParams,
  type AttributeFilterGroup,
  type ListingFilters,
} from '@/lib/listingFilters';

export type ListingFacetContext = {
  category?: string;
  search?: string;
  onSale?: boolean;
  /**
   * Attribute filters that define the listing scope (e.g. manufacturer brand).
   * Facet counts are computed within this subset of the catalog.
   */
  scopeAttributes?: Record<string, string[]>;
};

/**
 * Derives which attribute filters are relevant for the current listing.
 * Builds facets from Store API product attributes (full result set, light
 * `_fields=attributes` pages) so taxonomy/slug stay correct on live and staging.
 */
export function useListingAttributeGroups(
  context: ListingFacetContext,
  filters: ListingFilters,
): {
  groups: AttributeFilterGroup[];
  isLoading: boolean;
} {
  const scopeAttributes = context.scopeAttributes;
  const hasScopeAttributes = Object.values(scopeAttributes ?? {}).some((slugs) => slugs?.length);
  const hasContext =
    Boolean(context.category?.trim()) ||
    Boolean(context.search?.trim()) ||
    Boolean(context.onSale) ||
    hasScopeAttributes;

  const scopeParams = useMemo(
    () =>
      hasScopeAttributes
        ? listingFiltersToSearchParams({ attributes: scopeAttributes })
        : undefined,
    [hasScopeAttributes, scopeAttributes],
  );

  const facetsQuery = useQuery({
    queryKey: [
      'listing-attr-facets',
      context.category ?? null,
      context.search?.trim() || null,
      context.onSale ?? false,
      scopeParams ?? null,
    ],
    queryFn: async () => {
      const products = await getStoreProductsForAttributeFacets({
        category: context.category?.trim() || undefined,
        search: context.search?.trim() || undefined,
        on_sale: context.onSale ? true : undefined,
        attributeParams: scopeParams,
      });
      return collectAttributeFacets(products);
    },
    enabled: useLiveApi && hasContext,
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
