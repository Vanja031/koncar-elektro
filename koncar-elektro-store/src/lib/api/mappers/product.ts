import type { KoncarCatalogProduct } from '@/data/koncarProducts';
import type { WcStoreAttribute, WcStorePrice, WcStoreProduct } from '@/lib/api/types/wc-store';

/** Store API prices are in minor units (e.g. 34000 + minor_unit 2 → 340.00 RSD). */
export function minorUnitsToMajor(price: WcStorePrice): number {
  const raw = Number(price.price);
  if (!Number.isFinite(raw)) return 0;
  return raw / 10 ** price.currency_minor_unit;
}

export function getAttributeValue(product: WcStoreProduct, ...names: string[]): string | undefined {
  const attrs = product.attributes ?? [];
  for (const name of names) {
    const attr = attrs.find((a) => a.name.toLowerCase() === name.toLowerCase());
    const term = attr?.terms?.[0]?.name;
    if (term) return term;
  }
  return undefined;
}

function extractBrand(product: WcStoreProduct): string {
  const fromAttr = getAttributeValue(product, 'Proizvodjac', 'Proizvođač');
  if (fromAttr) return fromAttr;
  const firstWord = product.name.split(/\s+/)[0];
  return firstWord ?? 'Končar';
}

/** Deepest category slug path from permalink, e.g. `rucni-alat-i-pribor/rucni-alat`. */
export function extractCategorySlugFromProduct(product: WcStoreProduct): string {
  const deepest = [...(product.categories ?? [])].sort(
    (a, b) => (b.permalink?.split('/').length ?? 0) - (a.permalink?.split('/').length ?? 0),
  )[0];
  if (!deepest?.permalink) return 'ponuda';
  const match = deepest.permalink.match(/\/product-category\/(.+)\/?$/);
  return match?.[1]?.replace(/\/$/, '') ?? deepest.slug;
}

/** Prodavnica path segments from permalink, e.g. `rucni-alat-i-pribor/rucni-alat`. */
export function extractProdavnicaPath(product: WcStoreProduct): string {
  const match = product.permalink?.match(/\/prodavnica\/(.+)\/[^/]+\/?$/);
  return match?.[1]?.replace(/\/$/, '') ?? extractCategorySlugFromProduct(product);
}

export function extractSpecsFromAttributes(product: WcStoreProduct): string[] {
  const skip = new Set(['proizvodjac', 'proizvođač', 'uvoznik', 'zemlja porekla']);
  return (product.attributes ?? [])
    .filter((a) => !skip.has(a.name.toLowerCase()))
    .flatMap((a) => a.terms.map((t) => `${a.name}: ${t.name}`))
    .slice(0, 6);
}

/** Map Store API product → catalog card shape. */
export function mapStoreProductToCatalog(product: WcStoreProduct): KoncarCatalogProduct & {
  slug: string;
  permalink: string;
} {
  const price = minorUnitsToMajor(product.prices);
  const regular = minorUnitsToMajor({
    ...product.prices,
    price: product.prices.regular_price,
  });
  const onSale = product.on_sale && regular > price;
  const weightKg = product.weight ? Number.parseFloat(product.weight) : undefined;

  return {
    id: product.id,
    slug: product.slug,
    permalink: product.permalink,
    brand: extractBrand(product),
    name: product.name,
    category: product.categories?.[product.categories.length - 1]?.name ?? 'Proizvodi',
    categorySlug: extractCategorySlugFromProduct(product),
    description:
      product.short_description?.replace(/<[^>]+>/g, '').trim() ||
      product.description.replace(/<[^>]+>/g, ' ').trim().slice(0, 200),
    price: Math.round(price),
    ...(onSale ? { oldPrice: Math.round(regular) } : {}),
    rating: Math.round(Number(product.average_rating) || 0) || 4,
    reviews: product.review_count ?? 0,
    image: product.images?.[0]?.src ?? '',
    sku: product.sku || String(product.id),
    inStock: product.is_in_stock ?? product.stock_availability?.class !== 'out-of-stock',
    specs: extractSpecsFromAttributes(product),
    subtitle: product.short_description?.replace(/<[^>]+>/g, '').trim().slice(0, 80) || undefined,
    ...(weightKg && Number.isFinite(weightKg) ? { weightKg } : {}),
  };
}

export function mapStoreAttributesToSpecs(attrs: WcStoreAttribute[]): { label: string; value: string }[] {
  return attrs
    .filter((a) => a.terms.length > 0)
    .map((a) => ({ label: a.name, value: a.terms.map((t) => t.name).join(', ') }));
}
