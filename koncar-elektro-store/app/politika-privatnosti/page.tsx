import type { Metadata } from 'next';
import { metadataForStaticPath } from '@/lib/seo/metadata';
import PrivacyPolicyPage from '@/views/PrivacyPolicyPage';

export const metadata: Metadata = metadataForStaticPath('/politika-privatnosti/');

export default function PolitikaPrivatnostiPage() {
  return <PrivacyPolicyPage />;
}
