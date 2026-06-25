import { ChevronRight } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ShopLayout } from '@/components/layout/ShopLayout';
import { CategoryHero, SubcategoryGrid } from '@/components/catalog/CategoryHero';
import { CatalogInfoSections } from '@/components/catalog/CatalogInfoSections';
import { Carousel } from '@/components/home/Carousel';
import { ProductCard } from '@/components/home/ProductCard';
import { getCategoryPage } from '@/data/categoryPages';

const CategoryPage = () => {
  const { slug = 'alati' } = useParams();
  const data = getCategoryPage(slug);

  if (!data) {
    return <Navigate to="/kategorija/alati" replace />;
  }

  return (
    <ShopLayout>
      <CategoryHero data={data} />

      <SubcategoryGrid
        title="Izaberite kategoriju alata"
        items={data.subcategories}
        categorySlug={data.slug}
      />

      <section className="container py-8 border-t border-border">
        <div className="flex items-center justify-between mb-4 gap-4">
          <h2 className="section-heading text-lg md:text-xl">
            Najprodavaniji proizvodi iz kategorije {data.title.toLowerCase()}
          </h2>
          <Link to={`/kategorija/${data.slug}/elektricni-alat/busilice-i-odvijaci`} className="section-link">
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
