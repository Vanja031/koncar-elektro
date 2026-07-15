import type { Metadata } from 'next';
import { metadataForStaticPath } from '@/lib/seo/metadata';
import BestSellersPage from '@/views/BestSellersPage';

export const metadata: Metadata = metadataForStaticPath('/najprodavanije/');

export default function NajprodavanijePage() {
  return <BestSellersPage />;
}
