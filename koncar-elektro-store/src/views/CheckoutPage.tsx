'use client';

import { Navigate } from '@/lib/router-compat';
import { ShopLayout } from '@/components/layout/ShopLayout';
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs';
import { useCart } from '@/context/CartContext';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { CheckoutSummary } from '@/components/checkout/CheckoutSummary';
import { ROUTES } from '@/lib/catalogUrls';

const CheckoutPage = () => {
  const { lines } = useCart();

  if (lines.length === 0) {
    return <Navigate to={ROUTES.cart} replace />;
  }

  return (
    <ShopLayout>
      <Breadcrumbs
        items={[
          { label: 'Početna', href: '/' },
          { label: 'Korpa', href: ROUTES.cart },
          { label: 'Plaćanje / Odjava' },
        ]}
        variant="bar"
      />

      <section className="container py-8 lg:py-10">
        <div className="cart-page-header">
          <h1 className="section-heading text-xl md:text-2xl">Plaćanje / Odjava</h1>
          <p className="text-sm text-muted-foreground">Sigurno završite porudžbinu u nekoliko koraka</p>
        </div>

        <div className="cart-page-grid">
          <CheckoutForm />
          <CheckoutSummary />
        </div>
      </section>
    </ShopLayout>
  );
};

export default CheckoutPage;
