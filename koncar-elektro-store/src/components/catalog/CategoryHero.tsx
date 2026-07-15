import { ChevronRight } from 'lucide-react';
import { Link } from '@/lib/router-compat';
import type { CategoryPageData } from '@/data/categoryPages';
import { getAlatiSubcategoryUrl, getProductCategoryUrl } from '@/lib/catalogUrls';

type SubcategoryGridProps = {
  title: string;
  items: CategoryPageData['subcategories'];
  categorySlug: string;
};

export const SubcategoryGrid = ({ title, items, categorySlug }: SubcategoryGridProps) => (
  <section className="container py-10">
    <h2 className="section-heading mb-6">{title}</h2>
    <div className="hub-category-grid">
      {items.map((item) => {
        const href =
          item.href ??
          (categorySlug === 'alati'
            ? getAlatiSubcategoryUrl(item.slug)
            : getProductCategoryUrl(categorySlug, item.slug));

        return (
          <Link key={item.slug} to={href} className="hub-category-card group">
            <div className="hub-category-card-media">
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  className="hub-category-card-image"
                  loading="lazy"
                />
              ) : (
                <div className="hub-category-card-image-empty" aria-hidden />
              )}
            </div>
            <div className="hub-category-card-footer">
              <div className="min-w-0 flex-1">
                <span className="hub-category-card-title">{item.name}</span>
                <span className="hub-category-card-count">
                  {item.productCount === 1 ? '1 proizvod' : `${item.productCount} proizvoda`}
                </span>
              </div>
              <span className="hub-category-card-arrow" aria-hidden>
                <ChevronRight />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  </section>
);
