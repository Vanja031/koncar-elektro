import { ChevronRight as ArrowRight } from 'lucide-react';
import { Link } from '@/lib/router-compat';
import { popularCategories } from '@/data/homepage';
import { getPopularCategoryUrl, getTopCategoryUrl } from '@/lib/catalogUrls';

export const PopularCategoriesSection = () => (
  <section className="container py-6">
    <div className="section-header">
      <h2 className="section-heading">Popularne kategorije</h2>
      <Link to={getTopCategoryUrl('alati')} className="section-link">
        Pogledajte sve kategorije <ArrowRight className="w-4 h-4 shrink-0" />
      </Link>
    </div>
    <div className="popular-categories-grid">
      {popularCategories.map((c) => (
        <Link
          key={c.name}
          to={getPopularCategoryUrl(c.name)}
          className="popular-category-card group"
        >
          <div className="popular-category-card-media">
            <img
              src={c.image}
              alt=""
              className="popular-category-card-image"
              loading="lazy"
            />
          </div>
          <div className="popular-category-card-footer">
            <span className="popular-category-card-title">{c.name}</span>
            <span className="popular-category-card-arrow" aria-hidden>
              <ArrowRight />
            </span>
          </div>
        </Link>
      ))}
    </div>
  </section>
);
