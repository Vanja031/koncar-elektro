/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WP_API_URL?: string;
  readonly VITE_WC_STORE_API_URL?: string;
  readonly VITE_WC_CONSUMER_KEY?: string;
  readonly VITE_WC_CONSUMER_SECRET?: string;
  readonly VITE_USE_LIVE_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
