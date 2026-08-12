import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBrandFilterOptions } from '@/lib/listingFilters';
import { metadataForManufacturer } from '@/lib/seo/metadata';
import ManufacturerPage from '@/views/ManufacturerPage';

type Props = { params: { slug: string; page: string } };

const titleCaseLabel = (label: string) =>
  /^[A-ZŠĐČĆŽ0-9 .-]+$/.test(label)
    ? label
        .toLowerCase()
        .split(' ')
        .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
        .join(' ')
    : label;

function humanizeBrandSlug(slug: string): string {
  return slug
    .split('-')
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function resolveBrand(slug: string) {
  const known = getBrandFilterOptions().find((o) => o.slug === slug);
  if (known) return known;
  return { label: humanizeBrandSlug(slug), slug };
}

export function generateMetadata({ params }: Props): Metadata {
  const brand = resolveBrand(params.slug);
  const name = titleCaseLabel(brand.label);
  const pageNum = Number(params.page);  const pathname =
    pageNum > 1
      ? `/proizvodjac/${params.slug}/page/${pageNum}/`
      : `/proizvodjac/${params.slug}/`;
  return metadataForManufacturer(pathname, name);
}

export default function ProizvodjacPaginatedRoute({ params }: Props) {
  const brand = resolveBrand(params.slug);
  const pageNum = Number(params.page);
  if (!Number.isFinite(pageNum) || pageNum < 2) {
    notFound();
  }

  return (
    <ManufacturerPage
      brandSlug={params.slug}
      brandName={titleCaseLabel(brand.label)}
      initialPage={pageNum}
    />
  );
}
