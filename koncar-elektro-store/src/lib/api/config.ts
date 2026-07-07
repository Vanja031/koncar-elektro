/** WordPress / WooCommerce API base URLs. */

const PRODUCTION_WP = 'https://koncarelektro.rs/wp-json';

/** In dev, Vite proxies /wp-json → koncarelektro.rs (see vite.config.ts). */
export const wpApiBase = import.meta.env.DEV
  ? '/wp-json'
  : (import.meta.env.VITE_WP_API_URL ?? PRODUCTION_WP);

// In dev, always go through the Vite proxy (same-origin) so CORS never applies —
// works via localhost and the network IP alike. The absolute env override is prod-only.
export const wcStoreApiBase = import.meta.env.DEV
  ? `${wpApiBase.replace(/\/$/, '')}/wc/store/v1`
  : (import.meta.env.VITE_WC_STORE_API_URL ??
    `${wpApiBase.replace(/\/$/, '')}/wc/store/v1`);

export const wcV3ApiBase = `${wpApiBase.replace(/\/$/, '')}/wc/v3`;

export const wcConsumerKey = import.meta.env.VITE_WC_CONSUMER_KEY ?? '';
export const wcConsumerSecret = import.meta.env.VITE_WC_CONSUMER_SECRET ?? '';

export const hasWcV3Credentials = Boolean(wcConsumerKey && wcConsumerSecret);

/** When true, product/category pages fetch from live WooCommerce API (read-only). */
export const useLiveApi = import.meta.env.VITE_USE_LIVE_API === 'true';
