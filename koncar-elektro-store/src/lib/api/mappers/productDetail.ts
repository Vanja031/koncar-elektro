import type { BreadcrumbItem } from '@/data/categoryPages';
import type { ProductDetail, ProductDeclarationRow, ProductSpec } from '@/data/productDetail';
import { ROUTES } from '@/lib/catalogUrls';
import {
  extractProdavnicaPath,
  getAttributeValue,
  mapStoreProductToCatalog,
  mapStoreAttributesToSpecs,
} from '@/lib/api/mappers/product';
import type { WcStoreProduct } from '@/lib/api/types/wc-store';

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildBreadcrumbs(product: WcStoreProduct): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: 'Početna', href: ROUTES.home }];

  const sorted = [...(product.categories ?? [])].sort(
    (a, b) => (a.permalink?.split('/').length ?? 0) - (b.permalink?.split('/').length ?? 0),
  );

  for (const cat of sorted) {
    const match = cat.permalink?.match(/\/product-category\/(.+)\/?$/);
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
  const proizvodjac = getAttributeValue(product, 'Proizvodjac', 'Proizvođač');
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
  const features = attrSpecs.slice(0, 6).map((s) => `${s.label}: ${s.value}`);

  return {
    ...catalog,
    slug: product.slug,
    gallery: gallery.slice(0, 8),
    longDescription: stripHtml(longHtml) || catalog.description,
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
