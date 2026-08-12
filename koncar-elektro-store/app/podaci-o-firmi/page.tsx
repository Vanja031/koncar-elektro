import type { Metadata } from 'next';
import { metadataForStaticPath } from '@/lib/seo/metadata';
import CompanyInfoPage from '@/views/CompanyInfoPage';

export const metadata: Metadata = metadataForStaticPath('/podaci-o-firmi/');

export default function PodaciOFirmiRoute() {
  return <CompanyInfoPage />;
}
