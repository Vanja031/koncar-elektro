'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link, useParams } from '@/lib/router-compat';
import { ShopLayout } from '@/components/layout/ShopLayout';
import { CatalogStateMessage } from '@/components/catalog/CatalogStateMessage';
import { ProductBackBar } from '@/components/product/ProductBackBar';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductInfoHeader, ProductInfoDetails } from '@/components/product/ProductInfo';
import { ProductPurchaseCard } from '@/components/product/ProductPurchaseCard';
import { ProductTabs } from '@/components/product/ProductTabs';
import { ProductTrustStrip } from '@/components/product/ProductTrustStrip';
import { ProductFaqSection } from '@/components/product/ProductFaqSection';
import { Carousel } from '@/components/home/Carousel';
import { ProductCard } from '@/components/home/ProductCard';
import { useLiveApi } from '@/lib/api/config';
import { productFaq } from '@/data/productDetail';
import type { ProductDetail } from '@/data/productDetail';
import type { CatalogProduct } from '@/data/catalogListing';
import { useLiveProduct, useLiveRelatedProducts } from '@/hooks/api/useLiveCatalog';
import { getTopCategoryUrl } from '@/lib/catalogUrls';

type Props = {
  initialProduct?: ProductDetail | null;
  initialRelated?: CatalogProduct[];
};

const ProductPage = ({ initialProduct, initialRelated }: Props) => {
  const { '*': splat = '' } = useParams();
  const segments = splat.split('/').filter(Boolean);
  const slug = segments[segments.length - 1] ?? '';
  const [cartBump, setCartBump] = useState(false);
  const hasServerProduct = initialProduct !== undefined;

  const live = useLiveProduct(useLiveApi ? slug : undefined, initialProduct);
  const product = live.data ?? undefined;

  const categorySlug = product?.categorySlug;
  const liveRelated = useLiveRelatedProducts(
    useLiveApi ? categorySlug : undefined,
    product?.id,
    initialRelated,
  );

  if (!useLiveApi) {
    return (
      <ShopLayout>
        <CatalogStateMessage variant="unavailable" className="min-h-[50vh]" />
      </ShopLayout>
    );
  }

  if (live.isLoading && !hasServerProduct) {
    return (
      <ShopLayout>
        <CatalogStateMessage variant="loading" className="min-h-[50vh]" />
      </ShopLayout>
    );
  }

  if (live.isError) {
    return (
      <ShopLayout>
        <CatalogStateMessage
          variant="error"
          onRetry={() => live.refetch()}
          className="min-h-[50vh]"
        />
      </ShopLayout>
    );
  }

  if (!product) {
    return (
      <ShopLayout>
        <CatalogStateMessage variant="not-found" className="min-h-[50vh]" />
      </ShopLayout>
    );
  }

  const related = liveRelated.data ?? [];

  const discount = product.oldPrice
    ? Math.round(100 - (product.price / product.oldPrice) * 100)
    : 0;

  const handleAdd = () => {
    setCartBump(true);
    setTimeout(() => setCartBump(false), 600);
  };

  const scrollToReviews = () => {
    document.getElementById('product-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('product-tab-reviews')?.click();
  };

  return (
    <ShopLayout>
      <ProductBackBar breadcrumbs={product.breadcrumbs} />
      <section className="container py-6 lg:py-8">
        {/*
         * Mobilni i desktop redosled se razlikuju na način koji CSS grid ne može čisto da
         * postigne jednom šemom (mobilni ubacuje karticu za kupovinu IZMEĐU brenda i detalja,
         * dok desktop želi brend+detalje kao jednu celinu pored slike/kartice) — bez ovoga bi
         * red sa brendom na desktopu bio razvučen da odgovara visini slike, ostavljajući veliki
         * razmak do detalja ispod. Zato renderujemo dva odvojena rasporeda i sakrivamo jedan.
         */}
        <div className="product-hero-grid lg:hidden">
          <ProductGallery images={product.gallery} name={product.name} discount={discount} />
          <ProductInfoHeader product={product} />
          <div className={cartBump ? 'product-purchase-bump' : ''}>
            <ProductPurchaseCard product={product} onAdded={handleAdd} />
          </div>
          <ProductInfoDetails product={product} onReviewsClick={scrollToReviews} />
        </div>
        <div className="hidden lg:grid product-hero-grid-desktop">
          <ProductGallery images={product.gallery} name={product.name} discount={discount} />
          <div className="product-hero-item-info">
            <ProductInfoHeader product={product} />
            <ProductInfoDetails product={product} onReviewsClick={scrollToReviews} />
          </div>
          <div className={cartBump ? 'product-purchase-bump' : ''}>
            <ProductPurchaseCard product={product} onAdded={handleAdd} />
          </div>
        </div>
      </section>

      <ProductTrustStrip />

      <section className="container py-8 lg:py-10">
        <ProductTabs product={product} />
      </section>

      <ProductFaqSection items={productFaq} />

      {related.length > 0 && (
        <section className="product-section product-section--muted border-t border-border">
          <div className="container">
            <div className="flex items-center justify-between mb-6 gap-4">
              <h2 className="product-section-title">Slični proizvodi</h2>
              <Link
                to={product.breadcrumbs.find((b) => b.href && b.label !== 'Početna')?.href ?? getTopCategoryUrl('alati')}
                className="section-link"
              >
                Pogledajte sve <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <Carousel edgeArrowsOnMobile>
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </Carousel>
          </div>
        </section>
      )}
    </ShopLayout>
  );
};

export default ProductPage;
