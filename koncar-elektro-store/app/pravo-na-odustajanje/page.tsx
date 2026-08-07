import type { Metadata } from 'next';
import { metadataForStaticPath } from '@/lib/seo/metadata';
import WithdrawalRightPage from '@/views/WithdrawalRightPage';

export const metadata: Metadata = metadataForStaticPath('/pravo-na-odustajanje/');

export default function PravoNaOdustajanjeRoute() {
  return <WithdrawalRightPage />;
}
