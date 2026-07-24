import type { MegaMenuCategory, MegaMenuSubcategory } from '@/data/navigation';
import type { NavigationMenuDef } from '@/data/navigationMenuConfig';
import { alatiMenuDefs, otherProgramMenuDefs } from '@/data/navigationMenuConfig';
import type { WcStoreCategory } from '@/lib/api/types/wc-store';
import {
  MEGA_MENU_PARENT_SLUG,
  OTHER_PROGRAM_SLUGS,
  getWcCategoryListingUrl,
} from '@/lib/catalogUrls';
import { programToWcSlug, toWcParentSlug, wcParentSlugCandidates } from '@/lib/wcSlugs';

export function resolveWcParentSlug(def: NavigationMenuDef): string {
  if (def.wcParentSlug) return def.wcParentSlug;
  const internal = MEGA_MENU_PARENT_SLUG[def.id] ?? def.id;
  if (OTHER_PROGRAM_SLUGS.has(def.id)) {
    return programToWcSlug(internal);
  }
  return toWcParentSlug(internal);
}

/** Find a WC category by trying preferred remaps then staging/live aliases. */
export function findWcCategoryBySlugCandidates(
  allCategories: WcStoreCategory[],
  candidates: string[],
): WcStoreCategory | undefined {
  for (const slug of candidates) {
    const found = allCategories.find((c) => c.slug === slug);
    if (found) return found;
  }
  return undefined;
}

export function findWcParentByInternalSlug(
  internalSlug: string,
  allCategories: WcStoreCategory[],
): WcStoreCategory | undefined {
  return findWcCategoryBySlugCandidates(allCategories, wcParentSlugCandidates(internalSlug));
}

function mapWcChild(
  child: WcStoreCategory,
  allCategories: WcStoreCategory[],
  fallbackImage: string,
): MegaMenuSubcategory {
  const parent = allCategories.find((c) => c.id === child.parent);
  return {
    label: child.name,
    slug: child.slug,
    parentWcSlug: parent?.slug,
    count: child.count,
    image: child.image?.src || fallbackImage,
  };
}

function buildMenuCategory(
  def: NavigationMenuDef,
  allCategories: WcStoreCategory[],
): MegaMenuCategory {
  const preferredSlug = resolveWcParentSlug(def);
  const parent = def.wcParentSlug
    ? allCategories.find((c) => c.slug === def.wcParentSlug)
    : findWcCategoryBySlugCandidates(
        allCategories,
        OTHER_PROGRAM_SLUGS.has(def.id)
          ? [preferredSlug, def.id]
          : wcParentSlugCandidates(MEGA_MENU_PARENT_SLUG[def.id] ?? def.id),
      );

  let subcategories: MegaMenuSubcategory[] = [];

  if (def.wcChildSlugs?.length) {
    const slugSet = new Set(def.wcChildSlugs);
    subcategories = allCategories
      .filter((c) => slugSet.has(c.slug))
      .sort((a, b) => a.name.localeCompare(b.name, 'sr'))
      .map((child) => mapWcChild(child, allCategories, def.fallbackImage));
  } else if (parent) {
    subcategories = allCategories
      .filter((c) => c.parent === parent.id)
      .sort((a, b) => a.name.localeCompare(b.name, 'sr'))
      .map((child) => mapWcChild(child, allCategories, def.fallbackImage));
  }

  return {
    id: def.id,
    label: def.label,
    icon: def.icon,
    viewAllLabel: def.viewAllLabel,
    subcategories,
  };
}

export function buildNavigationMenu(
  defs: NavigationMenuDef[],
  allCategories: WcStoreCategory[],
): MegaMenuCategory[] {
  return defs.map((def) => buildMenuCategory(def, allCategories));
}

/** Direct WC children of an internal parent hub — real counts, no static menu. */
export function getLiveParentSubcategoryChips(
  internalParentSlug: string,
  allCategories: WcStoreCategory[],
): {
  slug: string;
  label: string;
  count: number;
  image?: string;
  href: string;
  parentWcSlug: string;
}[] {
  const parent = findWcParentByInternalSlug(internalParentSlug, allCategories);
  if (!parent) return [];

  return allCategories
    .filter((c) => c.parent === parent.id)
    .sort((a, b) => a.name.localeCompare(b.name, 'sr'))
    .map((child) => ({
      slug: child.slug,
      label: child.name,
      count: child.count,
      image: child.image?.src || undefined,
      parentWcSlug: parent.slug,
      href: getWcCategoryListingUrl(parent.slug, child.slug),
    }));
}

