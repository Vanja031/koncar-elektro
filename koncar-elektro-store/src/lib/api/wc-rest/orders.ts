/**
 * Server-only WooCommerce REST API v3 helper for creating/updating orders.
 */
import { wcV3Fetch, WcRestError } from '@/lib/api/wc-rest/client';
import { calculateShipping, SHIPPING_CARRIER } from '@/lib/shipping';

export { WcRestError };

export type WcShippingLinePatch = {
  /** Existing shipping_lines[].id to update in place; omit to add a new line. */
  id?: number;
  method_id: string;
  method_title: string;
  total: string;
};

export type WcOrderUpdatePatch = {
  status?: 'pending' | 'processing' | 'on-hold' | 'completed' | 'cancelled' | 'failed' | 'refunded';
  payment_method?: string;
  payment_method_title?: string;
  transaction_id?: string;
  customer_id?: number;
  /** When true, WC sets date_paid and marks the order as paid in admin. */
  set_paid?: boolean;
  meta_data?: Array<{ key: string; value: string }>;
  /** Replaces/updates shipping line(s) — WC recalculates order totals. */
  shipping_lines?: WcShippingLinePatch[];
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
  /** Cart snapshot used to compute the shipping line — see `calculateShipping`. */
  subtotal: number;
  totalWeightKg: number;
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

export type WcOrderShippingLine = {
  id: number;
  method_id: string;
  method_title: string;
  total: string;
};

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
  shipping_lines?: WcOrderShippingLine[];
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
  const shipping = calculateShipping(input.subtotal, input.totalWeightKg);

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
          method_id: shipping.isFree ? 'free_shipping' : 'flat_rate',
          method_title: shipping.isFree ? `Besplatna dostava — ${SHIPPING_CARRIER}` : shipping.label,
          total: String(shipping.cost),
        },
      ],
      meta_data: input.metaData ?? [],
    }),
  });
}

/**
 * Best-effort override of an already-created order's shipping line so it
 * matches our free-shipping rule (used after Store API checkout, which lets
 * WooCommerce auto-select its own configured shipping rate). Never throws —
 * on any failure it just logs and leaves the WC-selected rate as-is, so a
 * broken lookup can never block order creation.
 */
export async function syncOrderShipping(
  id: string | number,
  subtotal: number,
  totalWeightKg: number,
): Promise<void> {
  try {
    const order = await getWcOrder(id);
    const shipping = calculateShipping(subtotal, totalWeightKg);
    const existing = order.shipping_lines?.[0];
    const desiredMethodId = shipping.isFree ? 'free_shipping' : 'flat_rate';
    const desiredTitle = shipping.isFree ? `Besplatna dostava — ${SHIPPING_CARRIER}` : shipping.label;
    const desiredTotal = String(shipping.cost);

    const alreadyCorrect =
      existing &&
      existing.total === desiredTotal &&
      existing.method_id === desiredMethodId;
    if (alreadyCorrect) return;

    await updateWcOrder(id, {
      shipping_lines: [
        {
          ...(existing?.id ? { id: existing.id } : {}),
          method_id: desiredMethodId,
          method_title: desiredTitle,
          total: desiredTotal,
        },
      ],
    });
  } catch (err) {
    console.error('[wc-rest/orders] syncOrderShipping failed — keeping WC-selected shipping rate', err);
  }
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
