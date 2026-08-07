'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useSearchParams, Link } from '@/lib/router-compat';
import { ShopLayout } from '@/components/layout/ShopLayout';
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs';
import { formatPrice } from '@/data/homepage';
import { savePlacedOrder, type PlacedOrder } from '@/lib/order';
import { PaymentCardIcons } from '@/components/payment/PaymentCardIcons';
import { useCart } from '@/context/CartContext';
import { ROUTES } from '@/lib/catalogUrls';
import { trackPurchase } from '@/lib/analytics/gtag';

const PURCHASE_TRACKED_KEY = 'koncar-purchase-tracked';

type ViewState =
  | { phase: 'loading' }
  | { phase: 'success'; order: PlacedOrder }
  | { phase: 'failed'; reason: 'fail' | 'cancel' | 'pending' | 'error' };

const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [state, setState] = useState<ViewState>({ phase: 'loading' });

  const wcOrderId = searchParams.get('wcOrderId');
  const status = searchParams.get('status');
  const isMock = searchParams.get('mock') === '1';

  useEffect(() => {
    if (!wcOrderId) {
      setState({ phase: 'failed', reason: 'error' });
      return;
    }

    // Local dev / WC_LIVE_CHECKOUT off — nothing was actually created upstream.
    if (isMock) {
      const order: PlacedOrder = {
        id: wcOrderId,
        email: '',
        phone: '',
        customerName: 'Test Test',
        address: '',
        city: '',
        postalCode: '',
        paymentMethod: 'card',
        subtotal: 0,
        shipping: 0,
        total: 0,
        itemCount: 0,
        createdAt: new Date().toISOString(),
        mode: 'mock',
      };
      savePlacedOrder(order);
      setState({ phase: 'success', order });
      clearCart();
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(
          `/api/payments/raiaccept/status?wcOrderId=${encodeURIComponent(wcOrderId)}`,
        );
        const data = await response.json();
        if (cancelled) return;

        if (!response.ok || !data.order) {
          setState({ phase: 'failed', reason: 'error' });
          return;
        }

        if (data.outcome === 'paid') {
          const order: PlacedOrder = {
            id: data.order.orderNumber || data.order.orderId,
            email: data.order.email ?? '',
            phone: data.order.phone ?? '',
            customerName: data.order.customerName ?? '',
            address: data.order.address ?? '',
            city: data.order.city ?? '',
            postalCode: data.order.postalCode ?? '',
            paymentMethod: 'card',
            subtotal: Math.max(0, (data.order.total ?? 0) - (data.order.shipping ?? 0)),
            shipping: data.order.shipping ?? 0,
            total: data.order.total ?? 0,
            itemCount: data.order.itemCount ?? 0,
            createdAt: new Date().toISOString(),
            mode: 'live',
            wcOrderId: data.order.orderId,
          };
          savePlacedOrder(order);
          setState({ phase: 'success', order });
          clearCart();
        } else if (data.outcome === 'pending') {
          setState({ phase: 'failed', reason: 'pending' });
        } else {
          setState({ phase: 'failed', reason: status === 'cancel' ? 'cancel' : 'fail' });
        }
      } catch {
        if (!cancelled) setState({ phase: 'failed', reason: 'error' });
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wcOrderId, isMock]);

  useEffect(() => {
    if (state.phase !== 'success') return;
    const order = state.order;
    if (sessionStorage.getItem(PURCHASE_TRACKED_KEY) !== order.id) {
      trackPurchase({ transactionId: order.id, value: order.total, shipping: order.shipping, items: [] });
      sessionStorage.setItem(PURCHASE_TRACKED_KEY, order.id);
    }
  }, [state]);

  if (state.phase === 'loading') {
    return (
      <ShopLayout>
        <section className="container py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground mt-4">Provera statusa plaćanja…</p>
        </section>
      </ShopLayout>
    );
  }

  if (state.phase === 'success') {
    const { order } = state;
    return (
      <ShopLayout>
        <Breadcrumbs
          items={[
            { label: 'Početna', href: '/' },
            { label: 'Korpa', href: ROUTES.cart },
            { label: 'Plaćanje / Odjava', href: ROUTES.checkout },
            { label: 'Porudžbina potvrđena' },
          ]}
          variant="bar"
        />
        <section className="container py-10 lg:py-14">
          <div className="checkout-confirmation max-w-xl mx-auto">
            <div className="checkout-confirmation-icon" aria-hidden>
              <CheckCircle2 className="w-14 h-14 text-emerald-600" />
            </div>
            <h1 className="section-heading text-xl md:text-2xl text-center mb-3">
              Plaćanje uspešno!
            </h1>
            <p className="checkout-confirmation-lead text-center">
              Porudžbina <strong>#{order.id}</strong> je plaćena karticom i uspešno primljena.
            </p>

            <div className="checkout-confirmation-card">
              <dl className="checkout-confirmation-rows">
                <div>
                  <dt>Kupac</dt>
                  <dd>{order.customerName}</dd>
                </div>
                <div>
                  <dt>Ukupno</dt>
                  <dd className="text-primary font-display font-bold text-lg">{formatPrice(order.total)}</dd>
                </div>
              </dl>
            </div>

            <div className="flex justify-center my-6">
              <PaymentCardIcons size="sm" />
            </div>

            <div className="checkout-confirmation-actions">
              <Link to="/" className="btn-yellow px-8 py-3">
                Nastavi kupovinu
              </Link>
            </div>
          </div>
        </section>
      </ShopLayout>
    );
  }

  const reasonText: Record<'fail' | 'cancel' | 'pending' | 'error', string> = {
    fail: 'Plaćanje karticom nije uspelo. Sredstva nisu naplaćena.',
    cancel: 'Otkazali ste plaćanje.',
    pending: 'Plaćanje je još u obradi. Ako je novac skinut sa kartice, javite nam se sa brojem porudžbine.',
    error: 'Ne možemo trenutno da potvrdimo status plaćanja.',
  };

  return (
    <ShopLayout>
      <Breadcrumbs
        items={[
          { label: 'Početna', href: '/' },
          { label: 'Korpa', href: ROUTES.cart },
          { label: 'Plaćanje / Odjava', href: ROUTES.checkout },
          { label: 'Plaćanje nije uspelo' },
        ]}
        variant="bar"
      />
      <section className="container py-10 lg:py-14">
        <div className="checkout-confirmation max-w-xl mx-auto">
          <div className="checkout-confirmation-icon" aria-hidden>
            <XCircle className="w-14 h-14 text-red-600" />
          </div>
          <h1 className="section-heading text-xl md:text-2xl text-center mb-3">Plaćanje nije završeno</h1>
          <p className="checkout-confirmation-lead text-center">{reasonText[state.reason]}</p>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Vaša korpa je sačuvana — možete pokušati ponovo ili izabrati drugi način plaćanja.
          </p>

          <div className="checkout-confirmation-actions">
            <Link to={ROUTES.checkout} className="btn-yellow px-8 py-3">
              Nazad na plaćanje
            </Link>
          </div>
        </div>
      </section>
    </ShopLayout>
  );
};

export default PaymentResultPage;
