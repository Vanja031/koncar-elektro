import type { Metadata } from 'next';
import { metadataForStaticPath, NOINDEX_FOLLOW } from '@/lib/seo/metadata';
import CheckoutPage from '@/views/CheckoutPage';

export const metadata: Metadata = metadataForStaticPath('/placanje-odjava/', NOINDEX_FOLLOW);

export default function PlacanjePage() {
  return <CheckoutPage />;
}
