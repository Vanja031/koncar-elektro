import { koncarProducts, type KoncarCatalogProduct } from '@/data/koncarProducts';
import type { BreadcrumbItem } from '@/data/categoryPages';
import { getProdavnicaUrl, getTopCategoryUrl } from '@/lib/catalogUrls';

export type ProductSpec = {
  label: string;
  value: string;
};

export type ProductReview = {
  id: number;
  author: string;
  rating: number;
  date: string;
  text: string;
  verified?: boolean;
};

export type ProductDeclarationRow = {
  label: string;
  value: string;
};

export type ProductDetail = KoncarCatalogProduct & {
  slug: string;
  gallery: string[];
  longDescription: string;
  features: string[];
  specifications: ProductSpec[];
  declaration: ProductDeclarationRow[];
  reviewsList: ProductReview[];
  relatedIds: number[];
  breadcrumbs: BreadcrumbItem[];
  deliveryDays: string;
  warrantyMonths: number;
  saleStart?: string;
  saleEnd?: string;
};

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/š/g, 's')
    .replace(/č/g, 'c')
    .replace(/ć/g, 'c')
    .replace(/ž/g, 'z')
    .replace(/đ/g, 'dj')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const galleryExtras = [
  'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=800&fit=crop',
];

const assignSlugs = (products: KoncarCatalogProduct[]): Map<number, string> => {
  const baseCount = new Map<string, number>();
  for (const p of products) {
    const base = slugify(p.name);
    baseCount.set(base, (baseCount.get(base) ?? 0) + 1);
  }
  const slugById = new Map<number, string>();
  for (const p of products) {
    const base = slugify(p.name);
    slugById.set(p.id, (baseCount.get(base) ?? 0) > 1 ? `${base}-${p.id}` : base);
  }
  return slugById;
};

const slugById = assignSlugs(koncarProducts);

const buildFeatures = (product: KoncarCatalogProduct): string[] => [
  `${product.brand} kvalitet i pouzdanost`,
  product.description,
  ...product.specs.map((s) => `Specifikacija: ${s}`),
  'Garancija i ovlašćeni servis u Srbiji',
].slice(0, 8);

const buildSpecifications = (product: KoncarCatalogProduct): ProductSpec[] => [
  { label: 'Brend', value: product.brand },
  { label: 'Šifra', value: product.sku || `KE-${product.id}` },
  { label: 'Kategorija', value: product.category },
  { label: 'Garancija', value: product.price > 50000 ? '36 meseci' : '24 meseca' },
  ...product.specs.map((s, i) => ({ label: i === 0 ? 'Ključna specifikacija' : 'Specifikacija', value: s })),
];

const ORIGIN_BY_BRAND: Record<string, string> = {
  MAKITA: 'Japan',
  BOSCH: 'Nemačka',
  METABO: 'Nemačka',
  EINHELL: 'Nemačka',
  HYUNDAI: 'Južna Koreja',
  Scheppach: 'Nemačka',
  Villager: 'Srbija',
};

const buildManufacturer = (product: KoncarCatalogProduct): string => {
  if (product.brand === 'INGCO' && product.name.toUpperCase().includes('SUPER INGCO')) {
    return 'INGCO – SUPER INGCO';
  }
  return product.brand;
};

const buildDeclaration = (product: KoncarCatalogProduct): ProductDeclarationRow[] => [
  { label: 'Proizvodjač', value: buildManufacturer(product) },
  { label: 'Uvoznik', value: 'NA DEKLARACIJI PROIZVODA' },
  {
    label: 'Zemlja porekla',
    value: ORIGIN_BY_BRAND[product.brand] ?? 'Kina',
  },
];

const buildReviews = (product: KoncarCatalogProduct): ProductReview[] => {
  const shortName = product.name.length > 48 ? `${product.name.slice(0, 45)}…` : product.name;
  const ratings = [5, 5, 5, 4, 5, 4, 5, 5, 4, 5, 3, 5];
  const templates: Omit<ProductReview, 'id'>[] = [
    {
      author: 'Marko P.',
      rating: product.rating,
      date: '15.03.2025.',
      text: `${shortName} ispunio očekivanja — kvalitetan proizvod za svakodnevni rad. Preporučujem.`,
      verified: true,
    },
    {
      author: 'Stefan M.',
      rating: Math.max(4, product.rating - 1),
      date: '02.02.2025.',
      text: 'Brza isporuka od Končar Elektro, proizvod stigao fabrički zapakovan. Sve kako treba.',
      verified: true,
    },
    {
      author: 'Nikola D.',
      rating: 5,
      date: '28.01.2025.',
      text: `Kupio sam ${product.brand} preko ovog sajta. Odličan odnos cene i kvaliteta, koristim svakodnevno u radionici.`,
      verified: true,
    },
    {
      author: 'Jelena K.',
      rating: 4,
      date: '12.12.2024.',
      text: 'Zadovoljna kupovinom. Jedina zamerka je što u pakovanju nije bilo dodatnog pribora, ali sam to znala unapred.',
      verified: true,
    },
    {
      author: 'Ivan R.',
      rating: 5,
      date: '03.11.2024.',
      text: 'Profesionalna usluga i stručna preporuka telefonom. Proizvod tačno onakav kakav je opisan na sajtu.',
      verified: true,
    },
    {
      author: 'Miloš V.',
      rating: 5,
      date: '19.10.2024.',
      text: `${product.category} koji sam tražio — pouzdan, robustan i spreman za težak posao. Ponovo bih kupio.`,
      verified: true,
    },
    {
      author: 'Ana S.',
      rating: 4,
      date: '05.09.2024.',
      text: 'Dostava sutradan, plaćanje pouzećem bez problema. Proizvod radi odlično nakon mesec dana korišćenja.',
      verified: true,
    },
    {
      author: 'Dejan T.',
      rating: 5,
      date: '22.08.2024.',
      text: 'Kupujem alat kod Končar Elektro već godinama. Uvek originalni proizvodi i garancija uz račun.',
      verified: true,
    },
    {
      author: 'Petar J.',
      rating: 4,
      date: '14.07.2024.',
      text: 'Solidan alat za kućnu upotrebu. Uputstvo na srpskom, lako za savladavanje. Zadovoljan sam.',
      verified: false,
    },
    {
      author: 'Maja L.',
      rating: 5,
      date: '30.06.2024.',
      text: `Odličan ${product.brand} model — tišći i snažniji nego što sam očekivala. Topla preporuka.`,
      verified: true,
    },
    {
      author: 'Goran N.',
      rating: 3,
      date: '08.05.2024.',
      text: 'Proizvod je dobar, ali pakovanje je bilo oštećeno u transportu. Zamenili su brzo, bez dodatnih troškova.',
      verified: true,
    },
    {
      author: 'Tamara B.',
      rating: 5,
      date: '17.04.2024.',
      text: 'Kupovina za firmu — izdat fiskalni račun, isporuka u roku. Proizvod na nivou očekivanja.',
      verified: true,
    },
  ];

  return templates.map((review, index) => ({
    ...review,
    id: index + 1,
    rating: ratings[index] ?? product.rating,
  }));
};

