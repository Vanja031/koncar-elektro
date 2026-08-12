import imgElektromaterijal from '@/assets/elektromaterijal.webp';
import imgRasveta from '@/assets/rasveta.webp';
import imgSolarne from '@/assets/solarne.webp';
import type { WcStoreCategory } from '@/lib/api/types/wc-store';
import { getTopCategoryUrl } from '@/lib/catalogUrls';
import { wcToProgramSlug } from '@/lib/wcSlugs';

export type HomepageCategoryBanner = {
  slug: string;
  title: string;
  desc: string;
  image: string;
  href: string;
  className: string;
};

/** Default WC category slugs for homepage promo banners (editable in WP). */
export const DEFAULT_HOME_BANNER_CATEGORY_SLUGS = [
  'elektromaterijal-i-oprema',
  'rasveta',
  'solarna-elektrana',
] as const;

/**
 * Override via env, comma-separated WC category slugs.
 * Example: `NEXT_PUBLIC_HOME_BANNER_CATEGORY_SLUGS=elektromaterijal-i-oprema,rasveta,solarna-elektrana`
 */
export function getHomeBannerCategorySlugs(): string[] {
  const raw = process.env.NEXT_PUBLIC_HOME_BANNER_CATEGORY_SLUGS?.trim();
  if (!raw) return [...DEFAULT_HOME_BANNER_CATEGORY_SLUGS];
  const slugs = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return slugs.length > 0 ? slugs : [...DEFAULT_HOME_BANNER_CATEGORY_SLUGS];
}

const BANNER_STYLES: Record<string, string> = {
  'elektromaterijal-i-oprema': 'bg-primary',
  rasveta: 'bg-gradient-to-r from-[#5c3218] via-[#8b4e24] to-[#a8622f]',
  'solarna-elektrana': 'bg-gradient-to-r from-[#143528] via-[#1d4a38] to-[#25634a]',
};

const BANNER_FALLBACKS: Record<string, Omit<HomepageCategoryBanner, 'slug'>> = {
  'elektromaterijal-i-oprema': {
    title: 'Elektromaterijal',
    desc: 'Kablovi, prekidači, osigurači i sve što vam treba',
    image: imgElektromaterijal,
    href: getTopCategoryUrl('elektromaterijal'),
    className: BANNER_STYLES['elektromaterijal-i-oprema'],
  },
  rasveta: {
    title: 'Rasveta',
    desc: 'LED rasveta za svaki prostor i potrebu',
    image: imgRasveta,
    href: getTopCategoryUrl('rasveta'),
    className: BANNER_STYLES.rasveta,
  },
  'solarna-elektrana': {
    title: 'Solarne elektrane',
    desc: 'Kompletna rešenja za vašu energetsku nezavisnost',
    image: imgSolarne,
    href: getTopCategoryUrl('solarne'),
    className: BANNER_STYLES['solarna-elektrana'],
  },
};

/** Offline / mock homepage when live API is off. */
export const fallbackHomepageCategoryBanners: HomepageCategoryBanner[] =
  DEFAULT_HOME_BANNER_CATEGORY_SLUGS.map((slug) => ({
    slug,
    ...BANNER_FALLBACKS[slug],
  }));

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function categoryHref(slug: string): string {
  const program = wcToProgramSlug(slug);
  if (program) return getTopCategoryUrl(program);
  return `/product-category/${slug}`;
}

function styleForSlug(slug: string, index: number): string {
  if (BANNER_STYLES[slug]) return BANNER_STYLES[slug];
  const palette = [
    'bg-primary',
    'bg-gradient-to-r from-[#5c3218] via-[#8b4e24] to-[#a8622f]',
    'bg-gradient-to-r from-[#143528] via-[#1d4a38] to-[#25634a]',
  ];
  return palette[index % palette.length];
}

/**
 * Map a WC category to a homepage banner.
 * WP admin: Products → Categories → name, description, thumbnail.
 */
export function mapCategoryToHomepageBanner(
  category: WcStoreCategory | null | undefined,
  slug: string,
  index: number,
): HomepageCategoryBanner {
  const fallback = BANNER_FALLBACKS[slug];
  const descFromWp = category?.description ? stripHtml(category.description) : '';
  const titleFromWp = category?.name?.trim() ?? '';
  const imageFromWp = category?.image?.src?.trim() ?? '';

  return {
    slug,
    title: titleFromWp || fallback?.title || slug,
    desc: descFromWp || fallback?.desc || 'Pogledajte ponudu u ovoj kategoriji.',
    image: imageFromWp || fallback?.image || imgElektromaterijal,
    href: category ? categoryHref(category.slug) : fallback?.href || categoryHref(slug),
    className: styleForSlug(slug, index),
  };
}
