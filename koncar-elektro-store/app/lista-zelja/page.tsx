import type { Metadata } from 'next';
import { metadataForStaticPath } from '@/lib/seo/metadata';
import WishlistPage from '@/views/WishlistPage';

export const metadata: Metadata = metadataForStaticPath('/lista-zelja/');

export default function ListaZeljaRoute() {
  return <WishlistPage />;
}
