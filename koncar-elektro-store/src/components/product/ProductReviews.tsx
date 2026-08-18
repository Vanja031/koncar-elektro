'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Star, ChevronDown, ChevronUp, Send, MessageSquareText } from 'lucide-react';
import { toast } from 'sonner';
import type { ProductDetail, ProductReview } from '@/data/productDetail';
import { useAuth } from '@/context/AuthContext';

const INITIAL_COUNT = 4;
const LOAD_STEP = 4;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Props = {
  product: ProductDetail;
};

const ReviewCard = ({ review }: { review: ProductReview }) => (
  <li className="product-review-card">
    <div className="flex items-center justify-between gap-4 mb-2">
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-display font-bold text-sm flex items-center justify-center shrink-0">
          {review.author.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{review.author}</p>
          {review.verified && (
            <p className="text-[10px] text-emerald-600 font-medium uppercase tracking-wide">Verifikovana kupovina</p>
          )}
        </div>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">{review.date}</span>
    </div>
    <div className="flex items-center gap-0.5 mb-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-accent text-accent' : 'fill-muted text-muted'}`}
        />
      ))}
    </div>
    <p className="text-sm text-foreground/85 leading-relaxed">{review.text}</p>
  </li>
);

export const ProductReviews = ({ product }: Props) => {
  const { customer } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>(product.reviewsList);
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [rating, setRating] = useState(5);
  const [busy, setBusy] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setReviews(product.reviewsList);
    setAlreadyReviewed(false);
  }, [product.id, product.reviewsList]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/wc/reviews/?productId=${product.id}`, { headers: { Accept: 'application/json' } })
      .then((res) => res.json())
      .then((data: { reviews?: ProductReview[]; alreadyReviewed?: boolean }) => {
        if (cancelled) return;
        if (Array.isArray(data.reviews)) setReviews(data.reviews);
        if (data.alreadyReviewed) setAlreadyReviewed(true);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [product.id]);

  const ratingBreakdown = useMemo(() => {
    const counts = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: reviews.filter((r) => r.rating === stars).length,
    }));
    const total = counts.reduce((sum, row) => sum + row.count, 0);

    return counts.map(({ stars, count }) => ({
      stars,
      count,
      pct: total ? Math.round((count / total) * 100) : 0,
    }));
  }, [reviews]);

  const hasReviews = reviews.length > 0;
  const displayRating = hasReviews
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 0;
  const displayCount = hasReviews ? reviews.length : 0;
  const visibleReviews = reviews.slice(0, visibleCount);
  const canLoadMore = visibleCount < reviews.length;
  const canShowLess = visibleCount > INITIAL_COUNT;

  const loadMore = () => {
    setVisibleCount((count) => Math.min(count + LOAD_STEP, reviews.length));
  };

  const showLess = () => {
    setVisibleCount(INITIAL_COUNT);
    requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const reviewer = String(data.get('reviewer') ?? '').trim();
    const reviewerEmail = String(data.get('reviewerEmail') ?? '').trim();
    const review = String(data.get('review') ?? '').trim();

    if (!reviewer || !reviewerEmail || !review) {
      toast.error('Popunite ime, email i recenziju.');
      return;
    }
    if (!EMAIL_PATTERN.test(reviewerEmail)) {
      toast.error('Neispravan email.');
      return;
    }

    setBusy(true);
    try {
      const response = await fetch('/api/wc/reviews/', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          reviewer,
          reviewerEmail,
          review,
          rating,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        toast.error(payload.message || 'Slanje recenzije nije uspelo.');
        if (response.status === 409) setAlreadyReviewed(true);
        return;
      }
      formRef.current?.reset();
      setRating(5);
      setAlreadyReviewed(true);
      toast.success(payload.message || 'Recenzija je poslata i čeka odobrenje.');
    } catch {
      toast.error('Slanje recenzije nije uspelo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div ref={sectionRef} id="product-reviews" className="product-reviews-layout">
      <aside className="product-reviews-summary lg:sticky lg:top-28">
        {hasReviews ? (
          <>
            <p className="font-display font-bold text-5xl text-foreground leading-none">
              {Number.isInteger(displayRating) ? `${displayRating}.0` : displayRating}
            </p>
            <div className="flex items-center gap-0.5 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.round(displayRating) ? 'fill-accent text-accent' : 'fill-muted text-muted'}`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{displayCount} recenzija</p>
            <div className="mt-6 space-y-2">
              {ratingBreakdown.map(({ stars, pct, count }) => (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-muted-foreground">{stars}</span>
                  <Star className="w-3 h-3 fill-accent text-accent shrink-0" />
                  <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-muted-foreground tabular-nums">{count}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-center py-2">
            <span className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
              <MessageSquareText className="w-6 h-6" />
            </span>
            <p className="font-display font-bold text-foreground">Još nema ocena</p>
            <p className="text-sm text-muted-foreground mt-1">0 recenzija</p>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Budite prvi koji će podeliti iskustvo sa ovim proizvodom.
            </p>
          </div>
        )}
      </aside>

      <div className="product-reviews-feed">
        {hasReviews && (
        <div className="product-reviews-feed-header">
          <p className="text-sm font-medium text-foreground">
            Prikazano <strong>{Math.min(visibleCount, reviews.length)}</strong> od{' '}
            <strong>{reviews.length}</strong> recenzija
          </p>
        </div>
        )}

        <ul className="product-reviews-list">
          {visibleReviews.length > 0 ? (
            visibleReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          ) : (
            <li className="product-review-card text-sm text-muted-foreground">
              Još nema recenzija za ovaj proizvod. Budite prvi koji će ostaviti ocenu.
            </li>
          )}
        </ul>

        {(canLoadMore || canShowLess) && (
          <div className="product-reviews-actions">
            <div
              className={`product-reviews-actions-buttons ${
                canLoadMore && canShowLess ? '' : 'product-reviews-actions-buttons--solo'
              }`}
            >
              {canLoadMore && (
                <button type="button" onClick={loadMore} className="product-reviews-action-btn">
                  <ChevronDown className="w-4 h-4" />
                  Prikaži još
                </button>
              )}
              {canShowLess && (
                <button type="button" onClick={showLess} className="product-reviews-action-btn product-reviews-action-btn--muted">
                  <ChevronUp className="w-4 h-4" />
                  Prikaži manje
                </button>
              )}
            </div>
          </div>
        )}

        {alreadyReviewed ? (
          <p className="product-review-form text-sm text-muted-foreground">
            Već ste ostavili recenziju za ovaj proizvod. Hvala vam.
          </p>
        ) : (
        <form
          key={customer?.id ?? 'guest'}
          ref={formRef}
          className="product-review-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <p className="font-display font-bold text-sm text-primary uppercase tracking-wide">
            Ostavite recenziju
          </p>
          <div className="flex items-center gap-1" role="radiogroup" aria-label="Ocena">
            {Array.from({ length: 5 }).map((_, i) => {
              const value = i + 1;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="p-0.5"
                  aria-label={`${value} od 5`}
                >
                  <Star
                    className={`w-5 h-5 ${value <= rating ? 'fill-accent text-accent' : 'fill-muted text-muted'}`}
                  />
                </button>
              );
            })}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              name="reviewer"
              defaultValue={[customer?.firstName, customer?.lastName].filter(Boolean).join(' ')}
              placeholder="Ime"
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            />
            <input
              name="reviewerEmail"
              type="email"
              defaultValue={customer?.email ?? ''}
              readOnly={Boolean(customer?.email)}
              placeholder="E-mail"
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 disabled:bg-secondary/40"
            />
          </div>
          <textarea
            name="review"
            rows={4}
            placeholder="Vaše iskustvo sa proizvodom..."
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none resize-y min-h-[6rem] focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          />
          <button type="submit" disabled={busy} className="btn-yellow w-fit inline-flex items-center gap-2 px-5 py-2.5 text-sm">
            <Send className="w-4 h-4" />
            {busy ? 'Slanje...' : 'Pošalji recenziju'}
          </button>
        </form>
        )}
      </div>
    </div>
  );
};
