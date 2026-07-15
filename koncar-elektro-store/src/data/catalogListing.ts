import { alatiSubcategories, getCategoryHubHeroDescription, getCategoryHubSectionTitle } from '@/data/categoryPages';
import { getProductsByCategorySlug, getSaleCatalogProducts, koncarProducts, type KoncarCatalogProduct } from '@/data/koncarProducts';
import { otherProgramCategories } from '@/data/navigation';
import {
  findMenuCategoryByParentSlug,
  getMegaMenuSubcategoryUrl,
  getProductCategoryUrl,
  getProductListingUrl,
  getTopCategoryUrl,
  slugify,
} from '@/lib/catalogUrls';
import { PROGRAM_SLUGS } from '@/lib/wcSlugs';
import { parentSlugToCatalogPrefix } from '@/lib/parentCatalogSlugs';
import catAku from '@/assets/aku-alat.png';
import catElektricni from '@/assets/elektricni-alat.png';

import type { Product } from '@/data/homepage';

export type CatalogProduct = KoncarCatalogProduct & {
  bestseller?: boolean;
  subtitle?: string;
};

/** Minimal shape for product cards (mock + live API). */
export type CatalogProductCardProduct = Product & {
  bestseller?: boolean;
  subtitle?: string;
  categorySlug?: string;
  slug?: string;
  permalink?: string;
  sku?: string;
  inStock?: boolean;
  specs?: string[];
};

export type FilterGroup = {
  id: string;
  label: string;
  type: 'checkbox' | 'radio' | 'range';
  options?: { label: string; count?: number }[];
};

export type ListingChip = {
  slug: string;
  label: string;
  count: number;
  image?: string;
  featured?: boolean;
  href?: string;
};

export type ProductListingData = {
  slug: string;
  parentSlug: string;
  categorySlug: string;
  title: string;
  description: string;
  breadcrumbs: { label: string; href?: string }[];
  chips: ListingChip[];
  filters: FilterGroup[];
  products: CatalogProduct[];
  whyBuy: string[];
  faq: { question: string; answer: string }[];
};

export type ParentListingData = {
  parentSlug: string;
  categorySlug: string;
  title: string;
  sectionTitle: string;
  description: string;
  breadcrumbs: { label: string; href?: string }[];
  chips: (ListingChip & { href: string })[];
};

const listingSources = [
  ...getProductsByCategorySlug('elektricni-alat/busilice'),
  ...getProductsByCategorySlug('akumulatorski-alat/akumulatorske-busilice-odvijaci'),
  ...koncarProducts.filter((p) => /bušil|busil|odvija/i.test(`${p.name} ${p.category}`)),
];

const catalogProducts: CatalogProduct[] = listingSources
  .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
  .slice(0, 16)
  .map((p, i) => ({ ...p, bestseller: i < 2 }));

