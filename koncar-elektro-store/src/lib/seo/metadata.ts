import type { Metadata } from 'next';
import { lookupBaseline } from '@/lib/seo/baseline';
import {
  categoryDescription,
  categoryTitle,
  productDescription,
  productTitle,
  STATIC_FALLBACKS,
} from '@/lib/seo/templates';
import { absoluteUrl, DEFAULT_OG_IMAGE, normalizePathname } from '@/lib/seo/site';

type BuildOptions = {
  pathname: string;
  title: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  image?: string;
  robots?: Metadata['robots'];
};

/** Build Next.js Metadata with canonical + OG from baseline or explicit values. */
export function buildPageMetadata({
  pathname,
  title,
  description,
  ogTitle,
  ogDescription,
  image,
  robots,
}: BuildOptions): Metadata {
  const canonical = absoluteUrl(pathname);
  const desc = description?.trim();
  const ogT = ogTitle?.trim() || title;
  const ogD = ogDescription?.trim() || desc;

  const metadata: Metadata = {
    title,
    alternates: { canonical },
    openGraph: {
      title: ogT,
      type: 'website',
      url: canonical,
      ...(ogD ? { description: ogD } : {}),
      images: image ? [{ url: image }] : [{ url: DEFAULT_OG_IMAGE }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogT,
      ...(ogD ? { description: ogD } : {}),
      images: image ? [image] : [DEFAULT_OG_IMAGE],
    },
  };

  if (desc) metadata.description = desc;
  if (robots) metadata.robots = robots;

  return metadata;
}

/** Metadata from seo-baseline.csv, with generated description when missing. */
export function metadataFromBaseline(
  pathname: string,
  fallbackDescription?: string,
  robots?: Metadata['robots'],
): Metadata | null {
  const entry = lookupBaseline(pathname);
  if (!entry) return null;

  const description = entry.d?.trim() || fallbackDescription;

  return buildPageMetadata({
    pathname,
    title: entry.t,
    description,
    ogTitle: entry.ot,
    ogDescription: entry.od || description,
    robots,
  });
}

/** Static page: baseline first, then curated fallback. */
export function metadataForStaticPath(
  pathname: string,
  robots?: Metadata['robots'],
): Metadata {
  const key = normalizePathname(pathname);
  const fromBaseline = metadataFromBaseline(key, STATIC_FALLBACKS[key]?.description, robots);
  if (fromBaseline) return fromBaseline;

  const fallback = STATIC_FALLBACKS[key];
  if (!fallback) {
    return buildPageMetadata({ pathname: key, title: 'Končar Elektro', robots });
  }

  return buildPageMetadata({
    pathname: key,
    title: fallback.title,
    description: fallback.description,
    robots,
  });
}

export function metadataForProduct(
  pathname: string,
  productName: string,
  image?: string,
): Metadata {
  const fromBaseline = metadataFromBaseline(pathname, productDescription(productName));
  if (fromBaseline) {
    if (image) {
      fromBaseline.openGraph = { ...fromBaseline.openGraph, images: [{ url: image }] };
    }
    return fromBaseline;
  }

  return buildPageMetadata({
    pathname,
    title: productTitle(productName),
    description: productDescription(productName),
    image,
  });
}

export function metadataForCategory(
  pathname: string,
  categoryName: string,
  image?: string,
): Metadata {
  const fromBaseline = metadataFromBaseline(pathname, categoryDescription(categoryName));
  if (fromBaseline) {
    if (image) {
      fromBaseline.openGraph = { ...fromBaseline.openGraph, images: [{ url: image }] };
    }
    return fromBaseline;
  }

  return buildPageMetadata({
    pathname,
    title: categoryTitle(categoryName),
    description: categoryDescription(categoryName),
    image,
  });
}

export const NOINDEX_FOLLOW: Metadata['robots'] = { index: false, follow: true };
