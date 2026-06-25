import { Star, ShoppingCart } from 'lucide-react';
import { formatPrice, type Product } from '@/data/homepage';

type Props = {
  product: Product;
  rank?: number;
  onAdd?: () => void;
};

export const ProductCard = ({ product, rank, onAdd }: Props) => {
  const discount = product.oldPrice
    ? Math.round(100 - (product.price / product.oldPrice) * 100)
    : 0;

  return (
    <div className="product-card-home h-full">
      {rank != null ? (
        <span className="badge-rank">{rank}</span>
      ) : product.oldPrice ? (
        <span className="badge-discount">-{discount}%</span>
      ) : null}
      <div className="aspect-square p-4 flex items-center justify-center bg-white">
        <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" loading="lazy" />
      </div>
      <div className="p-3 flex flex-col gap-1.5 flex-1 border-t border-border">
        <p className="text-sm font-semibold text-foreground leading-tight line-clamp-1">{product.name}</p>
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
          <button
            type="button"
            onClick={onAdd}
            className="w-9 h-9 bg-accent rounded flex items-center justify-center hover:brightness-105 transition-all shrink-0"
            aria-label="Dodaj u korpu"
          >
            <ShoppingCart className="w-4 h-4 text-accent-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};
