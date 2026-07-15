import { ChevronRight } from 'lucide-react';
import { Link } from '@/lib/router-compat';
import { popularCategories } from '@/data/homepage';
import { getPopularCategoryUrl, getTopCategoryUrl } from '@/lib/catalogUrls';

export const PopularCategoriesSection = () => (
  <section className="container py-6">
    <div className="section-header">
      <h2 className="section-heading">Popularne kategorije</h2>
      <Link to={getTopCategoryUrl('alati')} className="section-link">
        Pogledajte sve kategorije <ChevronRight className="w-4 h-4 shrink-0" />
      </Link>
    </div>
    <div className="hub-category-grid md:grid-cols-5">
      {popularCategories.map((c) => (
        <Link
          key={c.name}
          to={getPopularCategoryUrl(c.name)}
          className="hub-category-card group"
        >
          <div className="hub-category-card-media">
            <img
              src={c.image}
              alt=""
              className="hub-category-card-image"
              loading="lazy"
            />
          </div>
          <div className="hub-category-card-footer">
            <span className="hub-category-card-title">{c.name}</span>
            <span className="hub-category-card-arrow" aria-hidden>
              <ChevronRight />
            </span>
          </div>
        </Link>
      ))}
    </div>
  </section>
);
