import { getSearchUrl } from '@/lib/catalogUrls';

export type HighlightChip = {
  slug: string;
  label: string;
  count?: number;
  image?: string;
  featured?: boolean;
  isSale?: boolean;
  href?: string;
};

type ChipInput = {
  slug: string;
  label: string;
  count?: number;
  image?: string;
  href?: string;
};

/** Akcija + top 3 podkategorije po broju proizvoda (max 4 kartice). */
export function buildListingHighlightChips(
  siblings: ChipInput[],
  parentWcSlug: string,
  saleCount?: number,
): HighlightChip[] {
  const topByCount = [...siblings]
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
    .slice(0, 3);

  const saleChip: HighlightChip = {
    slug: 'akcija',
    label: 'Akcija',
    count: saleCount,
    featured: true,
    isSale: true,
    href: getSearchUrl({ category: parentWcSlug, onSale: true }),
  };

  return [saleChip, ...topByCount];
}
