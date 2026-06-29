import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Coins, FileStack } from 'lucide-react';
import { formatPrice } from '@/data/homepage';
import { useCart } from '@/context/CartContext';
import { PaymentCardIcons } from '@/components/payment/PaymentCardIcons';
import {
  createOrderId,
  paymentMethodLabel,
  savePlacedOrder,
  type PaymentMethod,
} from '@/lib/order';
import { ROUTES } from '@/lib/catalogUrls';
import { companyInfo } from '@/data/staticPages';

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
  paymentMethod: 'card',
};

const paymentIcons: Record<PaymentMethod, typeof CreditCard> = {
  card: CreditCard,
  cod: Coins,
  bank: FileStack,
};

export const CheckoutForm = () => {
  const navigate = useNavigate();
  const { subtotal, shipping, total, itemCount, clearCart } = useCart();
  const [form, setForm] = useState<FormState>(initialForm);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const firstName = form.firstName.trim() || 'Demo';
    const lastName = form.lastName.trim() || 'Kupac';

    const orderId = createOrderId();
    savePlacedOrder({
      id: orderId,
      email: form.email.trim() || companyInfo.email,
      phone: form.phone.trim() || '0600000000',
      customerName: `${firstName} ${lastName}`,
      address: form.address.trim() || 'Demo adresa 1',
      city: form.city.trim() || 'Beograd',
      postalCode: form.postalCode.trim() || '11000',
      paymentMethod: form.paymentMethod,
      subtotal,
      shipping: shipping.cost,
      total,
      itemCount,
      createdAt: new Date().toISOString(),
    });

    clearCart();
    navigate(ROUTES.checkoutThanks);
  };

  return (
    <form className="checkout-form" onSubmit={handleSubmit} noValidate>
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
            />
          </div>
          <div className="checkout-field">
            <label htmlFor="checkout-last">Prezime</label>
            <input
              id="checkout-last"
              autoComplete="family-name"
              value={form.lastName}
              onChange={(e) => update('lastName', e.target.value)}
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
            />
          </div>
          <div className="checkout-field">
            <label htmlFor="checkout-city">Grad</label>
            <input
              id="checkout-city"
              autoComplete="address-level2"
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
            />
          </div>
          <div className="checkout-field">
            <label htmlFor="checkout-postal">Poštanski broj</label>
            <input
              id="checkout-postal"
              autoComplete="postal-code"
              value={form.postalCode}
              onChange={(e) => update('postalCode', e.target.value)}
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
            />
          </div>
        </div>
      </div>

      <div className="checkout-card">
        <h2 className="checkout-card-title">3. Dostava</h2>
        <div className="checkout-shipping-option">
          <div>
            <p className="font-medium text-sm text-foreground">Kurirska dostava</p>
            <p className="text-xs text-muted-foreground mt-0.5">{shipping.hint ?? 'Isporuka 1–2 radna dana'}</p>
          </div>
          <span className="text-sm font-semibold text-primary shrink-0">
            {shipping.isFree ? 'Besplatno' : formatPrice(shipping.cost)}
          </span>
        </div>
      </div>

      <div className="checkout-card">
        <h2 className="checkout-card-title">4. Plaćanje</h2>
        <p className="text-xs text-muted-foreground mb-3">Prihvatamo kartice:</p>
        <PaymentCardIcons size="sm" className="mb-4" />

        <div className="checkout-payment-grid">
          {(Object.keys(paymentMethodLabel) as PaymentMethod[]).map((method) => {
            const Icon = paymentIcons[method];
            const active = form.paymentMethod === method;
            return (
              <button
                key={method}
                type="button"
                onClick={() => update('paymentMethod', method)}
                className={`checkout-payment-card ${active ? 'checkout-payment-card--active' : ''}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{paymentMethodLabel[method]}</span>
              </button>
            );
          })}
        </div>

        <p className="checkout-payment-note">
          {form.paymentMethod === 'card' && 'Nakon potvrde bićete preusmereni na sigurnu stranicu banke.'}
          {form.paymentMethod === 'cod' && 'Plaćanje gotovinom kuriru prilikom preuzimanja.'}
          {form.paymentMethod === 'bank' && 'Instrukcije za uplatu stižu na email nakon potvrde.'}
        </p>
      </div>

      <button type="submit" className="btn-yellow w-full py-4 text-sm">
        Završi porudžbinu · {formatPrice(total)}
      </button>
    </form>
  );
};
