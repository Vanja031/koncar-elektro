/**
 * Server-only WooCommerce REST API v3 helper for creating/updating orders.
 */
import { wcV3Fetch, WcRestError } from '@/lib/api/wc-rest/client';
import { SHIPPING_CARRIER, SHIPPING_COST } from '@/lib/shipping';

export { WcRestError };

export type WcOrderUpdatePatch = {
  status?: 'pending' | 'processing' | 'on-hold' | 'completed' | 'cancelled' | 'failed' | 'refunded';
  payment_method?: string;
  payment_method_title?: string;
  transaction_id?: string;
  customer_id?: number;
  /** When true, WC sets date_paid and marks the order as paid in admin. */
  set_paid?: boolean;
  meta_data?: Array<{ key: string; value: string }>;
  /** Appended as a private WooCommerce order note (customer_note=false). */
  note?: string;
};

export type CreatePendingOrderInput = {
  items: Array<{ productId: number; quantity: number }>;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  customerNote?: string;
  paymentMethod: string;
  paymentMethodTitle: string;
  metaData?: Array<{ key: string; value: string }>;
  customerId?: number;
};

export type WcOrderBilling = {
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  postcode: string;
  email: string;
  phone: string;
};

export type WcOrderLineItem = {
  name: string;
  quantity: number;
  total: string;
};

export type WcOrderMeta = { id?: number; key: string; value: string };

export type WcOrderV3 = {
  id: number;
  number: string;
  status: string;
  payment_method: string;
  payment_method_title: string;
  total: string;
  shipping_total: string;
  currency: string;
  billing: WcOrderBilling;
  line_items: WcOrderLineItem[];
  meta_data: WcOrderMeta[];
};

export async function getWcOrder(id: string | number): Promise<WcOrderV3> {
  return wcV3Fetch<WcOrderV3>(`/orders/${id}`, { method: 'GET' });
}

/** Reads a single meta value by key from an already-fetched order (or null). */
export function getOrderMeta(order: WcOrderV3, key: string): string | null {
  return order.meta_data?.find((m) => m.key === key)?.value ?? null;
}

/**
 * Creates a pending WC order via REST API v3 — does NOT require an enabled
 * Store API payment gateway (unlike Store API `/checkout`). Used for the
 * RaiAccept card flow where we only need a pending order + total before
 * redirecting to the bank.
 */
export async function createPendingWcOrder(input: CreatePendingOrderInput): Promise<WcOrderV3> {
  const forceTest = process.env.WC_CHECKOUT_FORCE_TEST_CUSTOMER !== 'false';
  const firstName = forceTest ? 'Test' : input.firstName;
  const lastName = forceTest ? 'Test' : input.lastName;
  const customerNote = forceTest
    ? 'TEST PORUDŽBINA'
    : (input.customerNote ?? '').trim();

  return wcV3Fetch<WcOrderV3>('/orders', {
    method: 'POST',
    body: JSON.stringify({
      status: 'pending',
      set_paid: false,
      ...(input.customerId ? { customer_id: input.customerId } : {}),
      payment_method: input.paymentMethod,
      payment_method_title: input.paymentMethodTitle,
      customer_note: customerNote,
      billing: {
        first_name: firstName,
        last_name: lastName,
        address_1: input.address,
        city: input.city,
        postcode: input.postalCode,
        country: 'RS',
        email: input.email,
        phone: input.phone,
      },
      shipping: {
        first_name: firstName,
        last_name: lastName,
        address_1: input.address,
        city: input.city,
        postcode: input.postalCode,
        country: 'RS',
      },
      line_items: input.items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      })),
      shipping_lines: [
        {
          method_id: 'flat_rate',
          method_title: `Kurirska služba: ${SHIPPING_CARRIER}`,
          total: String(SHIPPING_COST),
        },
      ],
      meta_data: input.metaData ?? [],
    }),
  });
}

/** Updates order fields and/or appends a private order note in one call. */
export async function updateWcOrder(
  id: string | number,
  patch: WcOrderUpdatePatch,
): Promise<WcOrderV3> {
  const { note, ...fields } = patch;
  const order = await wcV3Fetch<WcOrderV3>(`/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(fields),
  });

  if (note) {
    await wcV3Fetch(`/orders/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note, customer_note: false }),
    }).catch((err) => {
      console.error('[wc-rest/orders] failed to add order note', err);
    });
  }

  return order;
}
