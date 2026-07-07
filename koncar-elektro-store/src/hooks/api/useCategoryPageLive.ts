import { useMemo } from 'react';
import type { SubcategoryItem } from '@/data/categoryPages';
import { useNavigationMenu } from '@/hooks/api/useNavigationMenu';
import {
  categoryListingPath,
  collectAlatiLeafCategories,
} from '@/lib/navigation/buildNavigationMenu';
import { slugify } from '@/lib/slugify';
import { PROGRAM_SLUGS } from '@/lib/wcSlugs';

export function useCategoryPageLive(slug: string) {
  const { getCategoryById, isLive, isLoading, allCategories } = useNavigationMenu();

  const subcategories = useMemo((): SubcategoryItem[] => {
    if (!isLive || !allCategories?.length) return [];

    if (slug === 'alati') {
      return collectAlatiLeafCategories(allCategories).map((cat) => ({
        slug: cat.slug,
        name: cat.name,
        image: '',
        productCount: cat.count,
        wcSlug: cat.slug,
        href: categoryListingPath(cat, allCategories),
      }));
    }

    if (PROGRAM_SLUGS.has(slug)) {
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
