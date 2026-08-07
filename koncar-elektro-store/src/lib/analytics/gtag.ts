/**
 * GA4 / GTM ids — set once the client hands over the real Measurement ID /
 * Container ID (Week 6, item 6.8/6.9). Until then these are empty and every
 * analytics call below becomes a no-op, so it's safe to ship this now.
 */
const rawGaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '';
const rawGtmId = process.env.NEXT_PUBLIC_GTM_ID ?? '';

/**
 * Second, explicit switch on top of the ids — must be set to `"true"` to
 * actually fire anything. This lets us configure the real GA4/GTM ids ahead
 * of time (so setup/QA can happen) WITHOUT risking test traffic polluting
 * the live property before go-live. Flip this on Vercel Production only
 * when the site is actually live on koncarelektro.rs.
 */
const analyticsLive = process.env.NEXT_PUBLIC_ANALYTICS_LIVE === 'true';

export const GA_MEASUREMENT_ID = analyticsLive ? rawGaId : '';
export const GTM_CONTAINER_ID = analyticsLive ? rawGtmId : '';

export const analyticsEnabled = Boolean(GA_MEASUREMENT_ID || GTM_CONTAINER_ID);

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Push a GA4/GTM event. No-op server-side, before consent, or without an id configured. */
export function trackEvent(eventName: string, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: eventName, ...params });
  window.gtag?.('event', eventName, params);
}

/** GA4 pageview — call on every client-side route change (App Router doesn't do this automatically). */
export function trackPageview(url: string): void {
  if (!GA_MEASUREMENT_ID) return;
  trackEvent('page_view', { page_path: url });
}

export type GaItem = {
  item_id: string | number;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  price: number;
  quantity?: number;
};

export const trackViewItem = (item: GaItem) =>
  trackEvent('view_item', { currency: 'RSD', value: item.price, items: [item] });

export const trackAddToCart = (item: GaItem) =>
  trackEvent('add_to_cart', {
    currency: 'RSD',
    value: item.price * (item.quantity ?? 1),
    items: [item],
  });

export const trackBeginCheckout = (items: GaItem[], value: number) =>
  trackEvent('begin_checkout', { currency: 'RSD', value, items });

export const trackPurchase = (params: {
  transactionId: string;
  value: number;
  shipping?: number;
  items: GaItem[];
}) =>
  trackEvent('purchase', {
    transaction_id: params.transactionId,
    currency: 'RSD',
    value: params.value,
    shipping: params.shipping,
    items: params.items,
  });
