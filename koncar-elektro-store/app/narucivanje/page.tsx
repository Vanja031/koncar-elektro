import type { Metadata } from 'next';
import { metadataForStaticPath } from '@/lib/seo/metadata';
import OrderingPage from '@/views/OrderingPage';

export const metadata: Metadata = metadataForStaticPath('/narucivanje/');

export default function NarucivanjeRoute() {
  return <OrderingPage />;
}
