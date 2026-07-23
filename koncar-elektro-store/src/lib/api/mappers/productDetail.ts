import sanitizeHtml from 'sanitize-html';
import type { BreadcrumbItem } from '@/data/categoryPages';
import type { ProductDetail, ProductDeclarationRow, ProductSpec } from '@/data/productDetail';
import { ROUTES } from '@/lib/catalogUrls';
import {
  extractProdavnicaPath,
  extractSpecsFromAttributes,
  getAttributeValue,
  mapStoreProductToCatalog,
  mapStoreAttributesToSpecs,
} from '@/lib/api/mappers/product';
import type { WcStoreProduct } from '@/lib/api/types/wc-store';

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

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
        label: cat.name,
        href: `${ROUTES.productCategory}/${match[1].replace(/\/$/, '')}`,
      });
    }
  }

  items.push({ label: product.name });
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

function buildSpecifications(catalog: ReturnType<typeof mapStoreProductToCatalog>): ProductSpec[] {
  const base: ProductSpec[] = [
    { label: 'Brend', value: catalog.brand },
    { label: 'Šifra', value: catalog.sku },
    { label: 'Kategorija', value: catalog.category },
  ];
  if (catalog.weightKg) {
    base.push({ label: 'Težina', value: `${catalog.weightKg} kg` });
  }
  return base;
}

/** Full product detail page shape from Store API (read-only, live data). */
export function mapStoreProductToDetail(product: WcStoreProduct): ProductDetail {
  const catalog = mapStoreProductToCatalog(product);
  const attrSpecs = mapStoreAttributesToSpecs(product.attributes ?? []);
  const gallery = product.images?.map((img) => img.src).filter(Boolean) ?? [];
  if (gallery.length === 0 && catalog.image) gallery.push(catalog.image);

  const longHtml = product.description || product.short_description || '';
  // Proizvođač/uvoznik/zemlja porekla se već prikazuju u Deklaraciji — ne dupliramo ih ovde.
  const features = extractSpecsFromAttributes(product);

  return {
    ...catalog,
    slug: product.slug,
    gallery: gallery.slice(0, 8),
    longDescription: stripHtml(longHtml) || catalog.description,
    longDescriptionHtml: sanitizeDescriptionHtml(product.description || ''),
    features: features.length > 0 ? features : [catalog.description],
    specifications: [...buildSpecifications(catalog), ...attrSpecs],
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
