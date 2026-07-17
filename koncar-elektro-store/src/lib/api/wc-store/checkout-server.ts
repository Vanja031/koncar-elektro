/**
 * Server-only WooCommerce Store API checkout.
 * Uses Cart-Token (no browser CORS). Never call from client components.
 */
import { serverWcStoreApiBase } from '@/lib/api/server-config';
import type {
  WcStoreAddress,
  WcStoreApiErrorBody,
  WcStoreCart,
  WcStoreCheckoutResult,
} from '@/lib/api/types/wc-cart';

export type CheckoutLineInput = {
  productId: number;
  quantity: number;
};

export type PlaceOrderInput = {
  items: CheckoutLineInput[];
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  /** Form note from shopper — ignored when force-test is on. */
  customerNote?: string;
  /** WC payment method id: `cod` | `bacs` */
  paymentMethod: 'cod' | 'bacs';
};

export type PlaceOrderResult = {
  orderId: string;
  orderNumber: string;
  status: string;
  paymentMethod: 'cod' | 'bacs';
  customerName: string;
  note: string;
};

const DEFAULT_COUNTRY = 'RS';
const DEFAULT_STATE = 'RS23';

class WcStoreRequestError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'WcStoreRequestError';
    this.status = status;
    this.body = body;
  }
}

function isLiveCheckoutEnabled() {
  return process.env.WC_LIVE_CHECKOUT === 'true';
}

/** When true (default), billing name + note are forced to test markers. */
function isForceTestCustomer() {
  return process.env.WC_CHECKOUT_FORCE_TEST_CUSTOMER !== 'false';
}

function buildUrl(path: string) {
  const base = serverWcStoreApiBase.replace(/\/$/, '');
  const normalized = `${base}/${path.replace(/^\//, '')}`;
  const url = new URL(normalized);
  if (!url.pathname.endsWith('/')) {
    url.pathname = `${url.pathname}/`;
  }
  return url.toString();
}

async function wcFetch<T>(
  path: string,
  init: RequestInit & { cartToken?: string } = {},
): Promise<{ data: T; cartToken: string | null }> {
  const { cartToken, headers, ...rest } = init;
  const response = await fetch(buildUrl(path), {
    ...rest,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(cartToken ? { 'Cart-Token': cartToken } : {}),
      ...headers,
    },
    cache: 'no-store',
  });

  const nextToken = response.headers.get('Cart-Token') ?? cartToken ?? null;
  let body: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const err = body as WcStoreApiErrorBody | null;
    const message =
      (err && typeof err === 'object' && typeof err.message === 'string' && err.message) ||
      `WooCommerce Store API ${response.status}`;
    throw new WcStoreRequestError(message, response.status, body);
  }

  return { data: body as T, cartToken: nextToken };
}

function buildAddress(input: PlaceOrderInput, forced: boolean): WcStoreAddress {
  return {
    first_name: forced ? 'Test' : input.firstName,
    last_name: forced ? 'Test' : input.lastName,
    company: '',
    address_1: input.address,
    address_2: '',
    city: input.city,
    state: DEFAULT_STATE,
    postcode: input.postalCode,
    country: DEFAULT_COUNTRY,
    email: input.email,
    phone: input.phone,
  };
}

function resolveCustomerNote(input: PlaceOrderInput, forced: boolean): string {
  if (forced) return 'TEST PORUDŽBINA';
  return (input.customerNote ?? '').trim();
}

async function selectShippingIfNeeded(cartToken: string, cart: WcStoreCart): Promise<string> {
  if (!cart.needs_shipping) return cartToken;

  const packages = cart.shipping_rates ?? [];
  for (const pkg of packages) {
    const rates = pkg.shipping_rates ?? [];
    if (rates.length === 0) continue;
    const selected = rates.find((rate) => rate.selected) ?? rates[0];
    if (!selected?.rate_id) continue;
    if (selected.selected) continue;

    const { cartToken: next } = await wcFetch<WcStoreCart>('cart/select-shipping-rate', {
      method: 'POST',
      cartToken,
      body: JSON.stringify({
        package_id: pkg.package_id,
        rate_id: selected.rate_id,
      }),
    });
    if (next) cartToken = next;
  }

  return cartToken;
}

/**
 * Place a WooCommerce order via Store API (server → WP).
 * Throws WcStoreRequestError on API failures.
 */
export async function placeWcStoreOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  if (!isLiveCheckoutEnabled()) {
    throw new Error('WC_LIVE_CHECKOUT is not enabled');
  }
  if (!input.items.length) {
    throw new WcStoreRequestError('Korpa je prazna.', 400, { code: 'empty_cart' });
  }
  if (input.paymentMethod !== 'cod' && input.paymentMethod !== 'bacs') {
    throw new WcStoreRequestError('Nepodržan način plaćanja.', 400, { code: 'invalid_payment' });
  }

  const forced = isForceTestCustomer();
  const address = buildAddress(input, forced);
  const shippingAddress: WcStoreAddress = { ...address };
  delete shippingAddress.email;
  const customerNote = resolveCustomerNote(input, forced);
  const customerName = `${address.first_name} ${address.last_name}`.trim();

  // 1) Fresh cart session
  let { cartToken } = await wcFetch<WcStoreCart>('cart', { method: 'GET' });
  if (!cartToken) {
    throw new WcStoreRequestError('Nedostaje Cart-Token iz WooCommerce-a.', 502, null);
  }

  // 2) Add local cart lines into WC cart
  for (const line of input.items) {
    const added = await wcFetch<WcStoreCart>('cart/add-item', {
      method: 'POST',
      cartToken,
      body: JSON.stringify({
        id: line.productId,
        quantity: line.quantity,
      }),
    });
    if (added.cartToken) cartToken = added.cartToken;
  }

  // 3) Customer addresses (needed before shipping rates resolve)
  const updated = await wcFetch<WcStoreCart>('cart/update-customer', {
    method: 'POST',
    cartToken,
    body: JSON.stringify({
      billing_address: address,
      shipping_address: shippingAddress,
    }),
  });
  if (updated.cartToken) cartToken = updated.cartToken;

  // 4) Refresh cart + select shipping
  const cartSnap = await wcFetch<WcStoreCart>('cart', { method: 'GET', cartToken });
  if (cartSnap.cartToken) cartToken = cartSnap.cartToken;
  cartToken = await selectShippingIfNeeded(cartToken, cartSnap.data);

  // 5) Process checkout → creates a real WC order
  const checkout = await wcFetch<WcStoreCheckoutResult>('checkout', {
    method: 'POST',
    cartToken,
    body: JSON.stringify({
      billing_address: address,
      shipping_address: shippingAddress,
      customer_note: customerNote,
      payment_method: input.paymentMethod,
    }),
  });

  const result = checkout.data;
  if (!result?.order_id) {
    throw new WcStoreRequestError('WooCommerce nije vratio broj porudžbine.', 502, result);
  }

  return {
    orderId: String(result.order_id),
    orderNumber: result.order_number || String(result.order_id),
    status: result.status || 'processing',
    paymentMethod: input.paymentMethod,
    customerName,
    note: customerNote,
  };
}

export function getCheckoutRuntimeFlags() {
  return {
    liveCheckout: isLiveCheckoutEnabled(),
    forceTestCustomer: isForceTestCustomer(),
  };
}

export { WcStoreRequestError };
