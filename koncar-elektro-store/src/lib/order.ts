export type PaymentMethod = 'cod' | 'card' | 'bank';

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
};

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
