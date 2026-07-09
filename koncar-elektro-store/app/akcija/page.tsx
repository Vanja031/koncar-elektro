import type { Metadata } from 'next';
import { fetchSalePageData } from '@/lib/isr/server';
import { REVALIDATE_SALE } from '@/lib/isr/revalidate';
import { metadataForStaticPath } from '@/lib/seo/metadata';
import SalePage from '@/views/SalePage';

export const revalidate = REVALIDATE_SALE;

export const metadata: Metadata = metadataForStaticPath('/akcija/');

export default async function AkcijaPage() {
  const initialListing = await fetchSalePageData();
  return <SalePage initialListing={initialListing} />;
}
