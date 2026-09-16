/**
 * Server-only WooCommerce checkout for COD / bank transfer.
 * Creates the order via REST v3 with our shipping quote on the shipping line
 * so customer emails match the storefront (Store API would email WC's flat rate
 * before any post-create sync).
 */
import {
  createPendingWcOrder,
  syncOrderShipping,
  updateWcOrder,
  WcRestError,
} from '@/lib/api/wc-rest/orders';
import { calculateShipping } from '@/lib/shipping';

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
  /** Cart snapshot used to apply the same free-shipping rule as the storefront. */
  subtotal: number;
  totalWeightKg: number;
};

export type PlaceOrderResult = {
  orderId: string;
  orderNumber: string;
  status: string;
  paymentMethod: 'cod' | 'bacs';
  customerName: string;
  note: string;
};

const PAYMENT_TITLES: Record<'cod' | 'bacs', string> = {
  cod: 'Plaćanje gotovinski prilikom preuzimanja',
  bacs: 'Uplata na tekući račun',
};

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

function resolveCustomerNote(input: PlaceOrderInput, forced: boolean): string {
  if (forced) return 'TEST PORUDŽBINA';
  return (input.customerNote ?? '').trim();
}

/**
 * Place a WooCommerce COD/bank order with correct weight-tier shipping.
 *
 * Flow (order matters for emails):
 * 1) Create as `pending` with our shipping line
 * 2) Re-assert shipping via REST (WC zone rates can overwrite flat_rate on save)
 * 3) Move to `processing` / `on-hold` — customer emails fire on this transition
 *    and therefore see the corrected delivery total
 *
 * Throws WcStoreRequestError on API failures (same shape the BFF route expects).
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
  const customerNote = resolveCustomerNote(input, forced);
  const firstName = forced ? 'Test' : input.firstName;
  const lastName = forced ? 'Test' : input.lastName;
  const customerName = `${firstName} ${lastName}`.trim();
  const finalStatus = input.paymentMethod === 'cod' ? 'processing' : 'on-hold';
  const expectedShipping = calculateShipping(input.subtotal, input.totalWeightKg);

  try {
    // 1) Pending first — avoid customer "processing" email until shipping is locked in.
    const created = await createPendingWcOrder({
      items: input.items,
      email: input.email,
      phone: input.phone,
      firstName: input.firstName,
      lastName: input.lastName,
      address: input.address,
      city: input.city,
      postalCode: input.postalCode,
      customerNote: input.customerNote,
      paymentMethod: input.paymentMethod,
      paymentMethodTitle: PAYMENT_TITLES[input.paymentMethod],
      subtotal: input.subtotal,
      totalWeightKg: input.totalWeightKg,
      status: 'pending',
    });

    // 2) Force our quote onto the order (covers WC recalculating zone flat_rate to 400).
    await syncOrderShipping(created.id, input.subtotal, input.totalWeightKg);

    // 3) Status change → customer email with the totals after sync.
    const order = await updateWcOrder(created.id, { status: finalStatus });

    const shipped = Number(order.shipping_total);
    if (Number.isFinite(shipped) && Math.abs(shipped - expectedShipping.cost) > 0.009) {
      console.error(
        '[checkout] shipping_total mismatch after sync',
        {
          orderId: order.id,
          expected: expectedShipping.cost,
          actual: order.shipping_total,
          subtotal: input.subtotal,
          totalWeightKg: input.totalWeightKg,
        },
      );
    }

    return {
      orderId: String(order.id),
      orderNumber: order.number || String(order.id),
      status: order.status || finalStatus,
      paymentMethod: input.paymentMethod,
      customerName,
      note: customerNote,
    };
  } catch (err) {
    if (err instanceof WcRestError) {
      throw new WcStoreRequestError(err.message || 'Greška pri kreiranju porudžbine.', err.status, err.body);
    }
    throw err;
  }
}

export function getCheckoutRuntimeFlags() {
  return {
    liveCheckout: isLiveCheckoutEnabled(),
    forceTestCustomer: isForceTestCustomer(),
  };
}

export { WcStoreRequestError };
