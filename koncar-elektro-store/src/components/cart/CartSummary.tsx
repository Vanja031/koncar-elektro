import { Link } from 'react-router-dom';
import { Lock, Truck } from 'lucide-react';
import { formatPrice } from '@/data/homepage';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/shipping';
import { useCart } from '@/context/CartContext';
import { PaymentCardIcons } from '@/components/payment/PaymentCardIcons';
import { getProductListingUrl, ROUTES } from '@/lib/catalogUrls';

const browseUrl = getProductListingUrl('alati', 'elektricni-alat', 'busilice-i-odvijaci');

export const CartSummary = () => {
  const { subtotal, shipping, total, itemCount } = useCart();
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <aside className="cart-summary">
      <h2 className="cart-summary-title">Pregled porudžbine</h2>

      <dl className="cart-summary-rows">
        <div className="cart-summary-row">
          <dt>Proizvodi ({itemCount})</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div className="cart-summary-row">
          <dt>{shipping.label}</dt>
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
      <p className="text-xs text-muted-foreground">Cene su sa uračunatim PDV-om</p>

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
