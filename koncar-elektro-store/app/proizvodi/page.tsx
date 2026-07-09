import type { Metadata } from 'next';
import { metadataForStaticPath } from '@/lib/seo/metadata';
import CategoryPage from '@/views/CategoryPage';

export const metadata: Metadata = metadataForStaticPath('/proizvodi/');

export default function ProizvodiPage() {
  return <CategoryPage programSlug="alati" />;
}
