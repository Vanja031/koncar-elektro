import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ShopLayout } from '@/components/layout/ShopLayout';
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import { ProductPurchaseCard } from '@/components/product/ProductPurchaseCard';
import { ProductTabs } from '@/components/product/ProductTabs';
import { ProductTrustStrip } from '@/components/product/ProductTrustStrip';
import { ProductCompatibleProducts } from '@/components/product/ProductCompatibleProducts';
import { ProductFaqSection } from '@/components/product/ProductFaqSection';
import { Carousel } from '@/components/home/Carousel';
import { ProductCard } from '@/components/home/ProductCard';
import {
  getProductBySlug,
  getRelatedProducts,
  getCompatibleProducts,
  productFaq,
} from '@/data/productDetail';
import { DEFAULT_BROWSE_URL, getTopCategoryUrl } from '@/lib/catalogUrls';

const ProductPage = () => {
  const { '*': splat = '' } = useParams();
  const segments = splat.split('/').filter(Boolean);
  const slug = segments[segments.length - 1] ?? '';
  const product = getProductBySlug(slug);
  const [cartBump, setCartBump] = useState(false);

  if (!product) {
    return <Navigate to={DEFAULT_BROWSE_URL} replace />;
  }

  const related = getRelatedProducts(product);
  const compatible = getCompatibleProducts(product);
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
      <Breadcrumbs items={product.breadcrumbs} variant="bar" />

      <section className="container py-6 lg:py-8">
        <div className="product-hero-grid">
          <ProductGallery images={product.gallery} name={product.name} discount={discount} />
          <ProductInfo product={product} onReviewsClick={scrollToReviews} />
          <div className={cartBump ? 'product-purchase-bump' : ''}>
            <ProductPurchaseCard product={product} onAdded={handleAdd} />
          </div>
        </div>
      </section>

      <ProductTrustStrip />

      <section className="container py-8 lg:py-10">
        <ProductTabs product={product} />
      </section>

      <div className="container">
        <ProductCompatibleProducts products={compatible} />
      </div>

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
            <Carousel>
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
