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
import { getProductWeightKg } from '@/lib/productWeight';
import { calculateShipping } from '@/lib/shipping';
import { formatPrice } from '@/data/homepage';
import { AddToCartModal } from '@/components/cart/AddToCartModal';

const STORAGE_KEY = 'koncar-cart-v1';

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
};

export type AddedToCartSnapshot = {
  productId: number;
  quantityAdded: number;
  cartQuantity: number;
  addedAt: number;
};

type CartContextValue = {
  items: CartLine[];
  lines: ResolvedCartLine[];
  itemCount: number;
  subtotal: number;
  totalWeightKg: number;
  shipping: ReturnType<typeof calculateShipping>;
  total: number;
  addedSnapshot: AddedToCartSnapshot | null;
  addItem: (productId: number, quantity?: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  closeAddedModal: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const productById = new Map(koncarProducts.map((p) => [p.id, p]));

const readStorage = (): CartLine[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed.filter((i) => i.quantity > 0) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartLine[]>(() => readStorage());
  const [addedSnapshot, setAddedSnapshot] = useState<AddedToCartSnapshot | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const closeAddedModal = useCallback(() => setAddedSnapshot(null), []);

  const addItem = useCallback((productId: number, quantity = 1) => {
    if (!productById.has(productId) || quantity < 1) return;
    setItems((current) => {
      const existing = current.find((line) => line.productId === productId);
      const cartQuantity = existing ? existing.quantity + quantity : quantity;
      setAddedSnapshot({
        productId,
        quantityAdded: quantity,
        cartQuantity,
        addedAt: Date.now(),
      });

      if (existing) {
        return current.map((line) =>
          line.productId === productId
            ? { ...line, quantity: line.quantity + quantity }
            : line,
        );
      }
      return [...current, { productId, quantity }];
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
    const lines: ResolvedCartLine[] = items
      .map((line) => {
        const product = productById.get(line.productId);
        if (!product) return null;
        const weightKg = getProductWeightKg(product);
        return {
          ...line,
          name: product.name,
          brand: product.brand,
          sku: product.sku,
          image: product.image,
          price: product.price,
          oldPrice: product.oldPrice,
          inStock: product.inStock,
          weightKg,
          lineTotal: product.price * line.quantity,
          lineWeightKg: weightKg * line.quantity,
        };
      })
      .filter((line): line is ResolvedCartLine => line != null);

    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const totalWeightKg = lines.reduce((sum, line) => sum + line.lineWeightKg, 0);
    const shipping = calculateShipping(subtotal, totalWeightKg);
    const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
    const total = subtotal + shipping.cost;

    return {
      items,
      lines,
      itemCount,
      subtotal,
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
  }, [items, addedSnapshot, addItem, setQuantity, removeItem, clearCart, closeAddedModal]);

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
