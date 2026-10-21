import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { koncarProducts } from '@/data/koncarProducts';
import { getProductWeightKg, type WeighableProduct } from '@/lib/productWeight';
import { calculateShipping } from '@/lib/shipping';
import { formatPrice } from '@/data/homepage';
import { getCatalogProductUrl } from '@/lib/productUrls';
import { AddToCartModal } from '@/components/cart/AddToCartModal';
import { trackAddToCart } from '@/lib/analytics/gtag';
import {
  normalizeCouponCode,
  quoteCoupon,
  type CouponQuote,
  type CouponQuoteOptions,
} from '@/lib/coupon';

const STORAGE_KEY = 'koncar-cart-v2';

/** Snapshot podataka proizvoda — čuva se u korpi da radi i za live (WooCommerce) proizvode. */
export type CartProduct = {
  id: number;
  name: string;
  brand?: string;
  sku?: string;
  image: string;
  price: number;
  oldPrice?: number;
  inStock?: boolean;
  weightKg?: number;
  category?: string;
  categorySlug?: string;
  slug?: string;
  permalink?: string;
};

export type CartLine = {
  productId: number;
  quantity: number;
};

export type ResolvedCartLine = CartLine & {
  name: string;
  brand: string;
  sku: string;
  image: string;
  price: number;
  oldPrice?: number;
  inStock: boolean;
  weightKg: number;
  lineTotal: number;
  lineWeightKg: number;
  url: string;
};

export type AddedToCartSnapshot = {
  product: CartProduct;
  quantityAdded: number;
  cartQuantity: number;
  addedAt: number;
  status: 'added' | 'unavailable';
};

