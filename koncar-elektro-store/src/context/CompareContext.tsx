'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartProduct } from '@/context/CartContext';
import { getCatalogProductUrl } from '@/lib/productUrls';

const STORAGE_KEY = 'koncar-compare-v1';
export const COMPARE_LIMIT = 4;

export type CompareProduct = CartProduct & {
  specs?: string[];
};

type StoredCompare = {
  ids: number[];
  products: Record<number, CompareProduct>;
};

type CompareContextValue = {
  ids: number[];
  products: CompareProduct[];
  count: number;
  limit: number;
  has: (productId: number) => boolean;
  toggle: (product: CompareProduct) => void;
  add: (product: CompareProduct) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

const CompareContext = createContext<CompareContextValue | null>(null);

const readStorage = (): StoredCompare => {
  const empty: StoredCompare = { ids: [], products: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<StoredCompare>;
    const ids = Array.isArray(parsed.ids) ? parsed.ids.filter((id) => typeof id === 'number') : [];
    const products =
      parsed.products && typeof parsed.products === 'object' ? parsed.products : {};
    return { ids: ids.slice(0, COMPARE_LIMIT), products };
  } catch {
    return empty;
  }
};

const toSnapshot = (product: CompareProduct): CompareProduct => ({
  id: product.id,
  name: product.name,
  brand: product.brand,
  sku: product.sku,
  image: product.image,
  price: product.price,
  oldPrice: product.oldPrice,
  inStock: product.inStock,
  category: product.category,
  categorySlug: product.categorySlug,
  slug: product.slug,
  permalink: product.permalink,
  specs: product.specs,
});

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [hydrated, setHydrated] = useState(false);
  const [ids, setIds] = useState<number[]>([]);
  const [productsMap, setProductsMap] = useState<Record<number, CompareProduct>>({});

  useEffect(() => {
    const stored = readStorage();
    setIds(stored.ids);
    setProductsMap(stored.products);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ids, products: productsMap }));
  }, [ids, productsMap, hydrated]);

  const has = useCallback((productId: number) => ids.includes(productId), [ids]);

  const add = useCallback((product: CompareProduct) => {
    if (!product?.id) return;
    const snapshot = toSnapshot(product);
    setProductsMap((current) => ({ ...current, [snapshot.id]: snapshot }));
    setIds((current) => {
      if (current.includes(snapshot.id)) return current;
      if (current.length >= COMPARE_LIMIT) {
        const next = [...current.slice(1), snapshot.id];
        return next;
      }
      return [...current, snapshot.id];
    });
  }, []);

  const remove = useCallback((productId: number) => {
    setIds((current) => current.filter((id) => id !== productId));
  }, []);

  const toggle = useCallback(
    (product: CompareProduct) => {
      if (!product?.id) return;
      if (ids.includes(product.id)) remove(product.id);
      else add(product);
    },
    [ids, add, remove],
  );

  const clear = useCallback(() => setIds([]), []);

  const value = useMemo(() => {
    const products = ids
      .map((id) => productsMap[id])
      .filter((p): p is CompareProduct => Boolean(p));

    return {
      ids,
      products,
      count: products.length,
      limit: COMPARE_LIMIT,
      has,
      toggle,
      add,
      remove,
      clear,
    };
  }, [ids, productsMap, has, toggle, add, remove, clear]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
};

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
};

export const getCompareProductUrl = (product: CompareProduct) => getCatalogProductUrl(product);
