import { alatiSubcategories } from '@/data/categoryPages';
import { allMenuCategories } from '@/data/navigation';
import { slugify } from '@/lib/slugify';
import {
  programToWcSlug,
  toWcParentSlug,
} from '@/lib/wcSlugs';

export { slugify } from '@/lib/slugify';

export const ROUTES = {
  home: '/',
  shop: '/proizvodi',
  sale: '/akcija',
  bestsellers: '/najprodavanije',
  cart: '/korpa',
  checkout: '/placanje-odjava',
  checkoutThanks: '/placanje-odjava/order-received',
  about: '/o-nama',
  contact: '/kontakt',
  /** Nema zasebne FAQ stranice na starom sajtu — nova ruta za naš FAQ sadržaj. */
  faq: '/pitanja',
  login: '/prijava',
  register: '/registracija',
  productCategory: '/product-category',
  prodavnica: '/prodavnica',
  search: '/pretraga',
} as const;

/** Pretraga proizvoda — `q`, opciono `category` (WC slug), `akcija=1` za sniženja u kategoriji, `brend` (pa_proizvodjac slug). */
export function getSearchUrl(params: {
  q?: string;
  category?: string;
  onSale?: boolean;
  brand?: string;
}): string {
  const sp = new URLSearchParams();
  if (params.q?.trim()) sp.set('q', params.q.trim());
  if (params.category) sp.set('category', params.category);
  if (params.onSale) sp.set('akcija', '1');
  if (params.brand) sp.set('brend', params.brand);
  const qs = sp.toString();
  return qs ? `${ROUTES.search}?${qs}` : ROUTES.search;
}

/** Svi proizvodi jednog brenda (pa_proizvodjac slug), preko stranice pretrage. */
export function getBrandProductsUrl(brandSlug: string): string {
  return getSearchUrl({ brand: brandSlug });
}

/** Default listing when product or category is not found. */
export const DEFAULT_BROWSE_URL = `${ROUTES.productCategory}/elektricni-alat`;

/** Top-level program pages (Alati → /proizvodi, ostali → /product-category/…). */
export const getTopCategoryUrl = (slug: string) => {
  if (slug === 'alati') return ROUTES.shop;
  return `${ROUTES.productCategory}/${programToWcSlug(slug)}`;
};

/** Mega-menu sidebar id → internal parent slug under /product-category/… */
export const MEGA_MENU_PARENT_SLUG: Record<string, string> = {
  'elektricni-alati': 'elektricni-alat',
  'aku-alati': 'aku-alat',
  'rucni-alati': 'rucni-alat',
  'pneumatski-alati': 'kompresori',
  'merna-oprema': 'merna-oprema',
  'radna-oprema': 'htz-oprema',
  'masine-oprema': 'agregati',
  'potrosni-materijal': 'potrosni-materijal',
  'bastenski-alati': 'kosacice-i-trimeri',
  elektromaterijal: 'elektromaterijal',
  rasveta: 'rasveta',
  solarne: 'solarne',
};

/** @deprecated use MEGA_MENU_PARENT_SLUG */
const megaMenuParentSlug = MEGA_MENU_PARENT_SLUG;

export const OTHER_PROGRAM_SLUGS = new Set(['elektromaterijal', 'rasveta', 'solarne']);

const alatiParentSlugs = new Set(alatiSubcategories.map((s) => s.slug));
const otherProgramSlugs = OTHER_PROGRAM_SLUGS;

export const getProductCategoryUrl = (internalParentSlug: string, ...rest: string[]) => {
  const wcParent = otherProgramSlugs.has(internalParentSlug)
    ? programToWcSlug(internalParentSlug)
    : toWcParentSlug(internalParentSlug);
  const path = [wcParent, ...rest].filter(Boolean).join('/');
  return `${ROUTES.productCategory}/${path}`;
};

/** Listing URL from WooCommerce parent + child slugs (live API paths). */
export const getWcCategoryListingUrl = (parentWcSlug: string, childWcSlug?: string) => {
  const path = childWcSlug ? `${parentWcSlug}/${childWcSlug}` : parentWcSlug;
  return `${ROUTES.productCategory}/${path}`;
};

