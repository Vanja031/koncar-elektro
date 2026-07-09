import type { Metadata } from 'next';
import { metadataForStaticPath, NOINDEX_FOLLOW } from '@/lib/seo/metadata';
import RegisterPage from '@/views/RegisterPage';

export const metadata: Metadata = metadataForStaticPath('/registracija/', NOINDEX_FOLLOW);

export default function RegistracijaPage() {
  return <RegisterPage />;
}
