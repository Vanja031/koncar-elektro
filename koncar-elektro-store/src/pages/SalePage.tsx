import { useMemo, useState } from 'react';
import { ShopLayout } from '@/components/layout/ShopLayout';
import { ListingHero } from '@/components/catalog/ListingHero';
import { SaleIntroBanner } from '@/components/catalog/SaleIntroBanner';
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard';
import { ListingToolbar } from '@/components/catalog/ListingToolbar';
import { CatalogInfoSections } from '@/components/catalog/CatalogInfoSections';
import { saleListing } from '@/data/catalogListing';
import { getDiscountPercent } from '@/data/koncarProducts';

const SalePage = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const { breadcrumbs, title, products, whyBuy, faq } = saleListing;

  const maxDiscount = useMemo(
    () => products.reduce((max, p) => Math.max(max, getDiscountPercent(p)), 0),
    [products],
  );

  return (
    <ShopLayout>
      <ListingHero breadcrumbs={breadcrumbs} title={title} />
      <SaleIntroBanner maxDiscount={maxDiscount} />

      <section className="container py-8">
        <ListingToolbar view={view} onViewChange={setView} productCount={products.length} />

        <div
          className={
            view === 'grid'
              ? 'grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 mt-4'
              : 'flex flex-col gap-3 mt-4'
          }
        >
          {products.map((product) => (
            <CatalogProductCard key={product.id} product={product} view={view} showSaleBadge />
          ))}
        </div>
      </section>

      <CatalogInfoSections
        variant="category"
        whyBuy={whyBuy}
        faq={faq}
        whyTitle="Zašto kupovati na akciji kod nas?"
      />
    </ShopLayout>
  );
};

export default SalePage;
