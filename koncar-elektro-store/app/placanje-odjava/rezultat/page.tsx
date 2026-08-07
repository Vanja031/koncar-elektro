import { Suspense } from 'react';
import type { Metadata } from 'next';
import { metadataForStaticPath, NOINDEX_FOLLOW } from '@/lib/seo/metadata';
import PaymentResultPage from '@/views/PaymentResultPage';

export const metadata: Metadata = metadataForStaticPath(
  '/placanje-odjava/rezultat/',
  NOINDEX_FOLLOW,
);

export default function PaymentResultRoute() {
  return (
    <Suspense
      fallback={
        <section className="container py-16 text-center text-sm text-muted-foreground">
          Provera statusa plaćanja…
        </section>
      }
    >
      <PaymentResultPage />
    </Suspense>
  );
}
