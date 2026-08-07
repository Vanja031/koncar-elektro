import type { Metadata } from 'next';
import { getStoreCategoryBySlugServer } from '@/lib/api/wc-store/server';
import { fetchListingForRoute } from '@/lib/isr/listing';
import { REVALIDATE_CATEGORY } from '@/lib/isr/revalidate';
import { metadataForCategory, metadataForStaticPath } from '@/lib/seo/metadata';
import { buildBreadcrumbJsonLd, jsonLdScriptProps } from '@/lib/seo/jsonld';
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

function humanizeSlug(slug: string): string {
  return slug
    .split('-')
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

export default async function ProductCategoryPage({ params }: Props) {
  const slugParts = params.slug ?? [];
  const parsed = parseProductCategoryPath(slugParts);
  const initialListing = parsed ? await fetchListingForRoute(parsed) : undefined;

  let breadcrumbJsonLd: ReturnType<typeof buildBreadcrumbJsonLd> | null = null;
  if (slugParts.length > 0) {
    const deepestSlug = slugParts[slugParts.length - 1];
    let deepestName = humanizeSlug(deepestSlug);
    try {
      const category = await getStoreCategoryBySlugServer(deepestSlug);
      if (category?.name) deepestName = category.name;
    } catch {
      // fall back to humanized slug
    }

    const items = [
      { label: 'Početna', href: '/' },
      ...slugParts.slice(0, -1).map((part, i) => ({
        label: humanizeSlug(part),
        href: `/product-category/${slugParts.slice(0, i + 1).join('/')}`,
      })),
      { label: deepestName },
    ];
    breadcrumbJsonLd = buildBreadcrumbJsonLd(items);
  }

  return (
    <>
      {breadcrumbJsonLd && <script {...jsonLdScriptProps(breadcrumbJsonLd)} />}
      <ProductCategoryRoute initialListing={initialListing ?? undefined} />
    </>
  );
}
