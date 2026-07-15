import type { KoncarCatalogProduct } from '@/data/koncarProducts';
import { BRAND_ATTRIBUTE_SLUG } from '@/lib/listingFilters';
import type { WcStoreAttribute, WcStorePrice, WcStoreProduct } from '@/lib/api/types/wc-store';

/** Store API prices are in minor units (e.g. 34000 + minor_unit 2 → 340.00 RSD). */
export function minorUnitsToMajor(price: WcStorePrice): number {
  const raw = Number(price.price);
  if (!Number.isFinite(raw)) return 0;
  return raw / 10 ** price.currency_minor_unit;
}

function normalizeAttrKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'dj')
    .replace(/Đ/g, 'dj')
    .toLowerCase()
    .trim();
}

export function getAttributeValue(product: WcStoreProduct, ...names: string[]): string | undefined {
  const attrs = product.attributes ?? [];
  const wanted = names.map(normalizeAttrKey);

  for (const attr of attrs) {
    const byName = wanted.includes(normalizeAttrKey(attr.name));
    const byTaxonomy = wanted.includes(normalizeAttrKey(attr.taxonomy ?? ''));
    if (!byName && !byTaxonomy) continue;
    const term = attr.terms?.[0]?.name;
    if (term) return term;
  }
  return undefined;
}

/** Prefer WC attribute; never fall back to the first word of the title. */
function extractBrand(product: WcStoreProduct): string {
  const fromAttr = getAttributeValue(
    product,
    'Proizvodjač',
    'Proizvođač',
    'Proizvodjac',
    BRAND_ATTRIBUTE_SLUG,
  );
  if (fromAttr) return fromAttr;

  // Last resort: known brand token in the product name (longest match wins).
  const nameNorm = normalizeAttrKey(product.name);
  const known = [
    'super ingco',
    'garden master',
    'rem power',
    'f.f. group',
    'ff group',
    'dah solar',
    'st garden',
    'anti fire',
    'iskra ero',
    'makita',
    'metabo',
    'bosch',
    'villager',
    'einhell',
    'hyundai',
    'scheppach',
    'ingco',
    'hugong',
    'varstroj',
    'dolomite',
    'dewalt',
    'milwaukee',
    'hikoki',
    'raider',
    'cedrus',
    'agm',
    'wilo',
  ];
  const hit = known.find((b) => nameNorm.includes(b));
  if (hit) {
    return hit
      .split(' ')
      .map((w) => w.toUpperCase())
      .join(' ');
  }

  return '';
}

/** Deepest category slug path from permalink, e.g. `rucni-alat-i-pribor/rucni-alat`. */
export function extractCategorySlugFromProduct(product: WcStoreProduct): string {
  // Category refs embedded on a product use `link`, not `permalink` (that field only exists
  // on the standalone /products/categories endpoint) — reading the wrong key here silently
  // made every live product fall back to 'ponuda', breaking related-products/category-based logic.
  const deepest = [...(product.categories ?? [])].sort(
    (a, b) => (b.link?.split('/').length ?? 0) - (a.link?.split('/').length ?? 0),
  )[0];
  if (!deepest?.link) return 'ponuda';
  const match = deepest.link.match(/\/product-category\/(.+)\/?$/);
  return match?.[1]?.replace(/\/$/, '') ?? deepest.slug;
}

/**
 * `categorySlug` can be a full nested path (e.g. `poljoprivredni-alati-i-oprema/kosacice`)
 * for products in a subcategory. The WC Store API's `category` filter only accepts a single
 * term slug — passing the full path silently returns zero results. Use this to get the leaf
 * term slug (WP category slugs are unique across the whole taxonomy, so this stays precise).
 */
export function leafCategorySlug(categorySlug: string): string {
  const segments = categorySlug.split('/').filter(Boolean);
  return segments[segments.length - 1] ?? categorySlug;
}

/** Prodavnica path segments from permalink, e.g. `rucni-alat-i-pribor/rucni-alat`. */
export function extractProdavnicaPath(product: WcStoreProduct): string {
  const match = product.permalink?.match(/\/prodavnica\/(.+)\/[^/]+\/?$/);
  return match?.[1]?.replace(/\/$/, '') ?? extractCategorySlugFromProduct(product);
}

export function extractSpecsFromAttributes(product: WcStoreProduct): string[] {
  const skip = new Set(['proizvodjac', 'uvoznik', 'zemlja porekla', 'pa_proizvodjac']);
  return (product.attributes ?? [])
    .filter((a) => {
      const key = normalizeAttrKey(a.name);
      const tax = normalizeAttrKey(a.taxonomy ?? '');
      return !skip.has(key) && !skip.has(tax);
    })
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
