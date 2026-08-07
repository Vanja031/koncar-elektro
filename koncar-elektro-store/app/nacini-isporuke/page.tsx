import type { Metadata } from 'next';
import { metadataForStaticPath } from '@/lib/seo/metadata';
import ShippingInfoPage from '@/views/ShippingInfoPage';

export const metadata: Metadata = metadataForStaticPath('/nacini-isporuke/');

export default function NaciniIsporukeRoute() {
  return <ShippingInfoPage />;
}
