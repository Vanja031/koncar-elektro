import type { Metadata } from 'next';
import { Suspense } from 'react';
import { metadataForStaticPath, NOINDEX_FOLLOW } from '@/lib/seo/metadata';
import LoginPage from '@/views/LoginPage';

export const metadata: Metadata = metadataForStaticPath('/prijava/', NOINDEX_FOLLOW);

export default function PrijavaPage() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}