export const busiliceListing: ProductListingData = {
  slug: 'busilice-i-odvijaci',
  parentSlug: 'elektricni-alat',
  categorySlug: 'alati',
  title: 'BUŠILICE I ODVIJAČI',
  description:
    'Aku i električne bušilice, odvijači i udarni alati za profesionalnu upotrebu i kućne majstore. U ponudi INGCO, Makita, Metabo, Bosch i drugi vodeći brendovi.',
  breadcrumbs: [
    { label: 'Početna', href: '/' },
    { label: 'Alati', href: getTopCategoryUrl('alati') },
    { label: 'Električni alat', href: getProductCategoryUrl('elektricni-alat') },
    { label: 'Bušilice i odvijači' },
  ],
  chips: [
    { slug: 'najprodavaniji', label: 'Najprodavaniji proizvodi', count: 24, featured: true, href: getProductListingUrl('alati', 'elektricni-alat', 'busilice-i-odvijaci') },
    { slug: 'aku-busilice', label: 'Aku bušilice', count: 132, image: catAku, href: getProductListingUrl('alati', 'elektricni-alat', 'aku-busilice') },
    { slug: 'udarne-busilice', label: 'Udarna bušilica', count: 78, image: catElektricni, href: getProductListingUrl('alati', 'elektricni-alat', 'udarne-busilice') },
    { slug: 'elektricni-odvijaci', label: 'Električni odvijači', count: 64, image: catElektricni, href: getProductListingUrl('alati', 'elektricni-alat', 'elektricni-odvijaci') },
  ],
  filters: [
    {
      id: 'brand',
      label: 'Brend',
      type: 'checkbox',
      options: [
        { label: 'INGCO', count: 48 },
        { label: 'Makita', count: 36 },
        { label: 'Bosch', count: 28 },
        { label: 'Metabo', count: 22 },
        { label: 'Einhell', count: 19 },
        { label: 'Hyundai', count: 12 },
      ],
    },
    {
      id: 'price',
      label: 'Cena',
      type: 'radio',
      options: [
        { label: 'Do 5.000 RSD' },
        { label: '5.000 – 15.000 RSD' },
        { label: '15.000 – 30.000 RSD' },
        { label: 'Preko 30.000 RSD' },
      ],
    },
    {
      id: 'voltage',
      label: 'Napon',
      type: 'checkbox',
      options: [
        { label: '12V', count: 24 },
        { label: '18V', count: 89 },
        { label: '20V', count: 45 },
        { label: '220V', count: 67 },
      ],
    },
    {
      id: 'type',
      label: 'Tip alata',
      type: 'checkbox',
      options: [
        { label: 'Aku bušilica', count: 132 },
        { label: 'Udarna bušilica', count: 78 },
        { label: 'Odvijač', count: 64 },
        { label: 'Bušač-čekić', count: 41 },
      ],
    },
  ],
  products: catalogProducts,
  whyBuy: [
    'Širok izbor aku i električnih bušilica',
    'Garancija i ovlašćeni servis',
    'Brza isporuka na adresu',
    'Stručna pomoć pri izboru modela',
  ],
  faq: [
    { question: 'Koja bušilica je najbolja za kućnu upotrebu?', answer: 'Za kućnu upotrebu preporučujemo aku bušilicu 18V sa dva akumulatora.' },
    { question: 'Da li prodajete alat bez akumulatora?', answer: 'Da, mnogi modeli su dostupni u Solo verziji bez baterije.' },
    { question: 'Kako da izaberem snagu alata?', answer: 'Za lake radove dovoljna je bušilica do 18V, za teže poslove birajte udarnu bušilicu.' },
  ],
};

const defaultProducts = (): CatalogProduct[] => catalogProducts;

const buildListing = (
  categorySlug: string,
  parentSlug: string,
  slug: string,
  title: string,
  parentLabel: string,
): ProductListingData => ({
  ...busiliceListing,
  slug,
  parentSlug,
  categorySlug,
  title: title.toUpperCase(),
  breadcrumbs: [
    { label: 'Početna', href: '/' },
    { label: 'Alati', href: getTopCategoryUrl('alati') },
    { label: parentLabel, href: getProductCategoryUrl(parentSlug) },
    { label: title },
  ],
  products: defaultProducts(),
});

export const getParentListing = (
  categorySlug: string,
  parentSlug: string,
): ParentListingData | undefined => {
  if (categorySlug !== 'alati') return undefined;

  const menuCategory = findMenuCategoryByParentSlug(parentSlug);
  const alatiItem = alatiSubcategories.find((s) => s.slug === parentSlug);
  const title = menuCategory?.label ?? alatiItem?.name ?? parentSlug;
  const description =
    getCategoryHubHeroDescription(parentSlug, title) ??
    `Pregledajte ponudu u kategoriji ${title.toLowerCase()}.`;

  const chips: ParentListingData['chips'] = menuCategory
    ? menuCategory.subcategories.map((sub, i) => ({
        // Prefer an explicit WC slug override (e.g. when the real WC term slug has a typo
        // that doesn't match a naive slugify of the display label) over guessing from the label.
        slug: sub.slug ?? slugify(sub.label),
        label: sub.label,
        count: sub.count,
        image: sub.image,
        featured: i === 0,
        href: sub.slug
          ? getMegaMenuSubcategoryUrl(menuCategory.id, sub.slug, { wcSlug: true })
          : getMegaMenuSubcategoryUrl(menuCategory.id, sub.label),
      }))
    : [
        {
          slug: 'svi-proizvodi',
          label: 'Svi proizvodi',
          count: alatiItem?.productCount ?? 0,
          featured: true,
          href: getProductListingUrl(categorySlug, parentSlug, 'svi-proizvodi'),
        },
      ];

  return {
    parentSlug,
    categorySlug,
    title: title.toUpperCase(),
    sectionTitle: getCategoryHubSectionTitle(parentSlug, title),
    description,
    breadcrumbs: [
      { label: 'Početna', href: '/' },
      { label: 'Alati', href: getTopCategoryUrl('alati') },
      { label: title },
    ],
    chips,
  };
};

