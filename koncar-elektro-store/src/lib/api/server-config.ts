/** Server-side API base URLs — always absolute (no dev proxy). */

const PRODUCTION_WP = 'https://koncarelektro.rs/wp-json';

const wpApi =
  process.env.NEXT_PUBLIC_WP_API_URL?.replace(/\/$/, '') || PRODUCTION_WP.replace(/\/$/, '');

export const serverWcStoreApiBase =
  process.env.NEXT_PUBLIC_WC_STORE_API_URL?.replace(/\/$/, '') ||
  `${wpApi}/wc/store/v1`;
