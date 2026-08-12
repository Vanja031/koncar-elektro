import type { Metadata } from 'next';
import { metadataForStaticPath } from '@/lib/seo/metadata';
import ComparePage from '@/views/ComparePage';

export const metadata: Metadata = metadataForStaticPath('/uporedite/');

export default function UporediteRoute() {
  return <ComparePage />;
}