/** Resolve mega-menu subcategory link — prefers live WC slugs from API. */
export const resolveMegaMenuSubcategoryUrl = (
  menuCategoryId: string,
  sub: { label: string; slug?: string; parentWcSlug?: string },
) => {
  if (sub.slug && sub.parentWcSlug) {
    return getWcCategoryListingUrl(sub.parentWcSlug, sub.slug);
  }
  return getMegaMenuSubcategoryUrl(menuCategoryId, sub.slug ?? sub.label, {
    wcSlug: Boolean(sub.slug),
  });
};

export const getMegaMenuCategoryUrl = (menuCategoryId: string) => {
  if (otherProgramSlugs.has(menuCategoryId)) {
    return getTopCategoryUrl(menuCategoryId);
  }
  const parentSlug = megaMenuParentSlug[menuCategoryId] ?? menuCategoryId;
  return getProductCategoryUrl(parentSlug);
};

export const getMegaMenuSubcategoryUrl = (
  menuCategoryId: string,
  subcategorySlugOrLabel: string,
  options?: { wcSlug?: boolean },
) => {
  const subSlug = options?.wcSlug ? subcategorySlugOrLabel : slugify(subcategorySlugOrLabel);
  if (otherProgramSlugs.has(menuCategoryId)) {
    return getProductCategoryUrl(menuCategoryId, subSlug);
  }
  const parentSlug = megaMenuParentSlug[menuCategoryId] ?? menuCategoryId;
  return getProductCategoryUrl(parentSlug, subSlug);
};

/** Popular category name on homepage → URL. */
const popularCategoryUrls: Record<string, string> = {
  'Električni alati': getProductCategoryUrl('elektricni-alat'),
  'Aku alati': getProductCategoryUrl('aku-alat'),
  'Ručni alati': getProductCategoryUrl('rucni-alat'),
  'Aparati za varenje': getProductCategoryUrl('aparati-za-varenje'),
  Kompresori: getProductCategoryUrl('kompresori'),
  Agregati: getProductCategoryUrl('agregati'),
  'Kosačice i trimeri': getProductCategoryUrl('kosacice-i-trimeri'),
  'HTZ oprema': getProductCategoryUrl('htz-oprema'),
  'Poljoprivredni program': getProductCategoryUrl('poljoprivredni-program'),
  'Oprema za dvorište': getProductCategoryUrl('oprema-za-dvoriste'),
};

export const getPopularCategoryUrl = (name: string) =>
  popularCategoryUrls[name] ?? getTopCategoryUrl('alati');

export const getAlatiSubcategoryUrl = (subcategorySlug: string) =>
  getProductCategoryUrl(subcategorySlug);

export const getProductListingUrl = (
  categorySlug: string,
  parentSlug: string,
  listingSlug: string,
) => {
  if (otherProgramSlugs.has(categorySlug)) {
    return getProductCategoryUrl(categorySlug, listingSlug);
  }
  return getProductCategoryUrl(parentSlug, listingSlug);
};

export const getProdavnicaUrl = (categoryPath: string, productSlug: string) =>
  `${ROUTES.prodavnica}/${categoryPath}/${productSlug}`;

/** Two-segment URL is a parent hub (chips), not a product list. */
export const isParentListingRoute = (
  categorySlug: string,
  parentSlug: string,
  listingSlug?: string,
) => {
  if (listingSlug) return false;
  if (otherProgramSlugs.has(categorySlug)) return false;
  return alatiParentSlugs.has(parentSlug) || Object.values(megaMenuParentSlug).includes(parentSlug);
};

/** Two-segment URL for other programs goes straight to products. */
export const isLeafProgramListingRoute = (
  categorySlug: string,
  parentSlug: string,
  listingSlug?: string,
) => !listingSlug && otherProgramSlugs.has(categorySlug);

export const findMenuCategoryByParentSlug = (parentSlug: string) => {
  const entry = Object.entries(megaMenuParentSlug).find(([, slug]) => slug === parentSlug);
  if (!entry) return undefined;
  return allMenuCategories.find((c) => c.id === entry[0]);
};
