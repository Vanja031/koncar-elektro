import type { Metadata } from 'next';
import { getStoreCategoryBySlugServer } from '@/lib/api/wc-store/server';
import { fetchListingForRoute } from '@/lib/isr/listing';
import { REVALIDATE_CATEGORY } from '@/lib/isr/revalidate';
import { metadataForCategory, metadataForStaticPath } from '@/lib/seo/metadata';
import { parseProductCategoryPath } from '@/lib/routeParser';
import ProductCategoryRoute from '@/views/ProductCategoryRoute';

type Props = { params: { slug?: string[] } };

export const revalidate = REVALIDATE_CATEGORY;
// No generateStaticParams here — category tree is small enough that
// on-demand render + ISR cache (default dynamicParams) is sufficient.
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slugParts = params.slug ?? [];
  if (slugParts.length === 0) {
    return metadataForStaticPath('/proizvodi/');
  }

  const pathname = `/product-category/${slugParts.join('/')}/`;
  const deepestSlug = slugParts[slugParts.length - 1];

  try {
    const category = await getStoreCategoryBySlugServer(deepestSlug);
    const image = category?.image?.src ?? undefined;
    return metadataForCategory(pathname, category?.name ?? deepestSlug, image);
  } catch {
    return metadataForCategory(pathname, deepestSlug);
  }
}

export default async function ProductCategoryPage({ params }: Props) {
  const slugParts = params.slug ?? [];
  const parsed = parseProductCategoryPath(slugParts);
  const initialListing = parsed ? await fetchListingForRoute(parsed) : undefined;

  return <ProductCategoryRoute initialListing={initialListing ?? undefined} />;
}
