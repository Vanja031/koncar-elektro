import breadcrumbsHero from '@/assets/breadcrumbs.png';
import catElektricni from '@/assets/elektricni-alat.png';
import catAku from '@/assets/aku-alat.png';
import catRucni from '@/assets/rucni-alat.png';
import catKompresor from '@/assets/kompresor.png';
import catAgregat from '@/assets/agregat.webp';
import catKosacica from '@/assets/kosacica.png';
import catHtz from '@/assets/htz-oprema.png';
import catTraktor from '@/assets/traktor.png';
import catVarenje from '@/assets/aparat-za-varenje.png';
import catDvorishte from '@/assets/oprema-za-dvoriste.png';
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
  /** WooCommerce parent slug — for live product thumbnail fetch */
  wcSlug?: string;
  /** Explicit listing URL (leaf categories carry their full WC path). */
  href?: string;
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
    subtitle:
      'Profesionalni alati i oprema za svaki zadatak. Izaberite kategoriju i pronađite idealan alat za vaše potrebe.',
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
    'Kablovi, prekidači, osigurači i oprema za instalacije. Izaberite kategoriju i pronađite što vam treba.',
    'Kompletna ponuda elektromaterijala za profesionalne i kućne instalacije — kablovi, osigurači, prekidači, razvodne table i prateća oprema.',
    imgElektromaterijal,
  ),
  rasveta: programPage(
    'rasveta',
    'RASVETA',
    'Unutrašnja i spoljašnja rasveta za svaki prostor. Izaberite kategoriju i pronađite pravo rešenje.',
    'LED sijalice, paneli, reflektori, lusteri i industrijska rasveta — sve na jednom mestu uz stručnu podršku.',
    imgRasveta,
  ),
  solarne: programPage(
    'solarne',
    'SOLARNE ELEKTRANE',
    'Kompletna oprema za solarnu energiju. Izaberite kategoriju i pronađite rešenje za vaše potrebe.',
    'Solarni paneli, inverteri, baterije i kompleti za domaćinstva i privredu — ušteda energije i novca.',
    imgSolarne,
  ),
};

export const getCategoryPage = (slug: string) => categoryPages[slug];

/**
 * Section heading under the category hero (subcategory / chip grid).
 * Keys: top-level program slugs + alati parent hub slugs.
 */
const categoryHubSectionTitles: Record<string, string> = {
  alati: 'Kategorije alata',
  'elektricni-alat': 'Kategorije električnih alata',
  'aku-alat': 'Kategorije aku alata',
  'rucni-alat': 'Kategorije ručnog alata',
  'aparati-za-varenje': 'Kategorije aparata za varenje',
  'htz-oprema': 'Kategorije HTZ opreme',
  elektromaterijal: 'Kategorije elektromaterijala',
  rasveta: 'Kategorije rasvete',
  solarne: 'Kategorije solarne opreme',
};

/** Short copy under the hub hero title. */
const categoryHubHeroDescriptions: Record<string, string> = {
  'elektricni-alat':
    'Profesionalni električni alati za svaki zadatak. Izaberite kategoriju i pronađite idealan alat za vaše potrebe.',
  'aku-alat':
    'Akumulatorski alati za rad bez kabla. Izaberite kategoriju i pronađite idealan alat za vaše potrebe.',
  'rucni-alat':
    'Ručni alati za precizan i pouzdan rad. Izaberite kategoriju i pronađite idealan alat za vaše potrebe.',
  'aparati-za-varenje':
    'Aparati i oprema za varenje za profesionalce i majstore. Izaberite kategoriju i pronađite pravo rešenje.',
  'htz-oprema':
    'HTZ oprema za bezbedan rad. Izaberite kategoriju i pronađite zaštitu koja vam treba.',
  kompresori:
    'Kompresori i pneumatska oprema za radionicu i teren. Izaberite kategoriju prema vašim potrebama.',
  agregati:
    'Agregati za pouzdano napajanje. Izaberite kategoriju koja odgovara vašim zahtevima.',
  'kosacice-i-trimeri':
    'Kosačice i trimeri za uređeno dvorište i teren. Izaberite kategoriju i pronađite pravi alat.',
  'poljoprivredni-program':
    'Poljoprivredna oprema za efikasan rad. Izaberite kategoriju i pronađite rešenje za vaše potrebe.',
  'oprema-za-dvoriste':
    'Oprema za dvorište i baštu. Izaberite kategoriju i pronađite idealan proizvod.',
};

export const getCategoryHubSectionTitle = (slug: string, fallbackLabel?: string) => {
  if (categoryHubSectionTitles[slug]) return categoryHubSectionTitles[slug];
  if (fallbackLabel) return `Kategorije — ${fallbackLabel}`;
  return 'Kategorije';
};

export const getCategoryHubHeroDescription = (slug: string, fallbackLabel?: string) => {
  if (categoryHubHeroDescriptions[slug]) return categoryHubHeroDescriptions[slug];
  if (fallbackLabel) {
    return `Pregledajte ponudu u kategoriji ${fallbackLabel.toLowerCase()}. Izaberite kategoriju koja vam odgovara.`;
  }
  return undefined;
};

export { slugify as getSubcategorySlug } from '@/lib/slugify';
