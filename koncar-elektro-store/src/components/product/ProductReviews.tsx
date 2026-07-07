import { useMemo, useRef, useState } from 'react';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import type { ProductDetail, ProductReview } from '@/data/productDetail';

const INITIAL_COUNT = 4;
const LOAD_STEP = 4;

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
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const sectionRef = useRef<HTMLDivElement>(null);

  const ratingBreakdown = useMemo(() => {
    const counts = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: product.reviewsList.filter((r) => r.rating === stars).length,
    }));
    const total = counts.reduce((sum, row) => sum + row.count, 0);

    return counts.map(({ stars, count }) => ({
      stars,
      count,
      pct: total ? Math.round((count / total) * 100) : 0,
    }));
  }, [product.reviewsList]);

  const visibleReviews = product.reviewsList.slice(0, visibleCount);
  const canLoadMore = visibleCount < product.reviewsList.length;
  const canShowLess = visibleCount > INITIAL_COUNT;
  const remainingTotal = Math.max(0, product.reviews - product.reviewsList.length);

  const loadMore = () => {
    setVisibleCount((count) => Math.min(count + LOAD_STEP, product.reviewsList.length));
  };

  const showLess = () => {
    setVisibleCount(INITIAL_COUNT);
    requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div ref={sectionRef} id="product-reviews" className="product-reviews-layout">
      <aside className="product-reviews-summary lg:sticky lg:top-28">
        <p className="font-display font-bold text-5xl text-foreground leading-none">{product.rating}.0</p>
        <div className="flex items-center gap-0.5 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < product.rating ? 'fill-accent text-accent' : 'fill-muted text-muted'}`}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-1">{product.reviews} recenzija</p>

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
      </aside>

      <div className="product-reviews-feed">
        <div className="product-reviews-feed-header">
          <p className="text-sm font-medium text-foreground">
            Prikazano <strong>{visibleCount}</strong> od <strong>{product.reviews}</strong> recenzija
          </p>
        </div>

        <ul className="product-reviews-list">
          {visibleReviews.length > 0 ? (
            visibleReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          ) : (
            <li className="product-review-card text-sm text-muted-foreground">
              {product.reviews > 0
                ? 'Prosečna ocena je zasnovana na ocenama kupaca. Tekstualne recenzije trenutno nisu dostupne u prodavnici.'
                : 'Još nema recenzija za ovaj proizvod. Budite prvi koji će ostaviti ocenu nakon kupovine.'}
            </li>
          )}
        </ul>

        {(canLoadMore || canShowLess || remainingTotal > 0) && (
          <div className="product-reviews-actions">
            {(canLoadMore || canShowLess) && (
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
            )}
            {!canLoadMore && remainingTotal > 0 && (
              <p className="product-reviews-note">
                Prikazane su sve dostupne recenzije na sajtu. Ukupno {product.reviews} ocena kupaca.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
