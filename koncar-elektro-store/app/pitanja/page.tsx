import type { Metadata } from 'next';
import { metadataForStaticPath } from '@/lib/seo/metadata';
import FaqPage from '@/views/FaqPage';

export const metadata: Metadata = metadataForStaticPath('/pitanja/');

export default function PitanjaPage() {
  return <FaqPage />;
}
