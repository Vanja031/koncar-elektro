import type { Metadata } from 'next';
import { metadataForStaticPath } from '@/lib/seo/metadata';
import TermsOfSalePage from '@/views/TermsOfSalePage';

export const metadata: Metadata = metadataForStaticPath('/uslovi-koriscenja/');

/** Canonical old-site URL for terms (baseline parity). */
export default function UsloviKoriscenjaRoute() {
  return <TermsOfSalePage variant="koriscenja" />;
}
