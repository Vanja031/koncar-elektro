import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { ShopLayout } from '@/components/layout/ShopLayout';
import { ListingHero } from '@/components/catalog/ListingHero';
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard';
import { ProductFilters } from '@/components/catalog/ProductFilters';
import { SubcategoryChips } from '@/components/catalog/SubcategoryChips';
import { ListingToolbar } from '@/components/catalog/ListingToolbar';
import { CatalogInfoSections } from '@/components/catalog/CatalogInfoSections';
import { ParentHubBestSellers } from '@/components/catalog/ParentHubBestSellers';
import { getParentHubBestSellers, getParentListing, getProductListing, getProgramListing } from '@/data/catalogListing';
import { getTopCategoryUrl, isLeafProgramListingRoute, isParentListingRoute } from '@/lib/catalogUrls';

type Props = {
  categorySlug?: string;
  parentSlug?: string;
  listingSlug?: string;
};

const ProductsPage = ({
  categorySlug = 'alati',
  parentSlug = 'elektricni-alat',
  listingSlug,
}: Props) => {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const parentData = isParentListingRoute(categorySlug, parentSlug, listingSlug)
    ? getParentListing(categorySlug, parentSlug)
    : undefined;

  const listingData = listingSlug
    ? getProductListing(categorySlug, parentSlug, listingSlug)
    : isLeafProgramListingRoute(categorySlug, parentSlug, listingSlug)
      ? getProgramListing(categorySlug, parentSlug)
      : undefined;

  if (parentData) {
    const bestSellers = getParentHubBestSellers(parentSlug);
    const firstChipHref = parentData.chips[0]?.href;

    return (
      <ShopLayout>
        <ListingHero breadcrumbs={parentData.breadcrumbs} title={parentData.title} />
        <SubcategoryChips chips={parentData.chips} description={parentData.description} />
        <ParentHubBestSellers
          title={`Najprodavaniji u kategoriji ${parentData.title.toLowerCase()}`}
          products={bestSellers}
          viewAllHref={firstChipHref}
        />
      </ShopLayout>
    );
  }

  if (!listingData) {
    return <Navigate to={getTopCategoryUrl('alati')} replace />;
  }

  return (
    <ShopLayout>
      <ListingHero breadcrumbs={listingData.breadcrumbs} title={listingData.title} />

      <SubcategoryChips chips={listingData.chips} description={listingData.description} />

      <section className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[15rem_1fr] gap-8 items-start">
          <ProductFilters filters={listingData.filters} />

          <div>
            <ListingToolbar view={view} onViewChange={setView} />

            <div className={view === 'grid' ? 'grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4' : 'flex flex-col gap-3'}>
              {listingData.products.map((product) => (
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
        whyBuy={listingData.whyBuy}
        faq={listingData.faq}
        whyTitle="Zašto kupiti bušilicu kod nas?"
      />
    </ShopLayout>
  );
};

export default ProductsPage;
