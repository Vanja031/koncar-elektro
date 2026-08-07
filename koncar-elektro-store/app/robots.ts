import type { MetadataRoute } from 'next';
import { CANONICAL_SITE_URL } from '@/lib/seo/site';

const DISALLOW = ['/korpa', '/placanje-odjava', '/prijava', '/registracija', '/api/'];

export default function robots(): MetadataRoute.Robots {
  return {
    // Explicit rules for the major bots (carried over from the previous static
    // robots.txt) plus the catch-all — keeps behavior identical, just adds
    // disallow rules for non-content pages and the sitemap reference.
    rules: [
      { userAgent: 'Googlebot', allow: '/', disallow: DISALLOW },
      { userAgent: 'Bingbot', allow: '/', disallow: DISALLOW },
      { userAgent: 'Twitterbot', allow: '/', disallow: DISALLOW },
      { userAgent: 'facebookexternalhit', allow: '/', disallow: DISALLOW },
      { userAgent: '*', allow: '/', disallow: DISALLOW },
    ],
    sitemap: `${CANONICAL_SITE_URL}/sitemap.xml`,
    host: CANONICAL_SITE_URL,
  };
}
