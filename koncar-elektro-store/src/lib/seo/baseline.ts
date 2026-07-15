import baselineIndex from '@/data/seo-baseline-index.json';
import { normalizePathname } from '@/lib/seo/site';

export type BaselineEntry = {
  /** title */
  t: string;
  /** meta description */
  d?: string;
  /** og:title (when different) */
  ot?: string;
  /** og:description (when different) */
  od?: string;
};

const index = baselineIndex as Record<string, BaselineEntry>;

export function lookupBaseline(pathname: string): BaselineEntry | null {
  const key = normalizePathname(pathname);
  return index[key] ?? null;
}

export function hasBaseline(pathname: string): boolean {
  return lookupBaseline(pathname) !== null;
}
