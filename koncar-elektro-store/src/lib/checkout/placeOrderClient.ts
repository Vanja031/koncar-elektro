import type { PaymentMethod, PlacedOrder } from '@/lib/order';

export type CheckoutSubmitPayload = {
  items: Array<{ productId: number; quantity: number }>;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  customerNote: string;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
};

export type CheckoutApiSuccess = {
  mode: 'live' | 'mock';
  orderId: string;
  orderNumber: string;
  status: string;
  paymentMethod: PaymentMethod;
  customerName: string;
  forceTestCustomer?: boolean;
  note?: string;
  message?: string;
};

export type CheckoutApiError = {
  code?: string;
  message?: string;
};

export class CheckoutClientError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'CheckoutClientError';
    this.status = status;
    this.code = code;
  }
}

/** Submit checkout via Next.js BFF — never calls koncarelektro.rs from the browser. */
export async function placeOrderViaApi(payload: CheckoutSubmitPayload): Promise<{
  api: CheckoutApiSuccess;
  placed: PlacedOrder;
}> {
  const response = await fetch('/api/wc/checkout/', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: payload.items,
      email: payload.email,
      phone: payload.phone,
      firstName: payload.firstName,
      lastName: payload.lastName,
      address: payload.address,
      city: payload.city,
      postalCode: payload.postalCode,
      customerNote: payload.customerNote,
      paymentMethod: payload.paymentMethod,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as CheckoutApiSuccess & CheckoutApiError;

  if (!response.ok) {
    throw new CheckoutClientError(
      data.message || 'Porudžbina nije uspela.',
      response.status,
      data.code,
    );
  }

  if (!data.orderId) {
    throw new CheckoutClientError('Nedostaje broj porudžbine u odgovoru.', 502, 'missing_order_id');
  }

  const placed: PlacedOrder = {
    id: data.orderNumber || data.orderId,
    email: payload.email,
    phone: payload.phone,
    customerName: data.customerName || `${payload.firstName} ${payload.lastName}`.trim(),
    address: payload.address,
    city: payload.city,
    postalCode: payload.postalCode,
    paymentMethod: payload.paymentMethod === 'card' ? 'cod' : payload.paymentMethod,
    subtotal: payload.subtotal,
    shipping: payload.shipping,
    total: payload.total,
    itemCount: payload.itemCount,
    createdAt: new Date().toISOString(),
    mode: data.mode,
    wcOrderId: data.mode === 'live' ? data.orderId : undefined,
  };

  return { api: data as CheckoutApiSuccess, placed };
}
