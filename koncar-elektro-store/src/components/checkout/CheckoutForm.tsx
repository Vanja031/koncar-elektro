'use client';

import { useState, type FormEvent } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { CreditCard, Coins, FileStack, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/data/homepage';
import { useCart } from '@/context/CartContext';
import { PaymentCardIcons } from '@/components/payment/PaymentCardIcons';
import {
  CARD_PAYMENT_UNAVAILABLE_MESSAGE,
  paymentMethodLabel,
  paymentMethodOrder,
  savePlacedOrder,
  type PaymentMethod,
} from '@/lib/order';
import { CheckoutClientError, placeOrderViaApi } from '@/lib/checkout/placeOrderClient';
import { ROUTES } from '@/lib/catalogUrls';

export const CHECKOUT_FORM_ID = 'checkout-form';

type FormState = {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  note: string;
  paymentMethod: PaymentMethod;
};

const initialForm: FormState = {
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  postalCode: '',
  note: '',
  paymentMethod: 'cod',
};

const paymentIcons: Record<PaymentMethod, typeof CreditCard> = {
  cod: Coins,
  card: CreditCard,
  bank: FileStack,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Props = {
  isSubmitting?: boolean;
  onSubmittingChange?: (busy: boolean) => void;
};

export const CheckoutForm = ({ isSubmitting = false, onSubmittingChange }: Props) => {
  const navigate = useNavigate();
  const { lines, subtotal, shipping, total, itemCount, clearCart } = useCart();
  const [form, setForm] = useState<FormState>(initialForm);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validate = (): string | null => {
    if (form.paymentMethod === 'card') {
      return CARD_PAYMENT_UNAVAILABLE_MESSAGE;
    }
    if (!form.email.trim() || !EMAIL_PATTERN.test(form.email.trim())) {
      return 'Unesite ispravnu email adresu.';
    }
    if (!form.phone.trim()) return 'Unesite broj telefona.';
    if (!form.firstName.trim() || !form.lastName.trim()) {
      return 'Unesite ime i prezime.';
    }
    if (!form.address.trim() || !form.city.trim() || !form.postalCode.trim()) {
      return 'Unesite kompletnu adresu za dostavu.';
    }
    if (lines.length === 0) return 'Korpa je prazna.';
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationError = validate();
    if (validationError) {
      toast.error('Proverite unos', { description: validationError });
      return;
    }

    onSubmittingChange?.(true);

    try {
      const { placed } = await placeOrderViaApi({
        items: lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        })),
        email: form.email.trim(),
        phone: form.phone.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        postalCode: form.postalCode.trim(),
        customerNote: form.note.trim(),
        paymentMethod: form.paymentMethod,
        subtotal,
        shipping: shipping.cost,
        total,
        itemCount,
      });

      savePlacedOrder(placed);
      // Navigate first; keep isSubmitting=true so CheckoutPage doesn't redirect
      // to empty cart before the thank-you route mounts.
      navigate(ROUTES.checkoutThanks);
      clearCart();
    } catch (err) {
      const message =
        err instanceof CheckoutClientError
          ? err.message
          : 'Porudžbina nije uspela. Pokušajte ponovo.';
      toast.error('Porudžbina nije uspela', { description: message });
      onSubmittingChange?.(false);
    }
  };

  return (
    <form
      id={CHECKOUT_FORM_ID}
      className="checkout-form"
      onSubmit={handleSubmit}
      noValidate
      aria-busy={isSubmitting}
    >
      <div className="checkout-card">
        <h2 className="checkout-card-title">1. Kontakt</h2>
        <div className="checkout-field-grid">
          <div className="checkout-field checkout-field--full">
            <label htmlFor="checkout-email">Email</label>
            <input
              id="checkout-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="vas@email.rs"
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="checkout-field checkout-field--full">
            <label htmlFor="checkout-phone">Telefon</label>
            <input
              id="checkout-phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="06x xxx xxxx"
              disabled={isSubmitting}
              required
            />
          </div>
        </div>
      </div>

      <div className="checkout-card">
        <h2 className="checkout-card-title">2. Adresa za dostavu</h2>
        <div className="checkout-field-grid">
          <div className="checkout-field">
            <label htmlFor="checkout-first">Ime</label>
            <input
              id="checkout-first"
              autoComplete="given-name"
              value={form.firstName}
              onChange={(e) => update('firstName', e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="checkout-field">
            <label htmlFor="checkout-last">Prezime</label>
            <input
              id="checkout-last"
              autoComplete="family-name"
              value={form.lastName}
              onChange={(e) => update('lastName', e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="checkout-field checkout-field--full">
            <label htmlFor="checkout-address">Adresa</label>
            <input
              id="checkout-address"
              autoComplete="street-address"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              placeholder="Ulica i broj"
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="checkout-field">
            <label htmlFor="checkout-city">Grad</label>
            <input
              id="checkout-city"
              autoComplete="address-level2"
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="checkout-field">
            <label htmlFor="checkout-postal">Poštanski broj</label>
            <input
              id="checkout-postal"
              autoComplete="postal-code"
              value={form.postalCode}
              onChange={(e) => update('postalCode', e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="checkout-field checkout-field--full">
            <label htmlFor="checkout-note">Napomena (opciono)</label>
            <textarea
              id="checkout-note"
              rows={2}
              value={form.note}
              onChange={(e) => update('note', e.target.value)}
              placeholder="Sprat, interfon, dodatne instrukcije..."
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      <div className="checkout-card">
        <h2 className="checkout-card-title">3. Dostava</h2>
        <div className="checkout-shipping-option">
          <div>
            <p className="font-medium text-sm text-foreground">Kurirska dostava</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {shipping.hint ?? 'Isporuka 1–2 radna dana'}
            </p>
          </div>
          <span className="text-sm font-semibold text-primary shrink-0">
            {shipping.isFree ? 'Besplatno' : formatPrice(shipping.cost)}
          </span>
        </div>
      </div>

      <div className="checkout-card">
        <h2 className="checkout-card-title">4. Način plaćanja</h2>
        <div className="checkout-payment-grid">
          {paymentMethodOrder.map((method) => {
            const Icon = paymentIcons[method];
            const active = form.paymentMethod === method;
            return (
              <button
                key={method}
                type="button"
                onClick={() => update('paymentMethod', method)}
                disabled={isSubmitting}
                className={`checkout-payment-card ${active ? 'checkout-payment-card--active' : ''}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{paymentMethodLabel[method]}</span>
              </button>
            );
          })}
        </div>

        <p className="checkout-payment-note">
          {form.paymentMethod === 'cod' && 'Plaćanje gotovinom kuriru prilikom preuzimanja.'}
          {form.paymentMethod === 'card' && (
            <>
              <span className="text-red-700 font-medium">{CARD_PAYMENT_UNAVAILABLE_MESSAGE}</span>
              <PaymentCardIcons size="sm" className="mt-3 opacity-50" />
            </>
          )}
          {form.paymentMethod === 'bank' && 'Instrukcije za uplatu stižu na email nakon potvrde.'}
        </p>
      </div>

      <button
        type="submit"
        className="checkout-submit-btn lg:hidden"
        disabled={isSubmitting || form.paymentMethod === 'card'}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Obrađujemo porudžbinu…
          </>
        ) : (
          <>Završi porudžbinu · {formatPrice(total)}</>
        )}
      </button>
    </form>
  );
};
