import type { Metadata } from 'next';
import { Suspense } from 'react';
import { metadataForStaticPath } from '@/lib/seo/metadata';
import SearchPage from '@/views/SearchPage';

export const metadata: Metadata = metadataForStaticPath('/pretraga/');

export default function PretragaPage() {
  return (
    <Suspense fallback={null}>
      <SearchPage />
    </Suspense>
  );
}
