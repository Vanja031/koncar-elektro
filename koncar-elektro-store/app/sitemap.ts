import type { MetadataRoute } from 'next';
import baselineIndex from '@/data/seo-baseline-index.json';
import { CANONICAL_SITE_URL } from '@/lib/seo/site';

/**
 * Sitemap generated from the Week 1 SEO baseline crawl (5.6k+ URLs from the
 * live WooCommerce site) — guarantees the same URL set as koncarelektro.rs.
 * Single file is fine here: well under the 50k-URL sitemap.xml limit.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = Object.keys(baselineIndex as Record<string, unknown>);

  return paths.map((path) => ({
    url: `${CANONICAL_SITE_URL}${path}`,
    changeFrequency: path === '/' ? 'daily' : path.startsWith('/prodavnica/') ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : path.startsWith('/prodavnica/') ? 0.7 : 0.5,
  }));
}
