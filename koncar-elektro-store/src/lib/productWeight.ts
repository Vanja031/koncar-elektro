import type { KoncarCatalogProduct } from '@/data/koncarProducts';

export type WeighableProduct = KoncarCatalogProduct & { weightKg?: number };

/** Težina u kg — koristi weightKg sa proizvoda ili procenu do backend integracije. */
export const getProductWeightKg = (product: WeighableProduct): number => {
  if (product.weightKg != null && product.weightKg > 0) {
    return product.weightKg;
  }

  const name = product.name.toLowerCase();

  if (name.includes('kolica') || name.includes('356kom')) return 42;
  if (name.includes('kompresor') || name.includes('agregat')) return 28;
  if (name.includes('aparat') && name.includes('varenje')) return 18;
  if (name.includes('traktor') || name.includes('kosilica') || name.includes('kosačica')) return 35;
  if (name.includes('čišćenje') || name.includes('ciscenje') || name.includes('pranje')) return 8;
  if (product.categorySlug.includes('akumulatorski') || name.includes('aku ')) return 2.8;
  if (product.price > 80_000) return 22;
  if (product.price > 40_000) return 12;
  if (product.price > 15_000) return 5.5;
  if (product.price > 5_000) return 3.2;
  if (product.price > 1_000) return 1.2;
  return 0.35;
};

export const formatWeightKg = (kg: number) =>
  kg.toLocaleString('sr-RS', { minimumFractionDigits: kg < 10 ? 1 : 0, maximumFractionDigits: 2 }) + ' kg';
