import { Star, Heart } from 'lucide-react';
import { Link } from '@/lib/router-compat';
import { formatPrice } from '@/data/homepage';
import { getCatalogProductUrl } from '@/lib/productUrls';
import { getDiscountPercent } from '@/data/koncarProducts';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { ManufacturerRow } from '@/components/brand/BrandMark';
import type { CatalogProductCardProduct } from '@/data/catalogListing';

type Props = {
  product: CatalogProductCardProduct;
  view?: 'grid' | 'list';
  /** Bestseller sekcije (npr. /najprodavanije): najprodavanije ima prioritet nad popustom. */
  bestsellerBadge?: boolean;
};

export const CatalogProductCard = ({ product, view = 'grid', bestsellerBadge = false }: Props) => {
  const isList = view === 'list';
  const productUrl = getCatalogProductUrl(product);
  const discount = getDiscountPercent(product);
  const onSale = Boolean(product.oldPrice) && discount > 0;

  // Jedan bedž. Popust ima prioritet svuda osim u bestseller sekcijama.
  const badge: 'sale' | 'bestseller' | null = bestsellerBadge
    ? 'bestseller'
    : onSale
      ? 'sale'
      : product.bestseller
        ? 'bestseller'
        : null;

  return (
    <article
      className={`catalog-product-card group ${isList ? 'catalog-product-card--list' : ''} ${product.bestseller ? 'catalog-product-card--bestseller' : ''}`}
    >
      {badge && (
        <div className="catalog-product-badges">
          {badge === 'sale' && <span className="catalog-badge-sale">-{discount}%</span>}
          {badge === 'bestseller' && (
            <span className="catalog-badge-bestseller">Najprodavanije</span>
          )}
        </div>
      )}
      <button type="button" className="catalog-wishlist" aria-label="Dodaj u listu želja">
        <Heart className="w-4 h-4" />
      </button>

      <Link to={productUrl} className={isList ? 'catalog-product-card-media--list' : 'catalog-product-card-media'}>
        <img src={product.image} alt={product.name} loading="lazy" />
      </Link>

      <div className={isList ? 'catalog-product-card-body--list' : 'catalog-product-card-body'}>
        <div className={isList ? 'catalog-product-card-main--list' : 'catalog-product-card-main'}>
          <ManufacturerRow brand={product.brand} className="catalog-product-card-brand" size="xs" />
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
            {(product.specs ?? []).map((spec) => (
              <span key={spec} className="catalog-spec-chip">{spec}</span>
            ))}
          </div>
        </div>

        <div className={isList ? 'catalog-product-card-actions--list' : 'catalog-product-card-actions'}>
          <div className="catalog-product-card-actions-buy">
            <div className="catalog-product-card-pricing">
              <p className={`catalog-product-card-stock ${product.inStock ? 'catalog-product-card-stock--in' : ''}`}>
                <span className={`catalog-product-card-stock-dot ${product.inStock ? 'catalog-product-card-stock-dot--in' : ''}`} />
                {product.inStock ? 'Na stanju' : 'Nije na stanju'}
              </p>
              <div className="catalog-product-card-price-group">
                {onSale && product.oldPrice && (
                  <p className="catalog-product-card-old-price">{formatPrice(product.oldPrice)}</p>
                )}
                <p className="catalog-product-card-price">{formatPrice(product.price)}</p>
              </div>
            </div>
            <AddToCartButton
              product={product}
              variant="yellow"
              className="catalog-product-card-cart-btn"
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
