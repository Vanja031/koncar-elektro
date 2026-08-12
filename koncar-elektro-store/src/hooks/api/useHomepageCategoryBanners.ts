import { useQuery } from '@tanstack/react-query';
import { useLiveApi } from '@/lib/api/config';
import { getStoreCategoryBySlug } from '@/lib/api/wc-store/categories';
import {
  fallbackHomepageCategoryBanners,
  getHomeBannerCategorySlugs,
  mapCategoryToHomepageBanner,
  type HomepageCategoryBanner,
} from '@/lib/homepageBanners';

/**
 * Homepage category promo banners from WooCommerce categories.
 * Edit in WP: Products → Categories (name, description, image).
 * Which categories: default slugs or `NEXT_PUBLIC_HOME_BANNER_CATEGORY_SLUGS`.
 */
export function useHomepageCategoryBanners() {
  const slugs = getHomeBannerCategorySlugs();

  return useQuery({
    queryKey: ['homepage-category-banners', slugs],
    queryFn: async (): Promise<HomepageCategoryBanner[]> => {
      const categories = await Promise.all(slugs.map((slug) => getStoreCategoryBySlug(slug)));
      return slugs.map((slug, index) =>
        mapCategoryToHomepageBanner(categories[index], slug, index),
      );
    },
    enabled: useLiveApi,
    staleTime: 10 * 60 * 1000,
    placeholderData: fallbackHomepageCategoryBanners,
    retry: 1,
  });
}
