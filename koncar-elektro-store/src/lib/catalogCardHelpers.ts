import type { Product } from '@/data/homepage';
import type { CatalogProduct } from '@/data/catalogListing';

type CardProduct = Product & { subtitle?: string; bestseller?: boolean };

export function toBestsellerCard(product: CatalogProduct): CatalogProduct {
  return {
    ...product,
    bestseller: true,
    subtitle: product.subtitle ?? product.description,
  };
}

export function markTopBestsellers<T extends CardProduct>(products: T[], count = 2): T[] {
  return products.map((p, i) =>
    i < count ? { ...p, bestseller: true, subtitle: p.subtitle ?? p.description } : p,
  );
}
