import type { Metadata } from 'next';
import { metadataForStaticPath } from '@/lib/seo/metadata';
import Index from '@/views/Index';

export const metadata: Metadata = metadataForStaticPath('/');

export default function HomePage() {
  return <Index />;
}
