import { Star } from 'lucide-react';
import { Link } from '@/lib/router-compat';
import { formatPrice, type Product } from '@/data/homepage';
import { getCatalogProductUrl } from '@/lib/productUrls';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { ManufacturerRow } from '@/components/brand/BrandMark';
import { ProductImage } from '@/components/product/ProductImage';

type Props = {
  product: Product;
  rank?: number;
  bestseller?: boolean;
  /** Manji badge za home carousel kartice */
  bestsellerCompact?: boolean;
};

export const ProductCard = ({ product, rank, bestseller, bestsellerCompact }: Props) => {
  const discount = product.oldPrice
    ? Math.round(100 - (product.price / product.oldPrice) * 100)
    : 0;
  const productUrl = getCatalogProductUrl(product);

  return (
    <div className={`product-card-home h-full${bestseller ? ' product-card-home--bestseller' : ''}`}>
      {(bestseller || discount > 0 || rank != null) && (
        <div className="product-card-home-badges">
          {discount > 0 && <span className="badge-discount">-{discount}%</span>}
          {bestseller && (
            <span className={bestsellerCompact ? 'badge-bestseller badge-bestseller--compact' : 'badge-bestseller'}>
              Najprodavanije
            </span>
          )}
          {!bestseller && discount <= 0 && rank != null && <span className="badge-rank">{rank}</span>}
        </div>
      )}
      <Link to={productUrl} className="product-card-media block">
        <ProductImage src={product.image} alt={product.name} />
      </Link>
      <div className="p-3 flex flex-col gap-1.5 flex-1 border-t border-border">
        <ManufacturerRow brand={product.brand} size="xs" />
        <Link to={productUrl}>
          <p className="text-sm font-semibold text-foreground leading-tight line-clamp-1 hover:text-primary transition-colors">{product.name}</p>
        </Link>
        <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${i < product.rating ? 'fill-accent text-accent' : 'fill-muted text-muted'}`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({product.reviews})</span>
        </div>
        <div className="mt-auto pt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {product.oldPrice && (
              <span className="text-xs text-muted-foreground line-through block">{formatPrice(product.oldPrice)}</span>
            )}
            <span className="font-display font-bold text-lg text-foreground">{formatPrice(product.price)}</span>
          </div>
          <AddToCartButton product={product} variant="yellow" className="w-full sm:hidden product-card-home-cart-btn" />
          <AddToCartButton product={product} variant="icon" className="hidden sm:inline-flex shrink-0" />
        </div>
      </div>
    </div>
  );
};
