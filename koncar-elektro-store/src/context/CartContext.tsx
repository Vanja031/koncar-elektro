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
  total: number;
  addedSnapshot: AddedToCartSnapshot | null;
  addItem: (product: CartProduct, quantity?: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  closeAddedModal: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const mockProductById = new Map(koncarProducts.map((p) => [p.id, p]));

type StoredCart = {
  items: CartLine[];
  products: Record<number, CartProduct>;
};

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
  const [addedSnapshot, setAddedSnapshot] = useState<AddedToCartSnapshot | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, products }));
  }, [items, products]);

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

  const clearCart = useCallback(() => setItems([]), []);

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
    const shipping = calculateShipping(subtotal, totalWeightKg);
    const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
    const total = subtotal + shipping.cost;

    return {
      items,
      lines,
      itemCount,
      subtotal,
      subtotalRegular,
      savings,
      totalWeightKg,
      shipping,
      total,
      addedSnapshot,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      closeAddedModal,
    };
  }, [items, products, addedSnapshot, addItem, setQuantity, removeItem, clearCart, closeAddedModal]);

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
