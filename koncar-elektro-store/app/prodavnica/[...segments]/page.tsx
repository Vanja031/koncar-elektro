import type { Metadata } from 'next';
import { fetchProductPageData } from '@/lib/isr/server';
import { REVALIDATE_PRODUCT } from '@/lib/isr/revalidate';
import { getStaticProductParams } from '@/lib/isr/staticParams';
import { metadataForProduct } from '@/lib/seo/metadata';
import ProductPage from '@/views/ProductPage';

type Props = { params: { segments: string[] } };

export const revalidate = REVALIDATE_PRODUCT;
// Products not returned by generateStaticParams are rendered on first visit
// and then cached for `revalidate` seconds (standard ISR for large catalogs).
export const dynamicParams = true;

export async function generateStaticParams() {
  return getStaticProductParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const segments = params.segments ?? [];
  const slug = segments[segments.length - 1] ?? '';
  const pathname = `/prodavnica/${segments.join('/')}/`;

  try {
    const { product } = await fetchProductPageData(slug);
    const image = product?.gallery?.[0];
    return metadataForProduct(pathname, product?.name ?? slug, image);
  } catch {
    return metadataForProduct(pathname, slug);
  }
}

export default async function ProdavnicaPage({ params }: Props) {
  const segments = params.segments ?? [];
  const slug = segments[segments.length - 1] ?? '';
  const { product, related } = await fetchProductPageData(slug);

  return <ProductPage initialProduct={product} initialRelated={related} />;
}
