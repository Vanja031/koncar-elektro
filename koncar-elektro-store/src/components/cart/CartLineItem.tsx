import { Link } from 'react-router-dom';
import { Minus, Plus, X } from 'lucide-react';
import { formatPrice } from '@/data/homepage';
import { getProductUrl } from '@/data/productDetail';
import type { ResolvedCartLine } from '@/context/CartContext';

type Props = {
  line: ResolvedCartLine;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

export const CartLineItem = ({ line, onQuantityChange, onRemove }: Props) => (
  <article className="cart-line">
    <Link to={getProductUrl(line.productId)} className="cart-line-media">
      <img src={line.image} alt={line.name} className="max-h-full max-w-full object-contain" />
    </Link>

    <div className="cart-line-body">
      <div className="cart-line-top">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{line.brand}</p>
          <Link to={getProductUrl(line.productId)} className="cart-line-title">
            {line.name}
          </Link>
          <p className="text-xs text-muted-foreground mt-1">
            Šifra: {line.sku || `KE-${line.productId}`}
          </p>
          {!line.inStock && (
            <p className="text-xs text-destructive font-medium mt-1">Trenutno nije na stanju</p>
          )}
        </div>
        <button type="button" onClick={onRemove} className="cart-line-remove" aria-label="Ukloni iz korpe">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="cart-line-bottom">
        <div className="product-quantity" aria-label="Količina">
          <button
            type="button"
            onClick={() => onQuantityChange(line.quantity - 1)}
            className="product-quantity-btn"
            aria-label="Smanji količinu"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="product-quantity-value" aria-live="polite">{line.quantity}</span>
          <button
            type="button"
            onClick={() => onQuantityChange(line.quantity + 1)}
            className="product-quantity-btn"
            aria-label="Povećaj količinu"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="cart-line-prices">
          {line.oldPrice && (
            <span className="text-xs text-muted-foreground line-through block text-right">
              {formatPrice(line.oldPrice * line.quantity)}
            </span>
          )}
          <span className="font-display font-bold text-lg text-primary">{formatPrice(line.lineTotal)}</span>
        </div>
      </div>
    </div>
  </article>
);