export const getProgramListing = (
  programSlug: string,
  listingSlug: string,
): ProductListingData | undefined => {
  const program = otherProgramCategories.find((c) => c.id === programSlug);
  if (!program) return undefined;

  const sub = program.subcategories.find((s) => slugify(s.label) === listingSlug);
  const title = sub?.label ?? listingSlug.replace(/-/g, ' ');

  return {
    ...busiliceListing,
    slug: listingSlug,
    parentSlug: programSlug,
    categorySlug: programSlug,
    title: title.toUpperCase(),
    description: `Ponuda proizvoda iz kategorije ${title.toLowerCase()}.`,
    breadcrumbs: [
      { label: 'Početna', href: '/' },
      { label: program.label, href: getTopCategoryUrl(programSlug) },
      { label: title },
    ],
    products: defaultProducts(),
  };
};

export const getProductListing = (
  categorySlug: string,
  parentSlug: string,
  slug?: string,
) => {
  if (!slug) return undefined;

  const programListing = getProgramListing(categorySlug, slug);
  if (programListing && PROGRAM_SLUGS.has(categorySlug)) {
    return programListing;
  }

  if (categorySlug === 'alati' && slug === 'busilice-i-odvijaci') {
    return busiliceListing;
  }

  const menuCategory = findMenuCategoryByParentSlug(parentSlug);
  const parentLabel =
    menuCategory?.label ??
    alatiSubcategories.find((s) => s.slug === parentSlug)?.name ??
    parentSlug;

  const leafSlug = slug.split('/').filter(Boolean).pop() ?? slug;
  const subLabel =
    menuCategory?.subcategories.find((s) => slugify(s.label) === leafSlug)?.label ??
    leafSlug.replace(/-/g, ' ');

  return buildListing(categorySlug, parentSlug, slug, subLabel, parentLabel);
};

export const getParentHubBestSellers = (parentSlug: string): CatalogProduct[] => {
  const prefix = parentSlugToCatalogPrefix[parentSlug] ?? parentSlug;
  const matches = getProductsByCategorySlug(prefix);
  const pool = matches.length > 0 ? matches : koncarProducts;
  return pool
    .slice()
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 8)
    .map((p, i) => ({ ...p, bestseller: i < 2 }));
};

export const saleListing = {
  title: 'AKCIJA',
  description:
    'Proizvodi sa najvećim popustima u ponudi — sortirano po uštedi. Ograničene količine, iskoristite akcijske cene dok traju.',
  breadcrumbs: [
    { label: 'Početna', href: '/' },
    { label: 'Akcija' },
  ],
  products: getSaleCatalogProducts().map((p) => ({ ...p })) as CatalogProduct[],
  whyBuy: [
    'Najveći popusti na proverene brendove',
    'Ista garancija kao za redovnu cenu',
    'Brza isporuka na adresu',
    'Akcija važi dok traju zalihe',
  ],
  faq: [
    { question: 'Da li akcijski proizvodi imaju garanciju?', answer: 'Da, svi proizvodi na akciji imaju punu fabričku garanciju.' },
    { question: 'Koliko dugo važi akcijska cena?', answer: 'Akcijske cene važe do isteka zaliha ili do kraja promotivnog perioda.' },
    { question: 'Mogu li da kombinujem akciju sa drugim popustima?', answer: 'Akcijska cena je konačna i ne kombinuje se sa dodatnim kodovima.' },
  ],
};
