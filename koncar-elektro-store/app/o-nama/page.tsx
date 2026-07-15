import type { Metadata } from 'next';
import { metadataForStaticPath } from '@/lib/seo/metadata';
import AboutPage from '@/views/AboutPage';

export const metadata: Metadata = metadataForStaticPath('/o-nama/');

export default function ONamaPage() {
  return <AboutPage />;
}
