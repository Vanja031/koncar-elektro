import { Loader2, Lock, Minus, Plus, Truck, X } from 'lucide-react';
import { formatPrice } from '@/data/homepage';
import { useCart } from '@/context/CartContext';
import { CHECKOUT_FORM_ID } from '@/components/checkout/CheckoutForm';

type Props = {
  isSubmitting?: boolean;
};

export const CheckoutSummary = ({ isSubmitting = false }: Props) => {
  const { lines, subtotal, subtotalRegular, savings, shipping, total, setQuantity, removeItem } = useCart();
  const hasSavings = savings > 0;

  return (
    <aside className="cart-summary">
      <h2 className="cart-summary-title">Vaša porudžbina</h2>

      <ul className="checkout-summary-items">
        {lines.map((line) => (
          <li key={line.productId} className="checkout-summary-item">
            <div className="checkout-summary-thumb">
              <img src={line.image} alt={line.name} className="max-h-full max-w-full object-contain" />
            </div>
            <div className="checkout-summary-item-body">
              <div className="checkout-summary-item-head">
                <p className="checkout-summary-item-name">{line.name}</p>
                <button
                  type="button"
                  onClick={() => removeItem(line.productId)}
                  className="checkout-summary-remove"
                  aria-label={`Ukloni ${line.name} iz korpe`}
                  disabled={isSubmitting}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="checkout-summary-item-foot">
                <div className="checkout-summary-quantity" aria-label="Količina">
                  <button
                    type="button"
                    onClick={() => setQuantity(line.productId, line.quantity - 1)}
                    aria-label="Smanji količinu"
                    disabled={isSubmitting}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span aria-live="polite">{line.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(line.productId, line.quantity + 1)}
                    aria-label="Povećaj količinu"
                    disabled={isSubmitting}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="checkout-summary-item-price">{formatPrice(line.lineTotal)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <dl className="cart-summary-rows">
        <div className="cart-summary-row">
          <dt>Suma</dt>
          <dd>
            {hasSavings && (
              <span className="cart-summary-old-value">{formatPrice(subtotalRegular)}</span>
            )}
            {formatPrice(subtotal)}
          </dd>
        </div>
        <div className="cart-summary-row">
          <dt>Dostava</dt>
          <dd>{formatPrice(shipping.cost)}</dd>
        </div>
      </dl>

      <p className="cart-summary-hint">
        <Truck className="w-4 h-4 shrink-0 text-primary" />
        <span>{shipping.label}</span>
      </p>

      <div className="cart-summary-total">
        <span>Ukupno</span>
        <strong>{formatPrice(total)}</strong>
      </div>
      <p className="text-[10px] text-muted-foreground">Cene su sa uračunatim PDV-om</p>

      {hasSavings && (
        <p className="cart-summary-savings-badge">
          Uštedeli ste <strong>{formatPrice(savings)}</strong> na ovoj porudžbini
        </p>
      )}

      <button
        type="submit"
        form={CHECKOUT_FORM_ID}
        className="checkout-submit-btn mt-5 hidden lg:block"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Obrađujemo…
          </span>
        ) : (
          'Završi porudžbinu'
        )}
      </button>

      <div className="cart-summary-payments">
        <p className="cart-summary-secure">
          <Lock className="w-3.5 h-3.5" />
          Sigurna kupovina
        </p>
      </div>
    </aside>
  );
};
