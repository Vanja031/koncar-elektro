import { Link } from '@/lib/router-compat';
import { Lock, Truck } from 'lucide-react';
import { formatPrice } from '@/data/homepage';
import { useCart } from '@/context/CartContext';
import { PaymentCardIcons } from '@/components/payment/PaymentCardIcons';
import { getProductListingUrl, ROUTES } from '@/lib/catalogUrls';

const browseUrl = getProductListingUrl('alati', 'elektricni-alat', 'busilice-i-odvijaci');

export const CartSummary = () => {
  const { subtotal, subtotalRegular, savings, shipping, total, itemCount } = useCart();
  const hasSavings = savings > 0;

  return (
    <aside className="cart-summary">
      <h2 className="cart-summary-title">Pregled porudžbine</h2>

      <dl className="cart-summary-rows">
        <div className="cart-summary-row">
          <dt>Proizvodi ({itemCount})</dt>
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

      <div className="cart-summary-actions">
        <Link to={ROUTES.checkout} className="btn-yellow w-full py-3.5 flex items-center justify-center">
          Nastavi na plaćanje
        </Link>
        <Link to={browseUrl} className="cart-summary-continue-btn">
          Nastavi kupovinu
        </Link>
      </div>

      <div className="cart-summary-payments">
        <PaymentCardIcons size="sm" />
        <p className="cart-summary-secure">
          <Lock className="w-3.5 h-3.5" />
          Sigurna kupovina
        </p>
      </div>
    </aside>
  );
};
