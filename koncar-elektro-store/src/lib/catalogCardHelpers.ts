import type { CatalogProduct } from '@/data/catalogListing';

export function toBestsellerCard(product: CatalogProduct): CatalogProduct {
  return {
    ...product,
    bestseller: true,
    subtitle: product.subtitle ?? product.description,
  };
}

export function markTopBestsellers(products: CatalogProduct[], count = 2): CatalogProduct[] {
  return products.map((p, i) =>
    i < count ? { ...p, bestseller: true, subtitle: p.subtitle ?? p.description } : p,
  );
}
