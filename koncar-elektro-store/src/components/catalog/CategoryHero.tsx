import { ChevronRight } from 'lucide-react';
import { Link } from '@/lib/router-compat';
import { Breadcrumbs } from './Breadcrumbs';
import type { CategoryPageData } from '@/data/categoryPages';
import { getAlatiSubcategoryUrl, getProductCategoryUrl } from '@/lib/catalogUrls';

type Props = {
  data: CategoryPageData;
};

export const CategoryHero = ({ data }: Props) => (
  <section className="relative overflow-hidden min-h-[10rem] md:min-h-[11rem] flex items-end">
    <img
      src={data.heroImage}
      alt=""
      className="absolute inset-0 w-full h-full object-cover object-right"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/20" />
    <div className="container relative z-10 py-6 md:py-7">
      <Breadcrumbs items={data.breadcrumbs} variant="hero" />
      <h1 className="font-display font-bold text-3xl md:text-4xl text-white uppercase tracking-wide mt-3 mb-2">
        {data.title}
      </h1>
      <p className="text-accent font-display font-bold text-base md:text-lg mb-3">{data.subtitle}</p>
      <p className="text-sm text-white/80 max-w-2xl leading-relaxed">{data.description}</p>
    </div>
  </section>
);

type SubcategoryGridProps = {
  title: string;
  items: CategoryPageData['subcategories'];
  categorySlug: string;
};

export const SubcategoryGrid = ({ title, items, categorySlug }: SubcategoryGridProps) => (
  <section className="container py-10">
    <h2 className="section-heading mb-6">{title}</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => {
        const href =
          item.href ??
          (categorySlug === 'alati'
            ? getAlatiSubcategoryUrl(item.slug)
            : getProductCategoryUrl(categorySlug, item.slug));

        return (
        <Link
          key={item.slug}
          to={href}
          className="group flex items-stretch bg-white border border-border rounded-lg overflow-hidden hover:border-primary/25 hover:shadow-card transition-all min-h-[6.75rem]"
        >
          <div className="catalog-subcategory-image-wrap">
            {item.image ? (
              <img
                src={item.image}
                alt=""
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                loading="lazy"
              />
            ) : (
              <div className="catalog-subcategory-image-empty" aria-hidden />
            )}
          </div>
          <div className="flex flex-1 flex-col justify-center py-3.5 px-4 min-w-0 text-left">
            <h3 className="font-display font-bold text-primary text-sm uppercase leading-snug line-clamp-2 mb-2">
              {item.name}
            </h3>
            <span className="text-xs text-muted-foreground group-hover:text-primary inline-flex items-center gap-1 transition-colors">
              Pogledajte ponudu <ChevronRight className="w-3.5 h-3.5 text-accent shrink-0" />
            </span>
          </div>
        </Link>
        );
      })}
    </div>
  </section>
);
