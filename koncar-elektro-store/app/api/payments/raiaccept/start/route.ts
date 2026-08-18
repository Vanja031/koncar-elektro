import { NextResponse } from 'next/server';
import { getCheckoutRuntimeFlags } from '@/lib/api/wc-store/checkout-server';
import {
  createPendingWcOrder,
  updateWcOrder,
  WcRestError,
} from '@/lib/api/wc-rest/orders';
import { createOrderEntry, createPaymentSession, RaiAcceptError } from '@/lib/payments/raiaccept';
import type { CreateOrderEntryInput } from '@/lib/payments/raiaccept';
import { SITE_URL } from '@/lib/seo/site';
import { createOrderId } from '@/lib/order';
import { getSessionCustomer } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type StartBody = {
  items?: Array<{ productId?: number; quantity?: number }>;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  customerNote?: string;
};

type ValidatedStart = {
  items: Array<{ productId: number; quantity: number }>;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  customerNote: string;
};

function validateBody(body: StartBody): { ok: true; data: ValidatedStart } | { ok: false; message: string } {
  const items = (body.items ?? [])
    .map((line) => ({ productId: Number(line.productId), quantity: Number(line.quantity) }))
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
    return { ok: false, message: 'Popunite sva obavezna polja (kontakt i adresa).' };
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
    },
  };
}

function resultUrl(wcOrderId: string, status: 'success' | 'fail' | 'cancel') {
  return `${SITE_URL}/placanje-odjava/rezultat?status=${status}&wcOrderId=${encodeURIComponent(wcOrderId)}`;
}

/**
 * POST /api/payments/raiaccept/start
 *
 * Creates a pending WC order via REST API v3 (does not require an enabled
 * Store API payment gateway), opens a RaiAccept payment session, stores the
 * RaiAccept order id on the WC order, returns the hosted-page redirect URL.
 */
export async function POST(request: Request) {
  let body: StartBody;
  try {
    body = (await request.json()) as StartBody;
  } catch {
    return NextResponse.json({ code: 'invalid_json', message: 'Neispravan zahtev.' }, { status: 400 });
  }

  const validated = validateBody(body);
  if (validated.ok === false) {
    return NextResponse.json({ code: 'validation_error', message: validated.message }, { status: 400 });
  }

  const flags = getCheckoutRuntimeFlags();
  const input = validated.data;

  if (!flags.liveCheckout) {
    const orderId = createOrderId();
    return NextResponse.json({
      mode: 'mock',
      paymentRedirectURL: `${SITE_URL}/placanje-odjava/rezultat?status=success&wcOrderId=${orderId}&mock=1`,
    });
  }

  try {
    // 1) Pending WC order via REST (prices filled by WC from product_id).
    const customer = getSessionCustomer();
    const wcOrder = await createPendingWcOrder({
      ...input,
      customerId: customer?.id,
      paymentMethod: 'raiaccept-card',
      paymentMethodTitle: 'Kartica (RaiAccept)',
    });
    const wcOrderId = String(wcOrder.id);
    const amount = Number(wcOrder.total);
    const currency = wcOrder.currency || 'RSD';

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new WcRestError('Nevažeći iznos porudžbine.', 502, { wcOrderId, total: wcOrder.total });
    }

    const raiInput: CreateOrderEntryInput = {
      consumer: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        mobilePhone: input.phone,
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined,
      },
      billingAddress: {
        firstName: input.firstName,
        lastName: input.lastName,
        addressStreet1: input.address,
        city: input.city,
        postalCode: input.postalCode,
        country: 'SRB',
      },
      shippingAddress: {
        firstName: input.firstName,
        lastName: input.lastName,
        addressStreet1: input.address,
        city: input.city,
        postalCode: input.postalCode,
        country: 'SRB',
      },
      invoice: {
        amount,
        currency,
        description: `Porudžbina #${wcOrder.number}`,
        merchantOrderReference: `KE-${wcOrderId}-${Date.now().toString(36)}`,
        items: [{ description: `Porudžbina #${wcOrder.number}`, numberOfItems: 1, price: amount }],
      },
      urls: {
        successUrl: resultUrl(wcOrderId, 'success'),
        cancelUrl: resultUrl(wcOrderId, 'cancel'),
        failUrl: resultUrl(wcOrderId, 'fail'),
        notificationUrl: `${SITE_URL}/api/payments/raiaccept/webhook`,
      },
    };

    // 2) RaiAccept order + payment session
    const orderEntry = await createOrderEntry(raiInput);
    const session = await createPaymentSession(orderEntry.orderIdentification, raiInput);

    // 3) Link RaiAccept order id on the WC order for reconcile
    await updateWcOrder(wcOrderId, {
      meta_data: [{ key: '_raiaccept_order_id', value: orderEntry.orderIdentification }],
      note: `RaiAccept: sesija plaćanja kreirana (order ${orderEntry.orderIdentification}).`,
    });

    return NextResponse.json({
      mode: 'live',
      wcOrderId,
      paymentRedirectURL: session.paymentRedirectURL,
    });
  } catch (error) {
    if (error instanceof WcRestError) {
      return NextResponse.json(
        { code: 'wc_error', message: error.message || 'Greška pri kreiranju porudžbine.', details: error.body },
        { status: error.status >= 400 && error.status < 600 ? error.status : 502 },
      );
    }
    if (error instanceof RaiAcceptError) {
      return NextResponse.json(
        {
          code: 'raiaccept_error',
          message: 'Kartično plaćanje trenutno nije dostupno. Pokušajte drugi način plaćanja.',
          details: error.body,
        },
        { status: 502 },
      );
    }

    console.error('[api/payments/raiaccept/start]', error);
    return NextResponse.json(
      { code: 'checkout_failed', message: 'Porudžbina nije uspela. Pokušajte ponovo ili nas kontaktirajte.' },
      { status: 502 },
    );
  }
}
