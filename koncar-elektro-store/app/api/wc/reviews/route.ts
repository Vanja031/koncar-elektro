import { NextResponse } from 'next/server';
import {
  createPendingProductReview,
  getProductReviews,
  hasCustomerReviewedProduct,
} from '@/lib/api/wc-rest/reviews';
import { WcRestError } from '@/lib/api/wc-rest/client';
import { getSessionCustomer } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function GET(request: Request) {
  const productId = Number(new URL(request.url).searchParams.get('productId'));
  if (!Number.isFinite(productId) || productId <= 0) {
    return NextResponse.json({ code: 'validation_error', message: 'Nedostaje proizvod.' }, { status: 400 });
  }

  try {
    const reviews = await getProductReviews(productId);
    const session = getSessionCustomer();
    const alreadyReviewed = session?.email
      ? await hasCustomerReviewedProduct(productId, session.email).catch(() => false)
      : false;
    return NextResponse.json({ reviews, alreadyReviewed });
  } catch (error) {
    console.error('[api/wc/reviews GET]', error);
    return NextResponse.json({ reviews: [], alreadyReviewed: false });
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ code: 'invalid_json', message: 'Neispravan zahtev.' }, { status: 400 });
  }

  const session = getSessionCustomer();
  const productId = Number(body.productId);
  const rating = Number(body.rating);
  const review = String(body.review ?? '').trim();
  const reviewer = String(body.reviewer ?? session?.firstName ?? '').trim() || session?.email || '';
  const reviewerEmail = (session?.email || String(body.reviewerEmail ?? '')).trim().toLowerCase();

  if (!Number.isFinite(productId) || productId <= 0) {
    return NextResponse.json({ code: 'validation_error', message: 'Nedostaje proizvod.' }, { status: 400 });
  }
  if (!reviewer || !reviewerEmail || !review) {
    return NextResponse.json({ code: 'validation_error', message: 'Popunite ime, email i recenziju.' }, { status: 400 });
  }
  if (!EMAIL_PATTERN.test(reviewerEmail)) {
    return NextResponse.json({ code: 'validation_error', message: 'Neispravan email.' }, { status: 400 });
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ code: 'validation_error', message: 'Ocena mora biti od 1 do 5.' }, { status: 400 });
  }

  try {
    let alreadyReviewed = false;
    try {
      alreadyReviewed = await hasCustomerReviewedProduct(productId, reviewerEmail);
    } catch (error) {
      console.error('[api/wc/reviews] duplicate check failed', error);
    }
    if (alreadyReviewed) {
      return NextResponse.json(
        {
          code: 'already_reviewed',
          message: 'Već ste ostavili recenziju za ovaj proizvod.',
        },
        { status: 409 },
      );
    }

    await createPendingProductReview({
      productId,
      reviewer,
      reviewerEmail,
      review,
      rating,
    });
    return NextResponse.json({
      ok: true,
      message: 'Hvala! Recenzija je poslata i biće objavljena nakon odobrenja.',
    });
  } catch (error) {
    if (error instanceof WcRestError) {
      const duplicate =
        (error.code ?? '').toLowerCase().includes('duplicate') ||
        /duplicate|već ste|already/i.test(error.message);
      return NextResponse.json(
        {
          code: duplicate ? 'already_reviewed' : error.code || 'wc_error',
          message: duplicate
            ? 'Već ste ostavili recenziju za ovaj proizvod.'
            : stripHtml(error.message) || 'Slanje recenzije nije uspelo.',
        },
        { status: duplicate ? 409 : error.status >= 400 && error.status < 600 ? error.status : 502 },
      );
    }
    console.error('[api/wc/reviews POST]', error);
    return NextResponse.json(
      { code: 'review_failed', message: 'Slanje recenzije nije uspelo. Pokušajte ponovo.' },
      { status: 502 },
    );
  }
}
