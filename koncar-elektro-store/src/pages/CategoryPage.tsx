import { ChevronRight } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ShopLayout } from '@/components/layout/ShopLayout';
import { CategoryHero, SubcategoryGrid } from '@/components/catalog/CategoryHero';
import { CatalogInfoSections } from '@/components/catalog/CatalogInfoSections';
import { Carousel } from '@/components/home/Carousel';
import { ProductCard } from '@/components/home/ProductCard';
import { getCategoryPage } from '@/data/categoryPages';
import {
  getProductCategoryUrl,
  getProductListingUrl,
  getTopCategoryUrl,
} from '@/lib/catalogUrls';

type Props = {
  /** When rendered from `/product-category/:program`, bypass URL param. */
  programSlug?: string;
};

const CategoryPage = ({ programSlug }: Props) => {
  const { slug: paramSlug } = useParams();
  const slug = programSlug ?? paramSlug ?? 'alati';
  const data = getCategoryPage(slug);

  if (!data) {
    return <Navigate to={getTopCategoryUrl('alati')} replace />;
  }

  const listingHref =
    slug === 'alati'
      ? getProductListingUrl('alati', 'elektricni-alat', 'busilice-i-odvijaci')
      : getProductCategoryUrl(slug, data.subcategories[0]?.slug ?? '');

  return (
    <ShopLayout>
      <CategoryHero data={data} />

      <SubcategoryGrid
        title={data.slug === 'alati' ? 'Izaberite kategoriju alata' : 'Izaberite podkategoriju'}
        items={data.subcategories}
        categorySlug={data.slug}
      />

      <section className="container py-8 border-t border-border">
        <div className="flex items-center justify-between mb-4 gap-4">
          <h2 className="section-heading text-lg md:text-xl">
            Najprodavaniji proizvodi iz kategorije {data.title.toLowerCase()}
          </h2>
          <Link to={listingHref} className="section-link">
            Pogledajte sve proizvode <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <Carousel>
          {data.bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Carousel>
      </section>

      <CatalogInfoSections
        variant="category"
        whyBuy={data.whyBuy}
        faq={data.faq}
      />
    </ShopLayout>
  );
};

export default CategoryPage;
