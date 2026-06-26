import { useState } from 'react';
import { Minus, Plus, Check, Truck, Package, Phone } from 'lucide-react';
import { formatPrice } from '@/data/homepage';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import type { ProductDetail } from '@/data/productDetail';

type Props = {
  product: ProductDetail;
  onAdded?: () => void;
};

export const ProductPurchaseCard = ({ product, onAdded }: Props) => {
  const [quantity, setQuantity] = useState(1);
  const savings = product.oldPrice ? product.oldPrice - product.price : 0;

  return (
    <aside className="product-purchase-card lg:sticky lg:top-28">
      <div className="product-purchase-price-block">
        <p className="product-purchase-price">{formatPrice(product.price)}</p>
        {product.oldPrice && (
          <p className="product-purchase-old-price">{formatPrice(product.oldPrice)}</p>
        )}
        {savings > 0 && (
          <span className="product-purchase-savings">Ušteda {formatPrice(savings)}</span>
        )}
        <p className="text-xs text-muted-foreground mt-2">Cena sa PDV-om</p>
      </div>

      <p className={`product-purchase-stock ${product.inStock ? 'product-purchase-stock--in' : ''}`}>
        <Check className="w-4 h-4" strokeWidth={3} />
        {product.inStock ? 'Na stanju' : 'Nije na stanju'}
      </p>

      {product.inStock && (
        <div className="product-purchase-shipping">
          <div className="product-purchase-shipping-row">
            <Truck className="w-4 h-4 text-primary shrink-0" />
            <span>Isporuka već <strong>sutra</strong></span>
          </div>
          <div className="product-purchase-shipping-row">
            <Package className="w-4 h-4 text-primary shrink-0" />
            <span>Besplatna dostava preko <strong>10.000 RSD</strong></span>
          </div>
        </div>
      )}

      <div className="product-purchase-actions">
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

        <AddToCartButton
          productId={product.id}
          quantity={quantity}
          variant="yellow"
          disabled={!product.inStock}
          className="w-full py-3.5"
          onAdded={onAdded}
        />

        <button type="button" className="product-purchase-buy-now" disabled={!product.inStock}>
          Kupi odmah
        </button>
      </div>

      <div className="product-purchase-contact">
        <a href="tel:0616544490" className="product-purchase-contact-link">
          <Phone className="w-4 h-4" />
          061 65 444 90
        </a>
        <a href="tel:0616544490" className="product-purchase-contact-link product-purchase-contact-link--viber">
          Viber podrška
        </a>
      </div>
    </aside>
  );
};
