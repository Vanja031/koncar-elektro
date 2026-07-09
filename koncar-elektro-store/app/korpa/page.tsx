import type { Metadata } from 'next';
import { metadataForStaticPath, NOINDEX_FOLLOW } from '@/lib/seo/metadata';
import CartPage from '@/views/CartPage';

export const metadata: Metadata = metadataForStaticPath('/korpa/', NOINDEX_FOLLOW);

export default function KorpaPage() {
  return <CartPage />;
}
