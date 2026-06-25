import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Navigate, useParams } from 'react-router-dom';
import { ShopLayout } from '@/components/layout/ShopLayout';
import { ListingHero } from '@/components/catalog/ListingHero';
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard';
import { ProductFilters } from '@/components/catalog/ProductFilters';
import { SubcategoryChips } from '@/components/catalog/SubcategoryChips';
import { ListingToolbar } from '@/components/catalog/ListingToolbar';
import { CatalogInfoSections } from '@/components/catalog/CatalogInfoSections';
import { getProductListing } from '@/data/catalogListing';

const ProductsPage = () => {
  const { categorySlug = 'alati', parentSlug = 'elektricni-alat', slug = 'busilice-i-odvijaci' } = useParams();
  const data = getProductListing(categorySlug, parentSlug, slug);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  if (!data) {
    return <Navigate to="/kategorija/alati" replace />;
  }

  return (
    <ShopLayout>
      <ListingHero breadcrumbs={data.breadcrumbs} title={data.title} />

      <SubcategoryChips chips={data.chips} description={data.description} />

      <section className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[15rem_1fr] gap-8 items-start">
          <ProductFilters filters={data.filters} />

          <div>
            <ListingToolbar view={view} onViewChange={setView} />

            <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4' : 'flex flex-col gap-3'}>
              {data.products.map((product) => (
                <CatalogProductCard key={product.id} product={product} view={view} />
              ))}
            </div>

            <nav className="flex items-center justify-center gap-2 mt-10" aria-label="Paginacija">
              <button type="button" className="w-9 h-9 border border-border rounded flex items-center justify-center hover:bg-secondary">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`w-9 h-9 border rounded text-sm font-medium ${
                    page === 1 ? 'bg-primary text-white border-primary' : 'border-border hover:bg-secondary'
                  }`}
                >
                  {page}
                </button>
              ))}
              <span className="px-2 text-muted-foreground">…</span>
              <button type="button" className="w-9 h-9 border border-border rounded text-sm hover:bg-secondary">15</button>
              <button type="button" className="w-9 h-9 border border-border rounded flex items-center justify-center hover:bg-secondary">
                <ChevronRight className="w-4 h-4" />
              </button>
            </nav>
          </div>
        </div>
      </section>

      <CatalogInfoSections
        variant="category"
        whyBuy={data.whyBuy}
        faq={data.faq}
        whyTitle="Zašto kupiti bušilicu kod nas?"
      />
    </ShopLayout>
  );
};

export default ProductsPage;
