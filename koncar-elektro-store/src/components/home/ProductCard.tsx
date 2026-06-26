import { Star, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice, type Product } from '@/data/homepage';
import { getProductUrl } from '@/data/productDetail';
import { AddToCartButton } from '@/components/cart/AddToCartButton';

type Props = {
  product: Product;
  rank?: number;
};

export const ProductCard = ({ product, rank }: Props) => {
  const discount = product.oldPrice
    ? Math.round(100 - (product.price / product.oldPrice) * 100)
    : 0;
  const productUrl = getProductUrl(product.id);

  return (
    <div className="product-card-home h-full">
      {rank != null ? (
        <span className="badge-rank">{rank}</span>
      ) : product.oldPrice ? (
        <span className="badge-discount">-{discount}%</span>
      ) : null}
      <Link to={productUrl} className="aspect-square p-4 flex items-center justify-center bg-white block">
        <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" loading="lazy" />
      </Link>
      <div className="p-3 flex flex-col gap-1.5 flex-1 border-t border-border">
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
        <div className="flex items-end justify-between mt-auto pt-2">
          <div>
            {product.oldPrice && (
              <span className="text-xs text-muted-foreground line-through block">{formatPrice(product.oldPrice)}</span>
            )}
            <span className="font-display font-bold text-lg text-foreground">{formatPrice(product.price)}</span>
          </div>
          <AddToCartButton productId={product.id} variant="icon" />
        </div>
      </div>
    </div>
  );
};
