import breadcrumbsHero from '@/assets/breadcrumbs.png';
import catElektricni from '@/assets/elektricni-alat.png';
import catAku from '@/assets/aku-alat.png';
import catRucni from '@/assets/rucni-alat.png';
import catKompresor from '@/assets/kompresor.png';
import catAgregat from '@/assets/agregat.webp';
import catKosacica from '@/assets/kosacica.png';
import catHtz from '@/assets/htz-oprema.jpg';
import catTraktor from '@/assets/traktor.png';
import catVarenje from '@/assets/aparat-za-varenje.webp';
import catDvorishte from '@/assets/oprema-za-dvoriste.jpg';
import { bestSellerProducts } from '@/data/homepage';

export type BreadcrumbItem = { label: string; href?: string };

export type SubcategoryItem = {
  slug: string;
  name: string;
  image: string;
  productCount: number;
};

export type CategoryPageData = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  heroImage: string;
  breadcrumbs: BreadcrumbItem[];
  subcategories: SubcategoryItem[];
  bestSellers: typeof bestSellerProducts;
  whyBuy: string[];
  faq: { question: string; answer: string }[];
};

const slugify = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

export const alatiSubcategories: SubcategoryItem[] = [
  { name: 'Električni alat', image: catElektricni, slug: 'elektricni-alat', productCount: 312 },
  { name: 'Aku alat', image: catAku, slug: 'aku-alat', productCount: 245 },
  { name: 'Ručni alat', image: catRucni, slug: 'rucni-alat', productCount: 480 },
  { name: 'Aparati za varenje', image: catVarenje, slug: 'aparati-za-varenje', productCount: 87 },
  { name: 'Kompresori', image: catKompresor, slug: 'kompresori', productCount: 64 },
  { name: 'Agregati', image: catAgregat, slug: 'agregati', productCount: 42 },
  { name: 'Kosačice i trimeri', image: catKosacica, slug: 'kosacice-i-trimeri', productCount: 92 },
  { name: 'HTZ oprema', image: catHtz, slug: 'htz-oprema', productCount: 73 },
  { name: 'Poljoprivredni program', image: catTraktor, slug: 'poljoprivredni-program', productCount: 138 },
  { name: 'Oprema za dvorište', image: catDvorishte, slug: 'oprema-za-dvoriste', productCount: 156 },
];

export const categoryPages: Record<string, CategoryPageData> = {
  alati: {
    slug: 'alati',
    title: 'ALATI',
    subtitle: 'Profesionalni alati i oprema za svaki zadatak',
    description:
      'U ponudi imamo električne i akumulatorske alate, ručni alat, kompresore, agregate i opremu za radionicu, baštu i poljoprivredu. Birajte proverene brendove uz stručnu podršku.',
    heroImage: breadcrumbsHero,
    breadcrumbs: [
      { label: 'Početna', href: '/' },
      { label: 'Alati' },
    ],
    subcategories: alatiSubcategories,
    bestSellers: bestSellerProducts,
    whyBuy: [
      'Preko 10.000 proizvoda na stanju',
      'Brza isporuka na teritoriji Srbije',
      'Ovlašćeni servis i garancija',
      'Stručna podrška pri izboru alata',
    ],
    faq: [
      { question: 'Kako da izaberem pravi alat?', answer: 'Naš tim vam pomaže pri izboru prema nameni i budžetu.' },
      { question: 'Da li nudite servis alata?', answer: 'Da, ovlašćeni servis za sve brendove iz ponude.' },
      { question: 'Koliko traje isporuka alata?', answer: 'Isporuka je u roku od 1–2 radna dana.' },
    ],
  },
};

export const getCategoryPage = (slug: string) => categoryPages[slug];

export const getSubcategorySlug = slugify;
