import { useQuery } from '@tanstack/react-query';
import { mapStoreProductToCatalog } from '@/lib/api/mappers/product';
import { getStoreProducts } from '@/lib/api/wc-store/products';
import { useLiveApi } from '@/lib/api/config';

export function useProductSearch(query: string, enabled = true) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ['product-search', trimmed],
    queryFn: async () => {
      const products = await getStoreProducts({
        search: trimmed,
        per_page: 8,
        orderby: 'popularity',
      });
      return products.map(mapStoreProductToCatalog);
    },
    enabled: useLiveApi && enabled && trimmed.length >= 2,
    staleTime: 60 * 1000,
    retry: 1,
  });
}
