import { useQuery } from '@tanstack/react-query';
import type { MegaMenuSubcategory } from '@/data/navigation';
import { useLiveApi } from '@/lib/api/config';
import { getFirstProductImageForCategory } from '@/lib/api/wc-store/products';

/** First product thumbnail per subcategory slug — for mega menu cards. */
export function useSubcategoryProductImages(subcategories: MegaMenuSubcategory[]) {
  const slugs = [...new Set(subcategories.map((s) => s.slug).filter((s): s is string => Boolean(s)))].sort();

  return useQuery({
    queryKey: ['subcategory-product-images', slugs],
    queryFn: async () => {
      const images: Record<string, string> = {};
      await Promise.all(
        slugs.map(async (slug) => {
          const src = await getFirstProductImageForCategory(slug);
          if (src) images[slug] = src;
        }),
      );
      return images;
    },
    enabled: useLiveApi && slugs.length > 0,
    staleTime: 60 * 60 * 1000,
  });
}
