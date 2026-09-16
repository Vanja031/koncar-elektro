import breadcrumbsHero from '@/assets/breadcrumbs.webp';
import catElektricni from '@/assets/elektricni-alat.webp';
import catAku from '@/assets/aku-alat.webp';
import catRucni from '@/assets/rucni-alat.webp';
import catKompresor from '@/assets/kompresor.webp';
import catAgregat from '@/assets/agregat.webp';
import catKosacica from '@/assets/kosacica.webp';
import catHtz from '@/assets/htz-oprema.webp';
import catTraktor from '@/assets/traktor.webp';
import catVarenje from '@/assets/aparat-za-varenje.webp';
import catDvorishte from '@/assets/oprema-za-dvoriste.webp';
import imgElektromaterijal from '@/assets/elektromaterijal.webp';
import imgRasveta from '@/assets/rasveta.webp';
import imgSolarne from '@/assets/solarne.webp';
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
      'Profesionalni alati i oprema za radionicu, gradilište i dom. Provereni brendovi, garancija i brza dostava širom Srbije.',
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
    'Elektromaterijal za instalacije: kablovi, prekidači, osigurači i razvodna oprema. Sve za stručni i kućni rad.',
    'Kompletna ponuda elektromaterijala za profesionalne i kućne instalacije — kablovi, osigurači, prekidači, razvodne table i prateća oprema.',
    imgElektromaterijal,
  ),
  rasveta: programPage(
    'rasveta',
    'RASVETA',
    'LED i klasična rasveta za enterijer, eksterijer i industriju. Sijalice, paneli, reflektori i trake.',
    'LED sijalice, paneli, reflektori, lusteri i industrijska rasveta — sve na jednom mestu uz stručnu podršku.',
    imgRasveta,
  ),
  solarne: programPage(
    'solarne',
    'SOLARNE ELEKTRANE',
    'Oprema za solarne elektrane — paneli, inverteri i kompleti. Ušteda energije za domaćinstva i objekte.',
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

/** Short copy under the hub hero title (fallback if WC description missing). */
const categoryHubHeroDescriptions: Record<string, string> = {
  'elektricni-alat':
    'Električni alati za radionicu i teren — bušilice, brusilice, testere i više. Provereni brendovi, garancija i brza dostava.',
  'aku-alat':
    'Akumulatorski alati za rad bez kabla: bušilice, odvijači, testere i setovi. Veliki izbor na stanju uz stručnu podršku.',
  'rucni-alat':
    'Ručni alati i pribor za precizan rad — ključevi, klešta, odvijači i organizacija alata. Kvalitet za majstore i hobi.',
  'aparati-za-varenje':
    'Aparati za varenje, elektrode i oprema za MIG, TIG i MMA. Rešenja za radionicu, montažu i terenski rad.',
  'htz-oprema':
    'HTZ oprema i lična zaštita na radu — kacige, rukavice, naočare i radna odeća. Bezbednost prema propisima.',
  kompresori:
    'Kompresori i pneumatski alati za farbanje, duvanje i radionicu. Uljni i bezuljni modeli različitih snaga.',
  agregati:
    'Benzinski, dizel i inverterski agregati za pouzdano napajanje kod kuće, na gradilištu i u privredi.',
  'kosacice-i-trimeri':
    'Kosačice, trimeri i baštenski alati za uređen travnjak i dvorište. Benzinski, električni i aku modeli.',
  'poljoprivredni-program':
    'Poljoprivredni alati i oprema za obradu zemlje, košenje i održavanje. Pouzdana rešenja za farmu i okućnicu.',
  'oprema-za-dvoriste':
    'Oprema za dvorište i baštu — zalivanje, čišćenje i održavanje zelenih površina. Praktična rešenja na stanju.',
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
