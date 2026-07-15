/** Production domain for canonical URLs and OG — always koncarelektro.rs (SEO parity). */
export const CANONICAL_SITE_URL = (
  process.env.NEXT_PUBLIC_CANONICAL_URL ?? 'https://koncarelektro.rs'
).replace(/\/$/, '');

/** App origin (dev/staging); canonical uses CANONICAL_SITE_URL instead. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? CANONICAL_SITE_URL
).replace(/\/$/, '');

export const SITE_NAME = 'Končar Elektro';

export const TITLE_SUFFIX =
  'Končar Elektro -trgovina električnog, ručnog alata i pribora';

export const DEFAULT_OG_IMAGE = '/koncar-og.jpg';

/** Normalize pathname for baseline lookup — trailing slash, decoded. */
export function normalizePathname(pathname: string): string {
  try {
    const decoded = decodeURIComponent(pathname);
    if (decoded === '/') return '/';
    return decoded.endsWith('/') ? decoded : `${decoded}/`;
  } catch {
    return pathname.endsWith('/') ? pathname : `${pathname}/`;
  }
}

export function absoluteUrl(pathname: string): string {
  const path = normalizePathname(pathname);
  const base = CANONICAL_SITE_URL;
  return path === '/' ? `${base}/` : `${base}${path}`;
}
