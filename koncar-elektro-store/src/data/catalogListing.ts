import { bestSellerProducts, type Product } from '@/data/homepage';
import catAku from '@/assets/aku-alat.png';
import catElektricni from '@/assets/elektricni-alat.png';

export type CatalogProduct = Product & {
  subtitle: string;
  specs: string[];
  inStock: boolean;
  bestseller?: boolean;
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

const catalogProducts: CatalogProduct[] = [
  ...bestSellerProducts.slice(0, 4).map((p, i) => ({
    ...p,
    subtitle: p.description,
    specs: ['18V', '55 Nm', '1.5 kg'],
    inStock: true,
    bestseller: i < 2,
  })),
  ...bestSellerProducts.map((p, i) => ({
    ...p,
    id: p.id + 100,
    subtitle: p.description,
    specs: i % 2 === 0 ? ['18V', '2.0 Ah'] : ['220V', '750W'],
    inStock: i !== 3,
    bestseller: false,
  })),
];

export const busiliceListing: ProductListingData = {
  slug: 'busilice-i-odvijaci',
  parentSlug: 'elektricni-alat',
  categorySlug: 'alati',
  title: 'BUŠILICE I ODVIJAČI',
  description:
    'Aku i električne bušilice, odvijači i udarni alati za profesionalnu upotrebu i kućne majstore. U ponudi Bosch, Makita, Metabo, Einhell i drugi vodeći brendovi.',
  breadcrumbs: [
    { label: 'Početna', href: '/' },
    { label: 'Alati', href: '/kategorija/alati' },
    { label: 'Električni alat', href: '/kategorija/alati/elektricni-alat' },
    { label: 'Bušilice i odvijači' },
  ],
  chips: [
    { slug: 'najprodavaniji', label: 'Najprodavaniji proizvodi', count: 24, featured: true },
    { slug: 'aku-busilice', label: 'Aku bušilice', count: 132, image: catAku },
    { slug: 'udarne-busilice', label: 'Udarna bušilice', count: 78, image: catElektricni },
    { slug: 'elektricni-odvijaci', label: 'Električni odvijači', count: 64, image: catElektricni },
  ],
  filters: [
    {
      id: 'brand',
      label: 'Brend',
      type: 'checkbox',
      options: [
        { label: 'Bosch', count: 48 },
        { label: 'Makita', count: 36 },
        { label: 'DeWalt', count: 28 },
        { label: 'Metabo', count: 22 },
        { label: 'Einhell', count: 19 },
        { label: 'Ingco', count: 31 },
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

export const getProductListing = (categorySlug: string, parentSlug: string, slug: string) => {
  if (categorySlug === 'alati' && slug === 'busilice-i-odvijaci') {
    return busiliceListing;
  }
  return busiliceListing;
};
