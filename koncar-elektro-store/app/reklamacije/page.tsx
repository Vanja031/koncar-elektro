import type { Metadata } from 'next';
import { metadataForStaticPath } from '@/lib/seo/metadata';
import ComplaintsPage from '@/views/ComplaintsPage';

export const metadata: Metadata = metadataForStaticPath('/reklamacije/');

export default function ReklamacijeRoute() {
  return <ComplaintsPage />;
}
