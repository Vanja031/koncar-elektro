import { Lock, Truck } from 'lucide-react';
import { formatPrice } from '@/data/homepage';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/shipping';
import { useCart } from '@/context/CartContext';
import { CHECKOUT_FORM_ID } from '@/components/checkout/CheckoutForm';

export const CheckoutSummary = () => {
  const { lines, subtotal, subtotalRegular, savings, shipping, total } = useCart();
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const hasSavings = savings > 0;

  return (
    <aside className="cart-summary">
      <h2 className="cart-summary-title">Vaša porudžbina</h2>

      <ul className="checkout-summary-items">
        {lines.map((line) => (
          <li key={line.productId} className="checkout-summary-item">
            <div className="checkout-summary-thumb">
              <img src={line.image} alt="" className="max-h-full max-w-full object-contain" />
              <span className="checkout-summary-qty">{line.quantity}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-foreground line-clamp-2 leading-snug">{line.name}</p>
            </div>
            <span className="text-sm font-medium text-foreground shrink-0">{formatPrice(line.lineTotal)}</span>
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
          <dd>{shipping.isFree ? 'Besplatno' : formatPrice(shipping.cost)}</dd>
        </div>
      </dl>

      {!shipping.isFree && remainingForFree > 0 && (
        <p className="cart-summary-hint">
          <Truck className="w-4 h-4 shrink-0 text-primary" />
          Dodajte još <strong>{formatPrice(remainingForFree)}</strong> za besplatnu dostavu
        </p>
      )}

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

      <button type="submit" form={CHECKOUT_FORM_ID} className="checkout-submit-btn mt-5 hidden lg:block">
        Završi porudžbinu
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
