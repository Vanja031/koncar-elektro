import { NextResponse } from 'next/server';
import { reconcileRaiAcceptOrder } from '@/lib/payments/reconcile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RaiAcceptWebhookBody = {
  order?: {
    orderIdentification?: string;
    invoice?: { merchantOrderReference?: string };
  };
};

/**
 * POST /api/payments/raiaccept/webhook
 *
 * RaiAccept notification — fallback/monitoring path in case the customer
 * closes the tab before the redirect-back landing page (`/placanje-odjava/rezultat`)
 * finishes reconciling. Per RaiAccept docs we never trust the webhook payload
 * directly; we only use it to know WHICH order to re-check, then call the
 * RaiAccept API for the authoritative status (same `reconcileRaiAcceptOrder`
 * helper as the browser redirect path — safe to run twice).
 *
 * Returns non-2xx on failure so RaiAccept retries (up to 3 times).
 */
export async function POST(request: Request) {
  let body: RaiAcceptWebhookBody;
  try {
    body = (await request.json()) as RaiAcceptWebhookBody;
  } catch {
    return NextResponse.json({ code: 'invalid_json' }, { status: 400 });
  }

  const merchantOrderReference = body.order?.invoice?.merchantOrderReference;
  const match = merchantOrderReference?.match(/^KE-(\d+)-/);
  const wcOrderId = match?.[1];

  if (!wcOrderId) {
    console.error('[api/payments/raiaccept/webhook] missing/unrecognized merchantOrderReference', merchantOrderReference);
    // Acknowledge with 200 — malformed reference will never resolve on retry.
    return NextResponse.json({ ok: false, reason: 'unrecognized_reference' }, { status: 200 });
  }

  try {
    const result = await reconcileRaiAcceptOrder(wcOrderId);
    return NextResponse.json({ ok: true, outcome: result.outcome });
  } catch (error) {
    console.error('[api/payments/raiaccept/webhook]', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
