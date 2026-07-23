import { Link } from '@/lib/router-compat';
import { Minus, Plus, X } from 'lucide-react';
import { formatPrice } from '@/data/homepage';
import type { ResolvedCartLine } from '@/context/CartContext';
import { BrandMark } from '@/components/brand/BrandMark';
import { ProductImage } from '@/components/product/ProductImage';

type Props = {
  line: ResolvedCartLine;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

export const CartLineItem = ({ line, onQuantityChange, onRemove }: Props) => (
  <article className="cart-line">
    {/* Desktop */}
    <div className="cart-line-desktop hidden md:flex">
      <Link to={line.url} className="cart-line-media">
        <ProductImage src={line.image} alt={line.name} className="max-h-full max-w-full object-contain" placeholderClassName="rounded" />
      </Link>

      <div className="cart-line-body">
        <div className="cart-line-top">
          <div className="min-w-0">
            <BrandMark brand={line.brand} size="xs" />
            <Link to={line.url} className="cart-line-title">
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
              <span className="cart-line-old-price">{formatPrice(line.oldPrice * line.quantity)}</span>
            )}
            <span className="cart-line-total">{formatPrice(line.lineTotal)}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Mobile — compact card */}
    <div className="cart-line-mobile md:hidden">
      <div className="cart-line-mobile-head">
        <Link to={line.url} className="cart-line-mobile-media">
          <ProductImage src={line.image} alt={line.name} className="max-h-full max-w-full object-contain" placeholderClassName="rounded" />
        </Link>

        <div className="cart-line-mobile-info">
          <div className="cart-line-mobile-meta">
            <BrandMark brand={line.brand} size="xs" />
            <button type="button" onClick={onRemove} className="cart-line-mobile-remove" aria-label="Ukloni iz korpe">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <Link to={line.url} className="cart-line-mobile-title">
            {line.name}
          </Link>
          <p className="cart-line-mobile-unit">{formatPrice(line.price)} / kom</p>
          {!line.inStock && (
            <p className="cart-line-mobile-stock">Nije na stanju</p>
          )}
        </div>
      </div>

      <div className="cart-line-mobile-foot">
        <div className="cart-line-qty-compact" aria-label="Količina">
          <button
            type="button"
            onClick={() => onQuantityChange(line.quantity - 1)}
            className="cart-line-qty-compact-btn"
            aria-label="Smanji količinu"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="cart-line-qty-compact-value" aria-live="polite">{line.quantity}</span>
          <button
            type="button"
            onClick={() => onQuantityChange(line.quantity + 1)}
            className="cart-line-qty-compact-btn"
            aria-label="Povećaj količinu"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <div className="cart-line-mobile-total-wrap">
          {line.oldPrice && (
            <span className="cart-line-mobile-old">{formatPrice(line.oldPrice * line.quantity)}</span>
          )}
          <span className="cart-line-mobile-total">{formatPrice(line.lineTotal)}</span>
        </div>
      </div>
    </div>
  </article>
);
