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

const STORAGE_KEY = 'koncar-wishlist-v1';

export type WishlistProduct = CartProduct;

type StoredWishlist = {
  ids: number[];
  products: Record<number, WishlistProduct>;
};

type WishlistContextValue = {
  ids: number[];
  products: WishlistProduct[];
  count: number;
  has: (productId: number) => boolean;
  toggle: (product: WishlistProduct) => void;
  add: (product: WishlistProduct) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

const readStorage = (): StoredWishlist => {
  const empty: StoredWishlist = { ids: [], products: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<StoredWishlist>;
    const ids = Array.isArray(parsed.ids) ? parsed.ids.filter((id) => typeof id === 'number') : [];
    const products =
      parsed.products && typeof parsed.products === 'object' ? parsed.products : {};
    return { ids, products };
  } catch {
    return empty;
  }
};

const toSnapshot = (product: WishlistProduct): WishlistProduct => ({
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
});

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [hydrated, setHydrated] = useState(false);
  const [ids, setIds] = useState<number[]>([]);
  const [productsMap, setProductsMap] = useState<Record<number, WishlistProduct>>({});

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

  const add = useCallback((product: WishlistProduct) => {
    if (!product?.id) return;
    const snapshot = toSnapshot(product);
    setProductsMap((current) => ({ ...current, [snapshot.id]: snapshot }));
    setIds((current) => (current.includes(snapshot.id) ? current : [...current, snapshot.id]));
  }, []);

  const remove = useCallback((productId: number) => {
    setIds((current) => current.filter((id) => id !== productId));
  }, []);

  const toggle = useCallback(
    (product: WishlistProduct) => {
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
      .filter((p): p is WishlistProduct => Boolean(p));

    return {
      ids,
      products,
      count: products.length,
      has,
      toggle,
      add,
      remove,
      clear,
    };
  }, [ids, productsMap, has, toggle, add, remove, clear]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};

export const getWishlistProductUrl = (product: WishlistProduct) => getCatalogProductUrl(product);
