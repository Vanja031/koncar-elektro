/** WordPress / WooCommerce API base URLs (browser / shared). */

/**
 * Next.js inlines `process.env.NEXT_PUBLIC_*` into the browser bundle ONLY when
 * accessed with a static, literal key. Dynamic access (process.env[`...${x}`])
 * is NOT replaced and returns undefined client-side — so keep these literal.
 */
const ENV = {
  WC_CONSUMER_KEY: process.env.NEXT_PUBLIC_WC_CONSUMER_KEY ?? '',
  WC_CONSUMER_SECRET: process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET ?? '',
  USE_LIVE_API: process.env.NEXT_PUBLIC_USE_LIVE_API ?? '',
} as const;

/**
 * Always hit same-origin `/wp-json` (see next.config.mjs rewrite).
 * Works in local dev AND on Vercel — avoids CORS against WP Store API,
 * which often does not emit Access-Control-Allow-Origin even with a CORS plugin.
 *
 * Server-side (RSC / route handlers) must use `@/lib/api/server-config` absolute URLs.
 */
export const wpApiBase = '/wp-json';

export const wcStoreApiBase = `${wpApiBase}/wc/store/v1`;

export const wcV3ApiBase = `${wpApiBase}/wc/v3`;

export const wcConsumerKey = ENV.WC_CONSUMER_KEY;
export const wcConsumerSecret = ENV.WC_CONSUMER_SECRET;

export const hasWcV3Credentials = Boolean(wcConsumerKey && wcConsumerSecret);

/** When true, product/category pages fetch from WooCommerce API (read-only). */
export const useLiveApi = ENV.USE_LIVE_API === 'true';
