import { NextResponse } from 'next/server';
import { reconcileRaiAcceptOrder } from '@/lib/payments/reconcile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/payments/raiaccept/status?wcOrderId=123
 *
 * Called by the /placanje-odjava/rezultat landing page right after the
 * customer is redirected back from RaiAccept. Always re-checks the
 * authoritative status via the RaiAccept API (never trusts the `status`
 * query param from the redirect URL alone) and reconciles the WC order.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wcOrderId = searchParams.get('wcOrderId');

  if (!wcOrderId) {
    return NextResponse.json({ code: 'missing_order_id', message: 'Nedostaje broj porudžbine.' }, { status: 400 });
  }

  try {
    const result = await reconcileRaiAcceptOrder(wcOrderId);
    const { wcOrder } = result;
    const itemCount = wcOrder.line_items.reduce((sum, line) => sum + line.quantity, 0);

    return NextResponse.json({
      outcome: result.outcome,
      order: {
        orderId: String(wcOrder.id),
        orderNumber: wcOrder.number,
        status: wcOrder.status,
        customerName: `${wcOrder.billing.first_name} ${wcOrder.billing.last_name}`.trim(),
        email: wcOrder.billing.email,
        phone: wcOrder.billing.phone,
        address: wcOrder.billing.address_1,
        city: wcOrder.billing.city,
        postalCode: wcOrder.billing.postcode,
        shipping: Number(wcOrder.shipping_total || 0),
        total: Number(wcOrder.total),
        itemCount,
      },
    });
  } catch (error) {
    console.error('[api/payments/raiaccept/status]', error);
    return NextResponse.json(
      { code: 'reconcile_failed', message: 'Ne možemo proveriti status plaćanja. Kontaktirajte nas sa brojem porudžbine.' },
      { status: 502 },
    );
  }
}
