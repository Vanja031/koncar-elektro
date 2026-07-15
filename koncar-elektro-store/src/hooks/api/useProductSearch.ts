import { useQuery } from '@tanstack/react-query';
import { mapStoreProductToCatalog } from '@/lib/api/mappers/product';
import { searchStoreProductsMultiWord } from '@/lib/api/wc-store/products';
import { useLiveApi } from '@/lib/api/config';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export function useProductSearch(query: string, enabled = true) {
  const trimmed = query.trim();
  const debounced = useDebouncedValue(trimmed, 250);

  return useQuery({
    queryKey: ['product-search', debounced],
    queryFn: async () => {
      const result = await searchStoreProductsMultiWord({
        search: debounced,
        per_page: 8,
        orderby: 'popularity',
      });
      return result.data.map(mapStoreProductToCatalog);
    },
    enabled: useLiveApi && enabled && debounced.length >= 2,
    staleTime: 60 * 1000,
    retry: 1,
  });
}
