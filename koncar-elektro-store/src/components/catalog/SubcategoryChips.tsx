import { ChevronRight, Flame, Loader2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { HighlightChip } from '@/lib/listingHighlightChips';

type Props = {
  chips: HighlightChip[];
  description: string;
  /** Skriva celu sekciju ispod `lg` (npr. 4 highlight kartice na listingu). */
  hideOnMobile?: boolean;
  /** Prikaži skeleton dok se prave slike proizvoda učitavaju (bez mock slike). */
  imagesLoading?: boolean;
};

export const SubcategoryChips = ({
  chips,
  description,
  hideOnMobile = false,
  imagesLoading = false,
}: Props) => (
  <section className={`border-b border-border bg-white ${hideOnMobile ? 'hidden lg:block' : ''}`}>
    <div className="container py-6">
      <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-8">
        {description ? (
          <div className="lg:w-[min(18rem,32%)] shrink-0">
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
        ) : null}

        <div className="flex-1 min-w-0 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {chips.map((chip) => {
            const className = `catalog-chip--listing ${chip.featured ? 'catalog-chip--featured' : ''}`;
            const media = chip.isSale ? (
              <Flame className="w-8 h-8 text-accent fill-accent shrink-0" />
            ) : chip.featured ? (
              <Star className="w-5 h-5 text-accent fill-accent shrink-0" />
            ) : chip.image ? (
              <div className="catalog-chip-image-wrap">
                <img src={chip.image} alt="" className="max-h-full max-w-full object-contain" />
              </div>
            ) : imagesLoading ? (
              <div
                className="catalog-chip-image-wrap rounded-md bg-muted/50 flex items-center justify-center"
                aria-hidden
              >
                <Loader2 className="w-4 h-4 text-muted-foreground/50 animate-spin" />
              </div>
            ) : (
              <div className="catalog-chip-image-wrap rounded-md bg-muted/25" aria-hidden />
            );

            const content = (
              <>
                {media}
                <div className="min-w-0 flex-1">
                  <p className="font-display font-bold text-xs lg:text-sm text-primary uppercase leading-snug line-clamp-2">
                    {chip.label}
                  </p>
                  {chip.count != null && (
                    <p className="text-[11px] text-muted-foreground mt-1">{chip.count} proizvoda</p>
                  )}
                </div>
                <ChevronRight className="hidden lg:block w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </>
            );

            return chip.href ? (
              <Link key={chip.slug} to={chip.href} className={className}>
                {content}
              </Link>
            ) : (
              <div key={chip.slug} className={className}>
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </section>
);
