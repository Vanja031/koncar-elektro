import type { Metadata } from 'next';
import { metadataForStaticPath } from '@/lib/seo/metadata';
import TermsOfSalePage from '@/views/TermsOfSalePage';

export const metadata: Metadata = metadataForStaticPath('/uslovi-kupovine/');

/** Bank/checkout alias — same content as `/uslovi-koriscenja`, kupovina wording. */
export default function UsloviKupovineRoute() {
  return <TermsOfSalePage variant="kupovine" />;
}
