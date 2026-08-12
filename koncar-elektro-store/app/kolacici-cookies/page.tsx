import type { Metadata } from 'next';
import { metadataForStaticPath } from '@/lib/seo/metadata';
import CookiesPage from '@/views/CookiesPage';

export const metadata: Metadata = metadataForStaticPath('/kolacici-cookies/');

export default function KolaciciCookiesRoute() {
  return <CookiesPage />;
}
