import { NextResponse } from 'next/server';
import { CouponError, resolveCoupon } from '@/lib/api/wc-rest/coupons';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type CouponBody = {
  code?: unknown;
  items?: Array<{ productId?: unknown; quantity?: unknown }>;
};

/**
 * POST /api/wc/coupon
 * Checks a code and returns the rate per cart line. Does not create an order.
 */
export async function POST(request: Request) {
  let body: CouponBody;
  try {
    body = (await request.json()) as CouponBody;
  } catch {
    return NextResponse.json({ code: 'invalid_json', message: 'Neispravan zahtev.' }, { status: 400 });
  }

  const code = typeof body.code === 'string' ? body.code : '';
  const items = (body.items ?? [])
    .map((line) => ({ productId: Number(line.productId), quantity: Number(line.quantity) }))
    .filter((line) => Number.isFinite(line.productId) && line.productId > 0 && line.quantity > 0);

  try {
    const resolved = await resolveCoupon(code, items);
    return NextResponse.json({
      code: resolved.quote.code,
      kind: resolved.kind,
      flatRate: resolved.flatRate,
      lines: resolved.quote.lines.map((line) => ({
        productId: line.productId,
        rate: line.rate,
      })),
    });
  } catch (error) {
    if (error instanceof CouponError) {
      return NextResponse.json(
        { code: 'invalid_coupon', message: error.message },
        { status: error.status },
      );
    }
    console.error('[api/wc/coupon]', error);
    return NextResponse.json(
      { code: 'coupon_failed', message: 'Kod trenutno ne možemo da proverimo. Pokušajte ponovo.' },
      { status: 503 },
    );
  }
}
