'use client';

import { useState } from 'react';
import { Navigate } from '@/lib/router-compat';
import { ShopLayout } from '@/components/layout/ShopLayout';
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs';
import { useCart } from '@/context/CartContext';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { CheckoutSummary } from '@/components/checkout/CheckoutSummary';
import { ROUTES } from '@/lib/catalogUrls';

const CheckoutPage = () => {
  const { lines } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // While submitting we clear the cart before leaving — don't bounce to /korpa
  // or the thank-you page never loads.
  if (lines.length === 0 && !isSubmitting) {
    return <Navigate to={ROUTES.cart} replace />;
  }

  return (
    <ShopLayout showFloatingChat={false}>
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
          <h1 className="section-heading text-xl md:text-2xl">Završetak porudžbine</h1>
          <p className="text-sm text-muted-foreground">Unesite podatke i potvrdite porudžbinu</p>
        </div>

        <div className="cart-page-grid">
          <CheckoutForm isSubmitting={isSubmitting} onSubmittingChange={setIsSubmitting} />
          <div className="checkout-summary-sticky">
            <CheckoutSummary isSubmitting={isSubmitting} />
          </div>
        </div>
      </section>
    </ShopLayout>
  );
};

export default CheckoutPage;