/** Mega-menu hubs usable as sale-page category filters (skips synthetic multi-parent groups). */
export function getSaleCategoryFilterOptions(): { id: string; label: string; wcSlug: string }[] {
  return [...alatiMenuDefs, ...otherProgramMenuDefs]
    .filter((def) => !def.wcChildSlugs?.length)
    .map((def) => ({
      id: def.id,
      label: def.label,
      wcSlug: resolveWcParentSlug(def),
    }));
}

/** Root WC categories for the "Alati i oprema" program (from mega-menu defs). */
function alatiRootCategories(allCategories: WcStoreCategory[]): WcStoreCategory[] {
  const roots: WcStoreCategory[] = [];
  const seen = new Set<number>();
  const add = (cat?: WcStoreCategory) => {
    if (cat && !seen.has(cat.id)) {
      seen.add(cat.id);
      roots.push(cat);
    }
  };

  for (const def of alatiMenuDefs) {
    if (def.wcChildSlugs?.length) {
      const slugSet = new Set(def.wcChildSlugs);
      allCategories.filter((c) => slugSet.has(c.slug)).forEach(add);
    } else {
      const internal = MEGA_MENU_PARENT_SLUG[def.id] ?? def.id;
      add(
        def.wcParentSlug
          ? allCategories.find((c) => c.slug === def.wcParentSlug)
          : findWcParentByInternalSlug(internal, allCategories),
      );
    }
  }

  // Hub parents that are on /proizvodi but not in the mega-menu sidebar defs.
  for (const internal of [
    'aparati-za-varenje',
    'poljoprivredni-program',
    'oprema-za-dvoriste',
    'agregati',
  ]) {
    add(findWcParentByInternalSlug(internal, allCategories));
  }

  return roots;
}

/** All leaf categories (no child categories, only products) under the Alati program. */
export function collectAlatiLeafCategories(
  allCategories: WcStoreCategory[],
): WcStoreCategory[] {
  const childrenOf = new Map<number, WcStoreCategory[]>();
  for (const c of allCategories) {
    const siblings = childrenOf.get(c.parent) ?? [];
    siblings.push(c);
    childrenOf.set(c.parent, siblings);
  }

  const leaves: WcStoreCategory[] = [];
  const added = new Set<number>();

  const visit = (cat: WcStoreCategory) => {
    const kids = childrenOf.get(cat.id) ?? [];
    if (kids.length === 0) {
      if (cat.count > 0 && !added.has(cat.id)) {
        added.add(cat.id);
        leaves.push(cat);
      }
      return;
    }
    kids.forEach(visit);
  };

  alatiRootCategories(allCategories).forEach(visit);

  return leaves.sort((a, b) => a.name.localeCompare(b.name, 'sr'));
}

/** Full `/product-category/...` path for a category, from its WC ancestry. */
export function categoryListingPath(
  cat: WcStoreCategory,
  allCategories: WcStoreCategory[],
): string {
  const byId = new Map(allCategories.map((c) => [c.id, c]));
  const segments = [cat.slug];
  let parentId = cat.parent;
  while (parentId) {
    const parent = byId.get(parentId);
    if (!parent) break;
    segments.unshift(parent.slug);
    parentId = parent.parent;
  }
  return `/product-category/${segments.join('/')}`;
}

export function findWcCategoryByMenuId(
  menuId: string,
  allCategories: WcStoreCategory[],
): WcStoreCategory | undefined {
  const def = [...alatiMenuDefs, ...otherProgramMenuDefs].find((d) => d.id === menuId);
  if (!def) return undefined;
  if (def.wcParentSlug) {
    return allCategories.find((c) => c.slug === def.wcParentSlug);
  }
  const internal = MEGA_MENU_PARENT_SLUG[def.id] ?? def.id;
  if (OTHER_PROGRAM_SLUGS.has(def.id)) {
    return findWcCategoryBySlugCandidates(allCategories, [
      programToWcSlug(internal),
      internal,
    ]);
  }
  return findWcParentByInternalSlug(internal, allCategories);
}

/** Reverse lookup: internal parent slug → mega menu id. */
export function findMenuIdByParentSlug(parentSlug: string): string | undefined {
  const entry = Object.entries(MEGA_MENU_PARENT_SLUG).find(([, slug]) => slug === parentSlug);
  return entry?.[0];
}
