import type { Metadata } from 'next';
import { metadataForStaticPath, NOINDEX_FOLLOW } from '@/lib/seo/metadata';
import OrderConfirmationPage from '@/views/OrderConfirmationPage';

export const metadata: Metadata = metadataForStaticPath(
  '/placanje-odjava/order-received/',
  NOINDEX_FOLLOW,
);

export default function OrderReceivedPage() {
  return <OrderConfirmationPage />;
}
