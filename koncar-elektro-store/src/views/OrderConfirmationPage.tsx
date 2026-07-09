'use client';

import { Link, Navigate } from '@/lib/router-compat';
import { CheckCircle2 } from 'lucide-react';
import { ShopLayout } from '@/components/layout/ShopLayout';
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs';
import { formatPrice } from '@/data/homepage';
import { getPlacedOrder, paymentMethodLabel } from '@/lib/order';
import { PaymentCardIcons } from '@/components/payment/PaymentCardIcons';
import { getProductListingUrl, ROUTES } from '@/lib/catalogUrls';

const browseUrl = getProductListingUrl('alati', 'elektricni-alat', 'busilice-i-odvijaci');

const OrderConfirmationPage = () => {
  const order = getPlacedOrder();

  if (!order) {
    return <Navigate to="/" replace />;
  }

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
          <h1 className="section-heading text-xl md:text-2xl text-center mb-3">Hvala na porudžbini!</h1>
          <p className="checkout-confirmation-lead text-center">
            Porudžbina <strong>#{order.id}</strong> je uspešno primljena.
          </p>

          <div className="checkout-confirmation-card">
            <dl className="checkout-confirmation-rows">
              <div>
                <dt>Kupac</dt>
                <dd>{order.customerName}</dd>
              </div>
              <div>
                <dt>Adresa</dt>
                <dd>{order.address}, {order.postalCode} {order.city}</dd>
              </div>
              <div>
                <dt>Telefon</dt>
                <dd>{order.phone}</dd>
              </div>
              <div>
                <dt>Plaćanje</dt>
                <dd>{paymentMethodLabel[order.paymentMethod]}</dd>
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
            <Link to={browseUrl} className="btn-yellow px-8 py-3">
              Nastavi kupovinu
            </Link>
          </div>
        </div>
      </section>
    </ShopLayout>
  );
};

export default OrderConfirmationPage;
