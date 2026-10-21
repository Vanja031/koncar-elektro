import { useState, type FormEvent } from 'react';
import { formatPrice } from '@/data/homepage';
import { useCart } from '@/context/CartContext';

type DiscountProps = {
  onRemove?: () => void;
  disabled?: boolean;
};

export const CartCouponDiscountRow = ({ onRemove, disabled = false }: DiscountProps) => {
  const { couponCode, couponDiscount } = useCart();
  if (!couponCode || couponDiscount <= 0) return null;

  return (
    <div className="cart-summary-row">
      <dt>
        Popust ({couponCode.toUpperCase()})
        {onRemove && (
          <button type="button" className="cart-coupon-remove" onClick={onRemove} disabled={disabled}>
            Ukloni
          </button>
        )}
      </dt>
      <dd className="text-emerald-600 font-semibold">−{formatPrice(couponDiscount)}</dd>
    </div>
  );
};

type FieldProps = {
  disabled?: boolean;
};

export const CouponCodeField = ({ disabled = false }: FieldProps) => {
  const { couponCode, couponPending, couponError, applyCoupon, removeCoupon } = useCart();
  const [draft, setDraft] = useState('');
  const [errorDismissed, setErrorDismissed] = useState(false);
  const confirmed = Boolean(couponCode) && !couponPending;
  const visibleError = errorDismissed ? null : couponError;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (disabled || couponPending) return;
    setErrorDismissed(false);
    applyCoupon(draft);
  };

  const clear = () => {
    setDraft('');
    removeCoupon();
  };

  return (
    <div className="cart-coupon">
      {confirmed ? (
        <div className="cart-coupon-applied">
          <span>
            Kod <strong>{couponCode!.toUpperCase()}</strong> je primenjen.
          </span>
          <button type="button" onClick={clear} disabled={disabled}>
            Ukloni
          </button>
        </div>
      ) : (
        <form onSubmit={submit}>
          <label htmlFor="checkout-coupon">Kod za popust</label>
          <div className="cart-coupon-row">
            <input
              id="checkout-coupon"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setErrorDismissed(true);
              }}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={40}
              placeholder="Unesite kod"
              disabled={disabled || couponPending}
            />
            <button type="submit" className="cart-coupon-apply" disabled={disabled || couponPending || !draft.trim()}>
              {couponPending ? 'Proveravam…' : 'Primeni'}
            </button>
          </div>
        </form>
      )}
      {visibleError && <p className="cart-coupon-error">{visibleError}</p>}
    </div>
  );
};
