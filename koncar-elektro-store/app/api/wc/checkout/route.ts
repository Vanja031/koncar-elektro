import { NextResponse } from 'next/server';
import {
  getCheckoutRuntimeFlags,
  placeWcStoreOrder,
  WcStoreRequestError,
  type PlaceOrderInput,
} from '@/lib/api/wc-store/checkout-server';
import { createOrderId } from '@/lib/order';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type CheckoutBody = {
  items?: Array<{ productId?: number; quantity?: number }>;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  customerNote?: string;
  /** UI keys: cod | bank (maps to bacs). card is rejected. */
  paymentMethod?: string;
};

function mapPaymentMethod(raw: string | undefined): 'cod' | 'bacs' | 'card' | null {
  if (raw === 'cod') return 'cod';
  if (raw === 'bank' || raw === 'bacs') return 'bacs';
  if (raw === 'card') return 'card';
  return null;
}

function validateBody(body: CheckoutBody): { ok: true; data: PlaceOrderInput } | { ok: false; message: string } {
  const payment = mapPaymentMethod(body.paymentMethod);
  if (payment === 'card') {
    return { ok: false, message: 'Kartčno plaćanje nije još uvek dostupno.' };
  }
  if (payment !== 'cod' && payment !== 'bacs') {
    return { ok: false, message: 'Izaberite način plaćanja (pouzeće ili uplata na račun).' };
  }

  const items = (body.items ?? [])
    .map((line) => ({
      productId: Number(line.productId),
      quantity: Number(line.quantity),
    }))
    .filter((line) => Number.isFinite(line.productId) && line.productId > 0 && line.quantity > 0);

  if (items.length === 0) {
    return { ok: false, message: 'Korpa je prazna.' };
  }

  const email = String(body.email ?? '').trim();
  const phone = String(body.phone ?? '').trim();
  const firstName = String(body.firstName ?? '').trim();
  const lastName = String(body.lastName ?? '').trim();
  const address = String(body.address ?? '').trim();
  const city = String(body.city ?? '').trim();
  const postalCode = String(body.postalCode ?? '').trim();

  if (!email || !phone || !firstName || !lastName || !address || !city || !postalCode) {
    return {
      ok: false,
      message: 'Popunite sva obavezna polja (kontakt i adresa).',
    };
  }

  return {
    ok: true,
    data: {
      items,
      email,
      phone,
      firstName,
      lastName,
      address,
      city,
      postalCode,
      customerNote: String(body.customerNote ?? '').trim(),
      paymentMethod: payment,
    },
  };
}

/**
 * POST /api/wc/checkout
 *
 * - WC_LIVE_CHECKOUT=true → real Store API order on koncarelektro.rs
 * - otherwise → mock success (no write to live WP)
 *
 * When live + WC_CHECKOUT_FORCE_TEST_CUSTOMER≠false → name "Test Test",
 * note "TEST PORUDŽBINA".
 */
export async function POST(request: Request) {
  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ code: 'invalid_json', message: 'Neispravan zahtev.' }, { status: 400 });
  }

  const validated = validateBody(body);
  if (validated.ok === false) {
    return NextResponse.json({ code: 'validation_error', message: validated.message }, { status: 400 });
  }

  const orderInput = validated.data;
  const flags = getCheckoutRuntimeFlags();

  // Safe default: no live writes until you explicitly enable WC_LIVE_CHECKOUT.
  if (!flags.liveCheckout) {
    const orderId = createOrderId();
    return NextResponse.json({
      mode: 'mock',
      orderId,
      orderNumber: orderId,
      status: 'mock',
      paymentMethod: orderInput.paymentMethod === 'bacs' ? 'bank' : 'cod',
      customerName: `${orderInput.firstName} ${orderInput.lastName}`.trim(),
      forceTestCustomer: false,
      message: 'Mock porudžbina — WC_LIVE_CHECKOUT nije uključen, live WooCommerce nije dirnut.',
    });
  }

  try {
    const result = await placeWcStoreOrder(orderInput);
    return NextResponse.json({
      mode: 'live',
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      status: result.status,
      paymentMethod: result.paymentMethod === 'bacs' ? 'bank' : 'cod',
      customerName: result.customerName,
      forceTestCustomer: flags.forceTestCustomer,
      note: result.note,
    });
  } catch (error) {
    if (error instanceof WcStoreRequestError) {
      return NextResponse.json(
        {
          code: 'wc_store_error',
          message: error.message || 'Greška pri kreiranju porudžbine.',
          details: error.body,
        },
        { status: error.status >= 400 && error.status < 600 ? error.status : 502 },
      );
    }

    console.error('[api/wc/checkout]', error);
    return NextResponse.json(
      {
        code: 'checkout_failed',
        message: 'Porudžbina nije uspela. Pokušajte ponovo ili nas kontaktirajte.',
      },
      { status: 502 },
    );
  }
}

export async function GET() {
  const flags = getCheckoutRuntimeFlags();
  return NextResponse.json({
    liveCheckout: flags.liveCheckout,
    forceTestCustomer: flags.forceTestCustomer,
    allowedPaymentMethods: ['cod', 'bacs'],
  });
}
