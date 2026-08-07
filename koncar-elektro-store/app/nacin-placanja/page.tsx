import type { Metadata } from 'next';
import { metadataForStaticPath } from '@/lib/seo/metadata';
import PaymentMethodsPage from '@/views/PaymentMethodsPage';

export const metadata: Metadata = metadataForStaticPath('/nacin-placanja/');

export default function NacinPlacanjaRoute() {
  return <PaymentMethodsPage />;
}
