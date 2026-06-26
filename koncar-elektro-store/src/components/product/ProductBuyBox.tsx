import { useState } from 'react';
import { Star, ShoppingCart, Heart, Minus, Plus, Truck, Shield, CreditCard, Phone } from 'lucide-react';
import { formatPrice } from '@/data/homepage';
import type { ProductDetail } from '@/data/productDetail';

type Props = {
  product: ProductDetail;
  onAdd?: (quantity: number) => void;
};

export const ProductBuyBox = ({ product, onAdd }: Props) => {
  const [quantity, setQuantity] = useState(1);
  const discount = product.oldPrice
    ? Math.round(100 - (product.price / product.oldPrice) * 100)
    : 0;

  const scrollToReviews = () => {
    document.getElementById('product-tab-reviews')?.click();
    document.getElementById('product-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="product-buy-box">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{product.brand}</p>
      <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground leading-tight mt-1">
        {product.name}
      </h1>
      <p className="text-sm text-muted-foreground mt-1">Šifra: {product.sku}</p>

      <button
        type="button"
        onClick={scrollToReviews}
        className="flex items-center gap-2 mt-3 group"
        aria-label={`${product.rating} od 5 zvezdica, ${product.reviews} recenzija`}
      >
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < product.rating ? 'fill-accent text-accent' : 'fill-muted text-muted'}`}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
          {product.reviews} recenzija
        </span>
      </button>

      <p className="text-sm text-foreground/80 leading-relaxed mt-4">{product.subtitle}</p>

      <div className="flex flex-wrap gap-2 mt-4">
        {product.specs.map((spec) => (
          <span key={spec} className="catalog-spec-chip text-xs px-2.5 py-1">{spec}</span>
        ))}
      </div>

      <div className="product-buy-price mt-6">
        {product.oldPrice && (
          <div className="flex items-center gap-3 mb-1">
            <span className="text-sm text-muted-foreground line-through">{formatPrice(product.oldPrice)}</span>
            {discount > 0 && (
              <span className="text-xs font-bold bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                Ušteda {formatPrice(product.oldPrice - product.price)}
              </span>
            )}
          </div>
        )}
        <p className="font-display font-bold text-3xl md:text-4xl text-foreground">{formatPrice(product.price)}</p>
        <p className="text-xs text-muted-foreground mt-1">Cena sa PDV-om</p>
      </div>

      <p className={`text-sm mt-4 flex items-center gap-2 font-medium ${product.inStock ? 'text-emerald-600' : 'text-muted-foreground'}`}>
        <span className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
        {product.inStock ? 'Na stanju — spremno za slanje' : 'Trenutno nije na stanju'}
      </p>

      {product.inStock && (
        <div className="flex items-center gap-2 mt-5 text-sm text-muted-foreground">
          <Truck className="w-4 h-4 text-primary shrink-0" />
          Isporuka za <span className="font-semibold text-foreground">{product.deliveryDays}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <div className="product-quantity" aria-label="Količina">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="product-quantity-btn"
            aria-label="Smanji količinu"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="product-quantity-value" aria-live="polite">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="product-quantity-btn"
            aria-label="Povećaj količinu"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onAdd?.(quantity)}
          disabled={!product.inStock}
          className="btn-yellow flex-1 flex items-center justify-center gap-2 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-5 h-5" />
          Dodaj u korpu
        </button>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button type="button" className="product-secondary-action" aria-label="Dodaj u listu želja">
          <Heart className="w-4 h-4" />
          Lista želja
        </button>
        <label className="product-secondary-action cursor-pointer">
          <input type="checkbox" className="rounded border-border mr-2" />
          Uporedi
        </label>
      </div>

      <div className="product-buy-trust mt-6">
        <div className="product-buy-trust-item">
          <Shield className="w-4 h-4 text-primary shrink-0" />
          <span>Garancija <strong>{product.warrantyMonths} mes.</strong></span>
        </div>
        <div className="product-buy-trust-item">
          <CreditCard className="w-4 h-4 text-primary shrink-0" />
          <span>Kartice, virman, <strong>pouzeće</strong></span>
        </div>
        <div className="product-buy-trust-item">
          <Phone className="w-4 h-4 text-primary shrink-0" />
          <a href="tel:0111234567" className="hover:text-primary transition-colors">
            Stručna podrška: <strong>011 123 4567</strong>
          </a>
        </div>
      </div>
    </div>
  );
};
