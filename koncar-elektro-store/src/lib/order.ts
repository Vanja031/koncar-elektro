export type PaymentMethod = 'cod' | 'card' | 'bank';

export type PlacedOrderItem = {
  id: number;
  name: string;
  brand?: string;
  category?: string;
  price: number;
  quantity: number;
};

export type PlacedOrder = {
  id: string;
  email: string;
  phone: string;
  customerName: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
  createdAt: string;
  /** `live` = real WC order; `mock` = local-only (WC_LIVE_CHECKOUT off). */
  mode?: 'live' | 'mock';
  /** Numeric WooCommerce order id when mode is live. */
  wcOrderId?: string;
  /** Line-item snapshot for the GA4 `purchase` event — cart is cleared right after. */
  items?: PlacedOrderItem[];
};

/** UI payment methods that can actually create a WC order today. */
export const checkoutEnabledPaymentMethods: PaymentMethod[] = ['cod', 'card', 'bank'];

const ORDER_KEY = 'koncar-last-order';

export const savePlacedOrder = (order: PlacedOrder) => {
  sessionStorage.setItem(ORDER_KEY, JSON.stringify(order));
};

export const getPlacedOrder = (): PlacedOrder | null => {
  try {
    const raw = sessionStorage.getItem(ORDER_KEY);
    return raw ? (JSON.parse(raw) as PlacedOrder) : null;
  } catch {
    return null;
  }
};

export const createOrderId = () =>
  `KE-${Date.now().toString(36).toUpperCase().slice(-8)}`;

export const paymentMethodOrder: PaymentMethod[] = ['cod', 'card', 'bank'];

export const paymentMethodLabel: Record<PaymentMethod, string> = {
  cod: 'Plaćanje pouzećem',
  card: 'Platna kartica',
  bank: 'Uplata na račun',
};