const buildRelatedIds = (product: KoncarCatalogProduct): number[] =>
  koncarProducts
    .filter((p) => p.id !== product.id && (p.brand === product.brand || p.categorySlug === product.categorySlug))
    .slice(0, 6)
    .map((p) => p.id);

const categoryBreadcrumb = (slug: string): BreadcrumbItem[] => {
  if (slug.startsWith('rasveta')) {
    return [
      { label: 'Početna', href: '/' },
      { label: 'Rasveta', href: getTopCategoryUrl('rasveta') },
    ];
  }
  if (slug.startsWith('elektromaterijal')) {
    return [
      { label: 'Početna', href: '/' },
      { label: 'Elektromaterijal', href: getTopCategoryUrl('elektromaterijal') },
    ];
  }
  return [
    { label: 'Početna', href: '/' },
    { label: 'Alati', href: getTopCategoryUrl('alati') },
  ];
};

const buildProductDetail = (product: KoncarCatalogProduct): ProductDetail => {
  const slug = slugById.get(product.id) ?? slugify(product.name);
  const gallery = [product.image, ...galleryExtras.filter((img) => img !== product.image)].slice(0, 4);

  return {
    ...product,
    slug,
    gallery,
    longDescription: `${product.name} je ${product.category.toLowerCase()} brenda ${product.brand}. ${product.description} Proizvod je dostupan u Končar Elektro ponudi sa garancijom, fiskalnim računom i stručnom podrškom.`,
    features: buildFeatures(product),
    specifications: buildSpecifications(product),
    declaration: buildDeclaration(product),
    reviewsList: buildReviews(product),
    relatedIds: buildRelatedIds(product),
    breadcrumbs: [
      ...categoryBreadcrumb(product.categorySlug),
      { label: product.category },
      { label: product.name },
    ],
    deliveryDays: product.inStock ? '1–2 radna dana' : '3–5 radnih dana',
    warrantyMonths: product.price > 50000 ? 36 : 24,
    ...(product.oldPrice && product.oldPrice > product.price
      ? { saleStart: '01.07.2026.', saleEnd: '31.07.2026.' }
      : {}),
  };
};

const productDetails: ProductDetail[] = koncarProducts.map(buildProductDetail);
const productBySlug = new Map(productDetails.map((p) => [p.slug, p]));
const productById = new Map(productDetails.map((p) => [p.id, p]));

export const getProductBySlug = (slug: string): ProductDetail | undefined => productBySlug.get(slug);

export const getProductById = (id: number): ProductDetail | undefined => productById.get(id);

export const getProductUrl = (id: number): string => {
  const product = productById.get(id);
  return product ? getProdavnicaUrl(product.categorySlug, product.slug) : '#';
};

export const getRelatedProducts = (product: ProductDetail): ProductDetail[] =>
  product.relatedIds.map((id) => productById.get(id)).filter((p): p is ProductDetail => p != null);

export const getCompatibleProducts = (product: ProductDetail): ProductDetail[] =>
  getRelatedProducts(product).slice(0, 6);

export const productFaq = [
  {
    question: 'Da li je proizvod nov i sa garancijom?',
    answer: 'Svi proizvodi su potpuno novi, fabrički zapakovani, sa garancijom i fiskalnim računom.',
  },
  {
    question: 'Koliko traje isporuka ovog proizvoda?',
    answer: 'Za proizvode na stanju isporuka je u roku od 1–2 radna dana na teritoriji Srbije.',
  },
  {
    question: 'Da li mogu da platim pouzećem?',
    answer: 'Da, pouzeće je dostupno. Takođe prihvatamo platne kartice i virman.',
  },
  {
    question: 'Šta ako proizvod ne odgovara?',
    answer: 'Imate pravo na povrat u roku od 14 dana u skladu sa Zakonom o zaštiti potrošača.',
  },
  {
    question: 'Da li mogu da preuzmem proizvod lično?',
    answer: 'Da, lično preuzimanje je moguće u našoj prodavnici nakon potvrde narudžbine.',
  },
  {
    question: 'Kako funkcioniše garancija na proizvod?',
    answer: 'Garancija važi uz fiskalni račun. Za reklamaciju kontaktirajte nas telefonom ili putem forme na sajtu.',
  },
];

export const allProductDetails = productDetails;
