import type { WcStoreCategory } from '@/lib/api/types/wc-store';
import { stripHtmlToText } from '@/lib/htmlEntities';

/** Plain-text category description suitable for ListingHero. */
export function plainCategoryDescription(raw?: string | null): string | undefined {
  const text = stripHtmlToText(raw ?? '');
  return text || undefined;
}

export function findCategoryBySlugCandidates(
  categories: WcStoreCategory[] | undefined,
  candidates: string[],
): WcStoreCategory | undefined {
  if (!categories?.length) return undefined;
  for (const slug of candidates) {
    const hit = categories.find((c) => c.slug === slug);
    if (hit) return hit;
  }
  return undefined;
}

function isNameOnlyDescription(category: WcStoreCategory, plain: string): boolean {
  const name = category.name.replace(/\s+/g, ' ').trim().toLowerCase();
  const slugAsName = category.slug.replace(/-/g, ' ').toLowerCase();
  const desc = plain.toLowerCase();
  return desc === name || desc === slugAsName;
}

/**
 * Prefer WooCommerce category description; skip empty / name-only placeholders.
 */
export function resolveCategoryHeroDescription(options: {
  categories?: WcStoreCategory[];
  slugCandidates: string[];
  fallback?: string;
}): string | undefined {
  const category = findCategoryBySlugCandidates(options.categories, options.slugCandidates);
  const fromWc = plainCategoryDescription(category?.description);
  if (fromWc && category && !isNameOnlyDescription(category, fromWc)) {
    return fromWc;
  }
  return options.fallback || undefined;
}