type CartContextValue = {
  items: CartLine[];
  lines: ResolvedCartLine[];
  itemCount: number;
  subtotal: number;
  subtotalRegular: number;
  savings: number;
  totalWeightKg: number;
  shipping: ReturnType<typeof calculateShipping>;
  /** Merchandise sum after the coupon. Equals `subtotal` when no code is applied. */
  payableSubtotal: number;
  couponCode: string | null;
  couponDiscount: number;
  couponQuote: CouponQuote | null;
  /** True while the code is waiting on a fresh server check. Checkout stays disabled. */
  couponPending: boolean;
  couponError: string | null;
  total: number;
  addedSnapshot: AddedToCartSnapshot | null;
  addItem: (product: CartProduct, quantity?: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  closeAddedModal: () => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const mockProductById = new Map(koncarProducts.map((p) => [p.id, p]));

type StoredCart = {
  items: CartLine[];
  products: Record<number, CartProduct>;
};

type CouponRates = {
  code: string;
  key: string;
  flatRate: number | null;
  rateByProductId: Record<number, number>;
};

const cartKeyOf = (items: CartLine[]) => items.map((line) => `${line.productId}:${line.quantity}`).join(',');

const readStorage = (): StoredCart => {
  const empty: StoredCart = { items: [], products: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<StoredCart>;
    const items = Array.isArray(parsed.items) ? parsed.items.filter((i) => i.quantity > 0) : [];
    const products = parsed.products && typeof parsed.products === 'object' ? parsed.products : {};
    return { items, products };
  } catch {
    return empty;
  }
};

/** Snapshot iz korpe → oblik koji `getProductWeightKg` očekuje. */
const estimateWeight = (product: CartProduct): number => {
  if (product.weightKg != null && product.weightKg > 0) return product.weightKg;
  return getProductWeightKg({
    name: product.name,
    price: product.price,
    categorySlug: product.categorySlug ?? '',
  } as WeighableProduct);
};

const toCartProduct = (product: CartProduct): CartProduct => ({
  id: product.id,
  name: product.name,
  brand: product.brand,
  sku: product.sku,
  image: product.image,
  price: product.price,
  oldPrice: product.oldPrice,
  inStock: product.inStock,
  weightKg: product.weightKg,
  category: product.category,
  categorySlug: product.categorySlug,
  slug: product.slug,
  permalink: product.permalink,
});

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [initial] = useState(readStorage);
  const [items, setItems] = useState<CartLine[]>(initial.items);
  const [products, setProducts] = useState<Record<number, CartProduct>>(initial.products);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponRates, setCouponRates] = useState<CouponRates | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [addedSnapshot, setAddedSnapshot] = useState<AddedToCartSnapshot | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, products }));
  }, [items, products]);

  useEffect(() => {
    if (!couponCode || items.length === 0) {
      setCouponRates(null);
      setCouponLoading(false);
      return;
    }

    const key = cartKeyOf(items);
    const controller = new AbortController();
    setCouponLoading(true);
    const timer = window.setTimeout(() => {
      fetch('/api/wc/coupon/', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          items: items.map((line) => ({ productId: line.productId, quantity: line.quantity })),
        }),
        signal: controller.signal,
      })
        .then(async (response) => {
          const data = (await response.json().catch(() => ({}))) as {
            message?: string;
            code?: string;
            kind?: string;
            flatRate?: number | null;
            lines?: Array<{ productId?: number; rate?: number }>;
          };
          if (!response.ok) {
            throw new Error(data.message || 'Kod nije važeći.');
          }
          if (controller.signal.aborted) return;
          const rateByProductId: Record<number, number> = {};
          for (const line of data.lines ?? []) {
            if (line.productId != null && line.rate != null && Number.isFinite(line.rate)) {
              rateByProductId[line.productId] = line.rate;
            }
          }
          setCouponRates({
            code: typeof data.code === 'string' ? data.code : couponCode,
            key,
            flatRate: data.flatRate ?? null,
            rateByProductId,
          });
          setCouponError(null);
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          setCouponRates(null);
          setCouponCode(null);
          setCouponError(error instanceof Error ? error.message : 'Kod nije važeći.');
        })
        .finally(() => {
          if (!controller.signal.aborted) setCouponLoading(false);
        });
    }, 200);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [couponCode, items]);

  const closeAddedModal = useCallback(() => setAddedSnapshot(null), []);

  const addItem = useCallback((product: CartProduct, quantity = 1) => {
    if (!product?.id || quantity < 1) return;
    const snapshot = toCartProduct(product);

    if (snapshot.inStock === false) {
      setAddedSnapshot({
        product: snapshot,
        quantityAdded: 0,
        cartQuantity: 0,
        addedAt: Date.now(),
        status: 'unavailable',
      });
      return;
    }

    trackAddToCart({
      item_id: snapshot.id,
      item_name: snapshot.name,
      item_brand: snapshot.brand,
      item_category: snapshot.category,
      price: snapshot.price,
      quantity,
    });

    setProducts((current) => ({ ...current, [snapshot.id]: snapshot }));
    setItems((current) => {
      const existing = current.find((line) => line.productId === snapshot.id);
      const cartQuantity = existing ? existing.quantity + quantity : quantity;
      setAddedSnapshot({
        product: snapshot,
        quantityAdded: quantity,
        cartQuantity,
        addedAt: Date.now(),
        status: 'added',
      });

      if (existing) {
        return current.map((line) =>
          line.productId === snapshot.id
            ? { ...line, quantity: line.quantity + quantity }
            : line,
        );
      }
      return [...current, { productId: snapshot.id, quantity }];
    });
  }, []);

  const setQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity < 1) {
      setItems((current) => current.filter((line) => line.productId !== productId));
      return;
    }
    setItems((current) =>
      current.map((line) => (line.productId === productId ? { ...line, quantity } : line)),
    );
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((current) => current.filter((line) => line.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCouponCode(null);
    setCouponRates(null);
    setCouponError(null);
  }, []);

  const applyCoupon = useCallback((raw: string) => {
    const code = normalizeCouponCode(raw);
    if (!code) {
      setCouponError('Unesite kod za popust.');
      return;
    }
    setCouponError(null);
    setCouponCode(code);
  }, []);

  const removeCoupon = useCallback(() => {
    setCouponCode(null);
    setCouponRates(null);
    setCouponError(null);
  }, []);

  const value = useMemo(() => {
    const resolve = (productId: number): CartProduct | undefined => {
      const snapshot = products[productId];
      if (snapshot) return snapshot;
      const mock = mockProductById.get(productId);
      if (!mock) return undefined;
      return toCartProduct({ ...mock, slug: undefined, permalink: undefined });
    };

    const lines: ResolvedCartLine[] = items
      .map((line): ResolvedCartLine | null => {
        const product = resolve(line.productId);
        if (!product) return null;
        const weightKg = estimateWeight(product);
        return {
          ...line,
          name: product.name,
          brand: product.brand ?? '',
          sku: product.sku ?? '',
          image: product.image,
          price: product.price,
          oldPrice: product.oldPrice,
          inStock: product.inStock ?? true,
          weightKg,
          lineTotal: product.price * line.quantity,
          lineWeightKg: weightKg * line.quantity,
          url: getCatalogProductUrl(product),
        };
      })
      .filter((line): line is ResolvedCartLine => line != null);

    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const savings = lines.reduce(
      (sum, line) =>
        line.oldPrice && line.oldPrice > line.price
          ? sum + (line.oldPrice - line.price) * line.quantity
          : sum,
      0,
    );
    const subtotalRegular = subtotal + savings;
    const totalWeightKg = lines.reduce((sum, line) => sum + line.lineWeightKg, 0);
    const cartKey = cartKeyOf(items);
    const ratesMatch = couponRates != null && couponRates.code === couponCode && couponRates.key === cartKey;
    const couponConfirmed = Boolean(couponCode) && ratesMatch && !couponLoading;
    const quoteOptions: CouponQuoteOptions | undefined = couponConfirmed
      ? { flatRate: couponRates.flatRate, rateByProductId: couponRates.rateByProductId }
      : undefined;
    const couponQuote = couponConfirmed
      ? quoteCoupon(
          couponCode,
          lines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            unitPrice: line.price,
            brand: line.brand,
          })),
          quoteOptions,
        )
      : null;
    const couponDiscount = couponQuote?.discount ?? 0;
    const payableSubtotal = couponQuote ? couponQuote.discountedSubtotal : subtotal;
    const shipping = calculateShipping(payableSubtotal, totalWeightKg);
    const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
    const total = payableSubtotal + shipping.cost;
    const couponPending = Boolean(couponCode) && !couponConfirmed;

    return {
      items,
      lines,
      itemCount,
      subtotal,
      subtotalRegular,
      savings,
      totalWeightKg,
      shipping,
      payableSubtotal,
      couponCode,
      couponDiscount,
      couponQuote,
      couponPending,
      couponError,
      total,
      addedSnapshot,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      closeAddedModal,
      applyCoupon,
      removeCoupon,
    };
  }, [
    items,
    products,
    couponCode,
    couponRates,
    couponLoading,
    couponError,
    addedSnapshot,
    addItem,
    setQuantity,
    removeItem,
    clearCart,
    closeAddedModal,
    applyCoupon,
    removeCoupon,
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <AddToCartModal />
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export const formatCartMoney = formatPrice;
