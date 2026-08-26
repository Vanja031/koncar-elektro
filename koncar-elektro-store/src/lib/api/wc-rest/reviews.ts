import type { ProductReview } from '@/data/productDetail';
import { wcV3Fetch } from '@/lib/api/wc-rest/client';
import { REVALIDATE_PRODUCT } from '@/lib/isr/revalidate';

export type WcProductReview = {
  id: number;
  date_created: string;
  reviewer: string;
  reviewer_email: string;
  review: string;
  rating: number;
  verified: boolean;
  status: string;
  product_id: number;
};

export type CreateProductReviewInput = {
  productId: number;
  reviewer: string;
  reviewerEmail: string;
  review: string;
  rating: number;
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatSrDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('sr-RS');
}

export function mapWcReview(review: WcProductReview): ProductReview {
  return {
    id: review.id,
    author: review.reviewer || 'Kupac',
    rating: Number(review.rating) || 0,
    date: formatSrDate(review.date_created),
    text: stripHtml(review.review),
    verified: Boolean(review.verified),
  };
}

export async function getProductReviews(productId: number): Promise<ProductReview[]> {
  // Must match product page ISR (`export const revalidate`) — never use no-store here.
  const reviews = await listProductReviews(productId, 'approved', {
    next: { revalidate: REVALIDATE_PRODUCT },
  });
  return reviews.map(mapWcReview);
}

async function listProductReviews(
  productId: number,
  status: 'approved' | 'hold' | 'all',
  init: RequestInit = {},
): Promise<WcProductReview[]> {
  const reviews = await wcV3Fetch<WcProductReview[]>(
    `/products/reviews?product=${productId}&status=${status}&per_page=100`,
    { method: 'GET', ...init },
  );
  return Array.isArray(reviews) ? reviews : [];
}

function emailsMatch(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

/** Approved + pending reviews for this product by this email (one review per customer). */
export async function hasCustomerReviewedProduct(
  productId: number,
  email: string,
): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;

  let reviews: WcProductReview[] = [];
  try {
    reviews = await listProductReviews(productId, 'all');
  } catch {
    const [approved, pending] = await Promise.all([
      listProductReviews(productId, 'approved').catch(() => [] as WcProductReview[]),
      listProductReviews(productId, 'hold').catch(() => [] as WcProductReview[]),
    ]);
    reviews = [...approved, ...pending];
  }

  return reviews.some((review) => emailsMatch(review.reviewer_email ?? '', normalized));
}

export async function createPendingProductReview(
  input: CreateProductReviewInput,
): Promise<WcProductReview> {
  return wcV3Fetch<WcProductReview>('/products/reviews', {
    method: 'POST',
    body: JSON.stringify({
      product_id: input.productId,
      reviewer: input.reviewer,
      reviewer_email: input.reviewerEmail,
      review: input.review,
      rating: input.rating,
      status: 'hold',
    }),
  });
}
