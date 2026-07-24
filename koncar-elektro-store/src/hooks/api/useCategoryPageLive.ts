import { useMemo } from 'react';
import type { SubcategoryItem } from '@/data/categoryPages';
import { alatiSubcategories } from '@/data/categoryPages';
import { useNavigationMenu } from '@/hooks/api/useNavigationMenu';
import { getProductCategoryUrl, getWcCategoryListingUrl } from '@/lib/catalogUrls';
import {
  findWcParentByInternalSlug,
  getLiveParentSubcategoryChips,
} from '@/lib/navigation/buildNavigationMenu';
import { slugify } from '@/lib/slugify';
import { PROGRAM_SLUGS } from '@/lib/wcSlugs';

export function useCategoryPageLive(slug: string) {
  const { getCategoryById, isLive, isLoading, allCategories } = useNavigationMenu();

  const subcategories = useMemo((): SubcategoryItem[] => {
    if (!isLive || !allCategories?.length) return [];

    if (slug === 'alati') {
      // Top-level Alati hubs with real WC parent counts (not static mock numbers).
      return alatiSubcategories.map((item) => {
        const wc = findWcParentByInternalSlug(item.slug, allCategories);
        return {
          slug: item.slug,
          name: wc?.name ?? item.name,
          image: '',
          productCount: wc?.count ?? 0,
          wcSlug: wc?.slug,
          href: wc
            ? getWcCategoryListingUrl(wc.slug)
            : getProductCategoryUrl(item.slug),
        };
      });
    }

    if (PROGRAM_SLUGS.has(slug)) {
      const fromWc = getLiveParentSubcategoryChips(slug, allCategories);
      if (fromWc.length) {
        return fromWc.map((sub) => ({
          slug: sub.slug,
          name: sub.label,
          image: sub.image ?? '',
          productCount: sub.count,
          wcSlug: sub.slug,
          href: sub.href,
        }));
      }

      const menu = getCategoryById(slug);
      if (!menu) return [];
      return menu.subcategories.map((sub) => ({
        slug: sub.slug ?? slugify(sub.label),
        name: sub.label,
        image: sub.image ?? '',
        productCount: sub.count ?? 0,
        wcSlug: sub.slug,
      }));
    }

    return [];
  }, [slug, isLive, allCategories, getCategoryById]);

  return { subcategories, isLive, isLoading };
}
