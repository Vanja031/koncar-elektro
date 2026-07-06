import { Star, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/data/homepage';
import { getProductUrl } from '@/data/productDetail';
import { getDiscountPercent } from '@/data/koncarProducts';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import type { CatalogProduct } from '@/data/catalogListing';

type Props = {
  product: CatalogProduct;
  view?: 'grid' | 'list';
  showSaleBadge?: boolean;
};

export const CatalogProductCard = ({ product, view = 'grid', showSaleBadge = false }: Props) => {
  const isList = view === 'list';
  const productUrl = getProductUrl(product.id);
  const discount = getDiscountPercent(product);
  const onSale = showSaleBadge && product.oldPrice && discount > 0;

  return (
    <article
      className={`catalog-product-card group ${isList ? 'catalog-product-card--list' : ''} ${product.bestseller ? 'catalog-product-card--bestseller' : ''}`}
    >
      {(product.bestseller || onSale) && (
        <div className="catalog-product-badges">
          {onSale && <span className="catalog-badge-sale">-{discount}%</span>}
          {product.bestseller && <span className="catalog-badge-bestseller">Najprodavanije</span>}
        </div>
      )}
      <button type="button" className="catalog-wishlist" aria-label="Dodaj u listu želja">
        <Heart className="w-4 h-4" />
      </button>

      <Link to={productUrl} className={isList ? 'catalog-product-card-media--list' : 'catalog-product-card-media'}>
        <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" loading="lazy" />
      </Link>

      <div className={isList ? 'catalog-product-card-body--list' : 'catalog-product-card-body'}>
        <div className={isList ? 'catalog-product-card-main--list' : 'catalog-product-card-main'}>
          <p className="catalog-product-card-brand">{product.brand}</p>
          <Link to={productUrl}>
            <h3 className="catalog-product-card-title">{product.name}</h3>
          </Link>
          <p className="catalog-product-card-subtitle">{product.subtitle}</p>
          <div className="catalog-product-card-rating">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < product.rating ? 'fill-accent text-accent' : 'fill-muted text-muted'}`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">({product.reviews})</span>
          </div>
          <div className="catalog-product-card-specs">
            {product.specs.map((spec) => (
              <span key={spec} className="catalog-spec-chip">{spec}</span>
            ))}
          </div>
        </div>

        <div className={isList ? 'catalog-product-card-actions--list' : 'catalog-product-card-actions'}>
          <div className="catalog-product-card-actions-buy">
            <div className="catalog-product-card-pricing">
              {onSale && product.oldPrice && (
                <p className="catalog-product-card-old-price">{formatPrice(product.oldPrice)}</p>
              )}
              <p className="catalog-product-card-price">{formatPrice(product.price)}</p>
              <p className={`catalog-product-card-stock ${product.inStock ? 'catalog-product-card-stock--in' : ''}`}>
                <span className={`catalog-product-card-stock-dot ${product.inStock ? 'catalog-product-card-stock-dot--in' : ''}`} />
                {product.inStock ? 'Na stanju' : 'Nije na stanju'}
              </p>
            </div>
            <AddToCartButton
              productId={product.id}
              variant="yellow"
              disabled={!product.inStock}
              className={isList ? 'min-w-[10.5rem] catalog-product-card-cart-btn' : 'catalog-product-card-cart-btn'}
            />
          </div>
          <label className="catalog-product-card-compare">
            <input type="checkbox" className="rounded border-border" />
            Uporedi
          </label>
        </div>
      </div>
    </article>
  );
};
