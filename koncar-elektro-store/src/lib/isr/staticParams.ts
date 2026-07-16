import { getStoreProductsServer } from '@/lib/api/wc-store/server';

/** Extract `/prodavnica/...` path segments from a Store API product permalink. */
function permalinkToProdavnicaSegments(permalink?: string): string[] {
  if (!permalink) return [];
  const match = permalink.match(/\/prodavnica\/(.+?)\/?$/);
  if (!match) return [];
  return match[1].split('/').filter(Boolean);
}

/**
 * Static params for `/prodavnica/[...segments]` — pre-render only a small,
 * high-traffic subset (bestsellers + on-sale) at build time so the most
 * visited PDPs are served instantly. The remaining 5.000+ products stay on
 * `dynamicParams` (rendered on first visit, then cached for
 * `REVALIDATE_PRODUCT` seconds) — this keeps build time short and avoids
 * sending thousands of requests to the live WooCommerce API on every deploy.
 */
export async function getStaticProductParams(): Promise<{ segments: string[] }[]> {
  try {
    const [bestsellers, onSale] = await Promise.all([
      getStoreProductsServer({ per_page: 40, orderby: 'popularity' }),
      getStoreProductsServer({ per_page: 20, on_sale: true, orderby: 'popularity' }),
    ]);

    const seen = new Set<string>();
    const params: { segments: string[] }[] = [];

    for (const product of [...bestsellers, ...onSale]) {
      const segments = permalinkToProdavnicaSegments(product.permalink);
      if (segments.length === 0) continue;
      const key = segments.join('/');
      if (seen.has(key)) continue;
      seen.add(key);
      params.push({ segments });
    }

    return params;
  } catch {
    // Never fail the build because the live WP site is briefly unreachable.
    return [];
  }
}
