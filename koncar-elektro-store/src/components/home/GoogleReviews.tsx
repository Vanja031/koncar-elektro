import { Star, ChevronRight } from 'lucide-react';
import { googleReviewsUrl } from '@/data/homepage';

const GoogleLogo = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

type Props = {
  rating?: number;
  reviewCount?: number;
  variant?: 'dark' | 'light';
};

export const GoogleReviews = ({ rating = 4.9, reviewCount = 287, variant = 'dark' }: Props) => {
  const isLight = variant === 'light';

  return (
    <div className="google-reviews-block flex flex-col items-start">
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className={isLight ? 'google-reviews-rating' : 'google-reviews-rating-dark'}>{rating}</span>
        <span className={`text-lg font-normal ${isLight ? 'text-[#5F6368]' : 'text-white/50'}`}>/ 5</span>
      </div>

      <div className="flex gap-0.5 mb-2" aria-label={`${rating} od 5 zvezdica`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-[#FBBC04] text-[#FBBC04]" />
        ))}
      </div>

      <p className={`text-sm mb-4 ${isLight ? 'text-[#5F6368]' : 'text-white/70'}`}>
        na osnovu {reviewCount}+ recenzija
      </p>

      <a
        href={googleReviewsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
      >
        <GoogleLogo />
        <span className={`google-reviews-brand ${isLight ? '!text-[#202124]' : ''}`}>
          Google <span className={`font-normal ${isLight ? 'text-[#5F6368]' : 'text-white/60'}`}>Reviews</span>
        </span>
      </a>

      <a
        href={googleReviewsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="google-reviews-link mt-3"
      >
        Pogledajte sve recenzije
        <ChevronRight className="w-4 h-4 shrink-0" />
      </a>
    </div>
  );
};
