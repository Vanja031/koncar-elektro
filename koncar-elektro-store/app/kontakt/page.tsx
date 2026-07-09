import type { Metadata } from 'next';
import { metadataForStaticPath } from '@/lib/seo/metadata';
import ContactPage from '@/views/ContactPage';

export const metadata: Metadata = metadataForStaticPath('/kontakt/');

export default function KontaktPage() {
  return <ContactPage />;
}
