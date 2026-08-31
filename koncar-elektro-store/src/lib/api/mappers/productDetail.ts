import sanitizeHtml from 'sanitize-html';
import type { BreadcrumbItem } from '@/data/categoryPages';
import type { ProductDetail, ProductDeclarationRow, ProductSpec } from '@/data/productDetail';
import { ROUTES } from '@/lib/catalogUrls';
import {
  extractProdavnicaPath,
  extractSpecsFromAttributes,
  extractTechAttributeSpecs,
  getAttributeValue,
  mapStoreProductToCatalog,
  decodeHtmlEntities,
} from '@/lib/api/mappers/product';
import { extractSpecsFromDescriptionHtml } from '@/lib/api/mappers/descriptionSpecs';
import type { WcStoreProduct } from '@/lib/api/types/wc-store';
import { stripHtmlToText } from '@/lib/htmlEntities';

/** Sanitized rich description — keeps headings/paragraphs/lists, strips scripts/styles/attrs we don't need. */
function sanitizeDescriptionHtml(html: string): string | undefined {
  if (!html.trim()) return undefined;
  const clean = sanitizeHtml(html, {
    allowedTags: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'span', 'table', 'thead',
      'tbody', 'tr', 'th', 'td', 'blockquote',
    ],
    allowedAttributes: { a: ['href', 'target', 'rel'] },
  }).trim();
  return clean.length > 0 ? clean : undefined;
}

function buildBreadcrumbs(product: WcStoreProduct): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: 'Početna', href: ROUTES.home }];

  // Embedded product category refs use `link`, not `permalink` — see extractCategorySlugFromProduct.
  const sorted = [...(product.categories ?? [])].sort(
    (a, b) => (a.link?.split('/').length ?? 0) - (b.link?.split('/').length ?? 0),
  );

  for (const cat of sorted) {
    const match = cat.link?.match(/\/product-category\/(.+)\/?$/);
    if (match) {
      items.push({
        label: decodeHtmlEntities(cat.name),
        href: `${ROUTES.productCategory}/${match[1].replace(/\/$/, '')}`,
      });
    }
  }

  items.push({ label: decodeHtmlEntities(product.name) });
  return items;
}

function buildDeclaration(product: WcStoreProduct): ProductDeclarationRow[] {
  const rows: ProductDeclarationRow[] = [];
  const proizvodjac = getAttributeValue(
    product,
    'Proizvodjac',
    'Proizvođač',
    'Brend',
    'pa_brend',
    'pa_proizvodjac',
  );
  const uvoznik = getAttributeValue(product, 'Uvoznik');
  const zemlja = getAttributeValue(product, 'Zemlja porekla');

  if (proizvodjac) rows.push({ label: 'Proizvodjač', value: proizvodjac });
  if (uvoznik) rows.push({ label: 'Uvoznik', value: uvoznik });
  if (zemlja) rows.push({ label: 'Zemlja porekla', value: zemlja });

  return rows;
}

/** Diacritic/case-insensitive label key so "Brend" and a description bullet "brend: ..." don't both show up. */
function normalizeSpecLabel(label: string): string {
  return label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'dj')
    .toLowerCase()
    .trim();
}

/**
 * Builds the "Tehničke karakteristike" tab content. Priority order:
 *  1. Fixed base fields (Brend/Šifra/Kategorija/Težina) — always reliable.
 *  2. Bullets parsed from the WooCommerce description's "Tehničke karakteristike" list —
 *     covers the vast majority of products, which only carry specs in the description.
 *  3. Real WC technical attributes (Snaga, Napon, …) — same source the shop filters use;
 *     fills gaps for products where those are populated in WooCommerce.
 * Declaration fields (Proizvođač/Uvoznik/Zemlja porekla) are deliberately excluded — they
 * live in the separate "Deklaracija" tab.
 */
function buildSpecifications(
  catalog: ReturnType<typeof mapStoreProductToCatalog>,
  product: WcStoreProduct,
): ProductSpec[] {
  const specs: ProductSpec[] = [
    { label: 'Brend', value: catalog.brand },
    { label: 'Šifra', value: catalog.sku },
    { label: 'Kategorija', value: catalog.category },
  ];
  if (catalog.weightKg) {
    specs.push({ label: 'Težina', value: `${catalog.weightKg} kg` });
  }

  const seenLabels = new Set(specs.map((s) => normalizeSpecLabel(s.label)));
  const addIfNew = (spec: ProductSpec) => {
    const key = normalizeSpecLabel(spec.label);
    if (seenLabels.has(key)) return;
    seenLabels.add(key);
    specs.push(spec);
  };

  extractSpecsFromDescriptionHtml(product.description).forEach(addIfNew);
  extractTechAttributeSpecs(product).forEach(addIfNew);

  return specs;
}

/** Full product detail page shape from Store API (read-only, live data). */
export function mapStoreProductToDetail(product: WcStoreProduct): ProductDetail {
  const catalog = mapStoreProductToCatalog(product);
  const gallery = product.images?.map((img) => img.src).filter(Boolean) ?? [];
  if (gallery.length === 0 && catalog.image) gallery.push(catalog.image);

  const longHtml = product.description || product.short_description || '';
  // Proizvođač/uvoznik/zemlja porekla se već prikazuju u Deklaraciji — ne dupliramo ih ovde.
  const features = extractSpecsFromAttributes(product);

  return {
    ...catalog,
    slug: product.slug,
    gallery: gallery.slice(0, 8),
    longDescription: stripHtmlToText(longHtml) || catalog.description,
    longDescriptionHtml: sanitizeDescriptionHtml(product.description || ''),
    features: features.length > 0 ? features : [catalog.description],
    specifications: buildSpecifications(catalog, product),
    declaration: buildDeclaration(product),
    reviewsList: [],
    relatedIds: [],
    breadcrumbs: buildBreadcrumbs(product),
    deliveryDays: catalog.inStock ? '1–2 radna dana' : '3–5 radnih dana',
    warrantyMonths: catalog.price > 50000 ? 36 : 24,
    ...(catalog.oldPrice && catalog.oldPrice > catalog.price
      ? { saleStart: '01.07.2026.', saleEnd: '31.07.2026.' }
      : {}),
  };
}

export { extractProdavnicaPath };
