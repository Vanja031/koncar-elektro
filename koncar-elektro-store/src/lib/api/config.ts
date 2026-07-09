/** WordPress / WooCommerce API base URLs. */

const PRODUCTION_WP = 'https://koncarelektro.rs/wp-json';

/**
 * Next.js inlines `process.env.NEXT_PUBLIC_*` into the browser bundle ONLY when
 * accessed with a static, literal key. Dynamic access (process.env[`...${x}`])
 * is NOT replaced and returns undefined client-side — so keep these literal.
 */
const ENV = {
  WP_API_URL: process.env.NEXT_PUBLIC_WP_API_URL ?? '',
  WC_STORE_API_URL: process.env.NEXT_PUBLIC_WC_STORE_API_URL ?? '',
  WC_CONSUMER_KEY: process.env.NEXT_PUBLIC_WC_CONSUMER_KEY ?? '',
  WC_CONSUMER_SECRET: process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET ?? '',
  USE_LIVE_API: process.env.NEXT_PUBLIC_USE_LIVE_API ?? '',
} as const;

const isDev = process.env.NODE_ENV === 'development';

/**
 * In dev we hit the same-origin `/wp-json` rewrite (see next.config.mjs) so the
 * browser never triggers CORS — the WooCommerce Store API doesn't reliably emit
 * Access-Control-Allow-Origin even with a CORS plugin. In prod we use the
 * absolute WP base (same domain as the deployed site).
 */
export const wpApiBase = isDev ? '/wp-json' : (ENV.WP_API_URL || PRODUCTION_WP);

export const wcStoreApiBase = isDev
  ? `${wpApiBase.replace(/\/$/, '')}/wc/store/v1`
  : (ENV.WC_STORE_API_URL || `${wpApiBase.replace(/\/$/, '')}/wc/store/v1`);

export const wcV3ApiBase = `${wpApiBase.replace(/\/$/, '')}/wc/v3`;

export const wcConsumerKey = ENV.WC_CONSUMER_KEY;
export const wcConsumerSecret = ENV.WC_CONSUMER_SECRET;

export const hasWcV3Credentials = Boolean(wcConsumerKey && wcConsumerSecret);

/** When true, product/category pages fetch from live WooCommerce API (read-only). */
export const useLiveApi = ENV.USE_LIVE_API === 'true';
