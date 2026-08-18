/** Server-side API base URLs — always absolute (no dev proxy). */

const PRODUCTION_WP = 'https://koncarelektro.rs/wp-json';

const wpApi =
  process.env.NEXT_PUBLIC_WP_API_URL?.replace(/\/$/, '') || PRODUCTION_WP.replace(/\/$/, '');

/** Absolute `/wp-json` base for server-side WP REST (pages, posts, etc.). */
export const serverWpApiBase = wpApi;

/** WordPress origin (no `/wp-json`) — staging or live. */
export const serverWpOrigin = (
  process.env.WP_REWRITE_ORIGIN ||
  wpApi.replace(/\/wp-json\/?$/, '') ||
  'https://koncarelektro.rs'
).replace(/\/$/, '');

export const serverWcStoreApiBase =
  process.env.NEXT_PUBLIC_WC_STORE_API_URL?.replace(/\/$/, '') ||
  `${wpApi}/wc/store/v1`;
