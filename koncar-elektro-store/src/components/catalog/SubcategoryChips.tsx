import { ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ListingChip } from '@/data/catalogListing';

type Chip = ListingChip & { href?: string };

type Props = {
  chips: Chip[];
  description: string;
};

export const SubcategoryChips = ({ chips, description }: Props) => (
  <section className="border-b border-border bg-white">
    <div className="container py-6">
      <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-8">
        <div className="lg:w-[min(18rem,32%)] shrink-0">
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>

        <div className="flex-1 min-w-0 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {chips.map((chip) => {
            const className = `catalog-chip--listing ${chip.featured ? 'catalog-chip--featured' : ''}`;
            const content = (
              <>
                {chip.featured ? (
                  <Star className="w-5 h-5 text-accent fill-accent shrink-0" />
                ) : chip.image ? (
                  <img src={chip.image} alt="" className="w-10 h-10 object-contain shrink-0" />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="font-display font-bold text-xs lg:text-sm text-primary uppercase leading-snug line-clamp-2">
                    {chip.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">{chip.count} proizvoda</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
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
