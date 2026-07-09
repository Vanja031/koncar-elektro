/**
 * ISR revalidate intervals (seconds).
 *
 * E-commerce headless standard without WP webhooks:
 * - PDP: 5–15 min (prices/stock can change)
 * - Category listings: 10–30 min
 * - Sale pages: 3–5 min (discounts change more often)
 *
 * Override via env for staging tuning.
 */

const envInt = (key: string, fallback: number) => {
  const raw = process.env[key];
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

/** Product detail pages — default 10 min */
export const REVALIDATE_PRODUCT = envInt('NEXT_PUBLIC_ISR_REVALIDATE_PRODUCT', 600);

/** Category / listing pages — default 15 min */
export const REVALIDATE_CATEGORY = envInt('NEXT_PUBLIC_ISR_REVALIDATE_CATEGORY', 900);

/** Sale / akcija listings — default 5 min */
export const REVALIDATE_SALE = envInt('NEXT_PUBLIC_ISR_REVALIDATE_SALE', 300);

/** Homepage product sections — default 10 min */
export const REVALIDATE_HOME = envInt('NEXT_PUBLIC_ISR_REVALIDATE_HOME', 600);
