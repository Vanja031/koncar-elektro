import { useQuery } from '@tanstack/react-query';
import {
  defaultCategoryByMode,
  type MegaMenuCategory,
  type MegaMenuMode,
} from '@/data/navigation';
import { alatiMenuDefs, otherProgramMenuDefs } from '@/data/navigationMenuConfig';
import { useLiveApi } from '@/lib/api/config';
import { fetchAllStoreCategories } from '@/lib/api/wc-store/categories';
import { buildNavigationMenu } from '@/lib/navigation/buildNavigationMenu';

const emptyAlati = alatiMenuDefs.map((def) => ({
  id: def.id,
  label: def.label,
  icon: def.icon,
  viewAllLabel: def.viewAllLabel,
  subcategories: [],
}));

const emptyOther = otherProgramMenuDefs.map((def) => ({
  id: def.id,
  label: def.label,
  icon: def.icon,
  viewAllLabel: def.viewAllLabel,
  subcategories: [],
}));

export function useNavigationMenu() {
  const query = useQuery({
    queryKey: ['wc-navigation-categories'],
    queryFn: fetchAllStoreCategories,
    enabled: useLiveApi,
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  const isLive = useLiveApi && Boolean(query.data?.length) && !query.isError;

  const alatiCategories: MegaMenuCategory[] = isLive
    ? buildNavigationMenu(alatiMenuDefs, query.data!)
    : emptyAlati;

  const otherProgramCategoriesResolved: MegaMenuCategory[] = isLive
    ? buildNavigationMenu(otherProgramMenuDefs, query.data!)
    : emptyOther;

  const getCategoryById = (id: string) =>
    [...alatiCategories, ...otherProgramCategoriesResolved].find((c) => c.id === id);

  const defaultIdForMode = (mode: MegaMenuMode) => defaultCategoryByMode[mode];

  return {
    alatiMenuCategories: alatiCategories,
    otherProgramCategories: otherProgramCategoriesResolved,
    getCategoryById,
    defaultIdForMode,
    allCategories: query.data,
    isLoading: useLiveApi && query.isLoading,
    isError: useLiveApi && query.isError,
    isLive,
    refetch: query.refetch,
  };
}
