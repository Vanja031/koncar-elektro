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
import imgElektromaterijal from '@/assets/elektromaterijal.png';
import imgRasveta from '@/assets/rasveta.png';
import imgSolarne from '@/assets/solarne.png';
import { bestSellerProducts } from '@/data/homepage';
import { otherProgramCategories } from '@/data/navigation';
import { slugify } from '@/lib/slugify';

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

const programSubcategories = (programId: string) => {
  const program = otherProgramCategories.find((c) => c.id === programId);
  if (!program) return [];
  return program.subcategories.map((sub) => ({
    slug: slugify(sub.label),
    name: sub.label,
    image: sub.image,
    productCount: sub.count,
  }));
};

const programPage = (
  slug: string,
  title: string,
  subtitle: string,
  description: string,
  heroImage: string,
): CategoryPageData => ({
  slug,
  title,
  subtitle,
  description,
  heroImage,
  breadcrumbs: [
    { label: 'Početna', href: '/' },
    { label: title },
  ],
  subcategories: programSubcategories(slug),
  bestSellers: bestSellerProducts,
  whyBuy: [
    'Širok asortiman proverenih brendova',
    'Brza isporuka na teritoriji Srbije',
    'Stručna podrška pri izboru',
    'Garancija na sve proizvode',
  ],
  faq: [
    { question: 'Kako da izaberem pravi proizvod?', answer: 'Naš tim vam pomaže pri izboru prema nameni i budžetu.' },
    { question: 'Koliko traje isporuka?', answer: 'Isporuka je u roku od 1–2 radna dana.' },
    { question: 'Da li nudite garanciju?', answer: 'Da, svi proizvodi imaju fabričku garanciju.' },
  ],
});

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
  elektromaterijal: programPage(
    'elektromaterijal',
    'ELEKTROMATERIJAL',
    'Kablovi, prekidači, osigurači i oprema za instalacije',
    'Kompletna ponuda elektromaterijala za profesionalne i kućne instalacije — kablovi, osigurači, prekidači, razvodne table i prateća oprema.',
    imgElektromaterijal,
  ),
  rasveta: programPage(
    'rasveta',
    'RASVETA',
    'Unutrašnja i spoljašnja rasveta za svaki prostor',
    'LED sijalice, paneli, reflektori, lusteri i industrijska rasveta — sve na jednom mestu uz stručnu podršku.',
    imgRasveta,
  ),
  solarne: programPage(
    'solarne',
    'SOLARNE ELEKTRANE',
    'Kompletna oprema za solarnu energiju',
    'Solarni paneli, inverteri, baterije i kompleti za domaćinstva i privredu — ušteda energije i novca.',
    imgSolarne,
  ),
};

export const getCategoryPage = (slug: string) => categoryPages[slug];

export { slugify as getSubcategorySlug } from '@/lib/slugify';
