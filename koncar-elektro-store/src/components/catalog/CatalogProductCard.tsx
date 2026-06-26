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
        <div className={isList ? 'catalog-product-card-main--list' : undefined}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{product.brand}</p>
          <Link to={productUrl}>
            <h3 className="font-display font-bold text-sm text-foreground leading-tight line-clamp-2 hover:text-primary transition-colors">{product.name}</h3>
          </Link>
          <p className="text-xs text-muted-foreground line-clamp-1">{product.subtitle}</p>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < product.rating ? 'fill-accent text-accent' : 'fill-muted text-muted'}`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">({product.reviews})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {product.specs.map((spec) => (
              <span key={spec} className="catalog-spec-chip">{spec}</span>
            ))}
          </div>
        </div>

        <div className={isList ? 'catalog-product-card-actions--list' : 'catalog-product-card-actions'}>
          <div>
            {onSale && product.oldPrice && (
              <p className="text-xs text-muted-foreground line-through">{formatPrice(product.oldPrice)}</p>
            )}
            <p className="font-display font-bold text-xl text-foreground">{formatPrice(product.price)}</p>
            <p className={`text-xs mt-1 flex items-center gap-1.5 ${product.inStock ? 'text-emerald-600' : 'text-muted-foreground'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${product.inStock ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
              {product.inStock ? 'Na stanju' : 'Nije na stanju'}
            </p>
          </div>
          <AddToCartButton
            productId={product.id}
            variant="yellow"
            disabled={!product.inStock}
            className={isList ? 'min-w-[10.5rem]' : 'w-full'}
          />
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input type="checkbox" className="rounded border-border" />
            Uporedi
          </label>
        </div>
      </div>
    </article>
  );
};
