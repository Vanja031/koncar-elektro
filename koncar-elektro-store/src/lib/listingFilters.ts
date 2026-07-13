import { wcAttributes } from '@/data/wcAttributes';
import type { WcStoreAttributeCount } from '@/lib/api/wc-store/products';
import type { WcStoreProduct } from '@/lib/api/types/wc-store';

export const BRAND_ATTRIBUTE_SLUG = 'pa_proizvodjac';

/** Never expose these as shop filters (declaration / empty / noise). */
export const HIDDEN_FILTER_ATTRIBUTE_SLUGS = new Set([
  'pa_uvoznik',
  'pa_zemlja-porekla',
  'pa_potenciometar',
]);

/** Preferred display order for attribute filter sections. */
export const ATTRIBUTE_FILTER_ORDER = [
  BRAND_ATTRIBUTE_SLUG,
  'pa_snaga',
  'pa_kapacitet-baterija',
  'pa_energija-udarca',
  'pa_precnik-lista',
  'pa_pritisak',
  'pa_konjska-snaga',
  'pa_dimenzija-trake',
  'pa_boja',
  'pa_tezina',
] as const;

const ATTRIBUTE_LABEL_OVERRIDES: Record<string, string> = {
  [BRAND_ATTRIBUTE_SLUG]: 'Brend',
};

export type ListingFilters = {
  /** Selected term slugs keyed by attribute taxonomy (e.g. pa_snaga). */
  attributes?: Record<string, string[]>;
  priceMin?: number;
  priceMax?: number;
  inStockOnly?: boolean;
  /** Parent WC category slug (e.g. sale hub). */
  categorySlug?: string;
};

export type AttributeFilterOption = {
  label: string;
  slug: string;
};

export type AttributeFilterGroup = {
  slug: string;
  label: string;
  options: AttributeFilterOption[];
  searchable: boolean;
};

/** @deprecated Use AttributeFilterOption */
export type BrandFilterOption = AttributeFilterOption;

export type CategoryFilterOption = {
  label: string;
  slug: string;
};

export type AttributeFacetMap = Record<string, Set<string>>;

type TermIndexEntry = {
  attributeSlug: string;
  termSlug: string;
  label: string;
};

let termIdIndex: Map<number, TermIndexEntry> | null = null;

function getTermIdIndex(): Map<number, TermIndexEntry> {
  if (termIdIndex) return termIdIndex;
  const map = new Map<number, TermIndexEntry>();
  for (const attr of wcAttributes) {
    for (const term of attr.terms) {
      map.set(term.id, {
        attributeSlug: attr.slug,
        termSlug: term.slug,
        label: term.name,
      });
    }
  }
  termIdIndex = map;
  return map;
}

function normalizeTaxonomy(taxonomy: string): string {
  const raw = taxonomy.trim().toLowerCase();
  if (raw.startsWith('pa_')) return raw;
  const match = raw.match(/(pa_[a-z0-9-]+)$/);
  return match?.[1] ?? raw;
}

export function getFilterableWcAttributes() {
  return wcAttributes.filter(
    (a) => a.terms.length > 0 && !HIDDEN_FILTER_ATTRIBUTE_SLUGS.has(a.slug),
  );
}

/** Taxonomies to request facet counts for (excludes brand — always shown). */
export function getFacetTaxonomies(): string[] {
  return getFilterableWcAttributes()
    .map((a) => a.slug)
    .filter((slug) => slug !== BRAND_ATTRIBUTE_SLUG);
}

export function getAttributeFilterOptions(attributeSlug: string): AttributeFilterOption[] {
  const attr = wcAttributes.find((a) => a.slug === attributeSlug);
  return (
    attr?.terms.map((t) => ({ label: t.name, slug: t.slug })) ?? []
  ).sort((a, b) => a.label.localeCompare(b.label, 'sr'));
}

export function getBrandFilterOptions(): AttributeFilterOption[] {
  return getAttributeFilterOptions(BRAND_ATTRIBUTE_SLUG);
}

export function getAttributeLabel(attributeSlug: string): string {
  if (ATTRIBUTE_LABEL_OVERRIDES[attributeSlug]) {
    return ATTRIBUTE_LABEL_OVERRIDES[attributeSlug];
  }
  return wcAttributes.find((a) => a.slug === attributeSlug)?.name ?? attributeSlug;
}

/** Collect facets from a product sample (fallback). */
export function collectAttributeFacets(products: WcStoreProduct[]): AttributeFacetMap {
  const map: AttributeFacetMap = {};

  for (const product of products) {
    for (const attr of product.attributes ?? []) {
      if (!attr.terms?.length) continue;
      const taxonomy = normalizeTaxonomy(attr.taxonomy || '');
      if (!taxonomy.startsWith('pa_')) continue;
      if (HIDDEN_FILTER_ATTRIBUTE_SLUGS.has(taxonomy)) continue;
      if (!map[taxonomy]) map[taxonomy] = new Set();
      for (const term of attr.terms) {
        if (term.slug) map[taxonomy].add(term.slug);
      }
    }
  }

  return map;
}

/**
 * Build facets from Store API collection-data attribute_counts.
 * Term IDs are mapped back to attribute + slug via wcAttributes.
 */
export function collectAttributeFacetsFromCounts(
  counts: WcStoreAttributeCount[],
): AttributeFacetMap {
  const index = getTermIdIndex();
  const map: AttributeFacetMap = {};

  for (const row of counts) {
    if (!row.count || row.count <= 0) continue;
    const info = index.get(row.term);
    if (!info) continue;
    if (HIDDEN_FILTER_ATTRIBUTE_SLUGS.has(info.attributeSlug)) continue;
    if (!map[info.attributeSlug]) map[info.attributeSlug] = new Set();
    map[info.attributeSlug].add(info.termSlug);
  }

  return map;
}

/**
 * Build filter groups for the current listing.
 * - Brand is always included when we have global options.
 * - Other attributes only when present in facets (or already selected).
 * - Options are narrowed to terms that exist in the listing context.
 */
export function buildAttributeFilterGroups(
  facets: AttributeFacetMap | undefined,
  selectedAttributes?: Record<string, string[]>,
): AttributeFilterGroup[] {
  const selected = selectedAttributes ?? {};
  const filterable = getFilterableWcAttributes();
  const bySlug = new Map(filterable.map((a) => [a.slug, a]));

  const orderedSlugs = [
    ...ATTRIBUTE_FILTER_ORDER.filter((slug) => bySlug.has(slug)),
    ...filterable
      .map((a) => a.slug)
      .filter((slug) => !(ATTRIBUTE_FILTER_ORDER as readonly string[]).includes(slug)),
  ];

  const groups: AttributeFilterGroup[] = [];

  for (const slug of orderedSlugs) {
    if (!bySlug.has(slug)) continue;

    const selectedSlugs = selected[slug] ?? [];
    const seen = facets?.[slug];
    const isBrand = slug === BRAND_ATTRIBUTE_SLUG;

    // Brand: always available. Other attrs: only if seen in context or actively selected.
    // While facets are loading (undefined), only brand (+ active selections) show.
    if (!isBrand && !seen?.size && selectedSlugs.length === 0) continue;

    let options = getAttributeFilterOptions(slug);

    if (!isBrand && seen && seen.size > 0) {
      const allow = new Set<string>([...seen, ...selectedSlugs]);
      const narrowed = options.filter((o) => allow.has(o.slug));
      if (narrowed.length > 0) {
        options = narrowed;
      } else {
        options = [...seen]
          .map((termSlug) => {
            const match = getAttributeFilterOptions(slug).find((o) => o.slug === termSlug);
            return { label: match?.label ?? termSlug, slug: termSlug };
          })
          .sort((a, b) => a.label.localeCompare(b.label, 'sr'));
      }
    } else if (!isBrand && selectedSlugs.length > 0 && !seen?.size) {
      options = options.filter((o) => selectedSlugs.includes(o.slug));
    }

    for (const sel of selectedSlugs) {
      if (!options.some((o) => o.slug === sel)) {
        options = [{ label: sel, slug: sel }, ...options];
      }
    }

    if (options.length === 0) continue;

    groups.push({
      slug,
      label: getAttributeLabel(slug),
      options,
      searchable: options.length > 10,
    });
  }

  return groups;
}

export function getSelectedAttributeSlugs(
  filters: ListingFilters,
  attributeSlug: string,
): string[] {
  return filters.attributes?.[attributeSlug] ?? [];
}

export function setAttributeSelection(
  filters: ListingFilters,
  attributeSlug: string,
  termSlugs: string[] | undefined,
): ListingFilters {
  const nextAttrs = { ...(filters.attributes ?? {}) };
  if (!termSlugs?.length) {
    delete nextAttrs[attributeSlug];
  } else {
    nextAttrs[attributeSlug] = termSlugs;
  }
  const attributes = Object.keys(nextAttrs).length ? nextAttrs : undefined;
  return { ...filters, attributes };
}

export function toggleAttributeTerm(
  filters: ListingFilters,
  attributeSlug: string,
  termSlug: string,
  checked: boolean,
): ListingFilters {
  const current = getSelectedAttributeSlugs(filters, attributeSlug);
  const next = checked
    ? current.includes(termSlug)
      ? current
      : [...current, termSlug]
    : current.filter((s) => s !== termSlug);
  return setAttributeSelection(filters, attributeSlug, next.length ? next : undefined);
}

/** Store API expects prices in minor units (×100 for RSD). */
export function listingFiltersToSearchParams(
  filters: ListingFilters,
): Record<string, string> {
  const params: Record<string, string> = {};
  let attrIndex = 0;

  const attributes = filters.attributes ?? {};
  for (const [attribute, slugs] of Object.entries(attributes)) {
    if (!slugs?.length) continue;
    if (HIDDEN_FILTER_ATTRIBUTE_SLUGS.has(attribute)) continue;
    params[`attributes[${attrIndex}][attribute]`] = attribute;
    params[`attributes[${attrIndex}][slug]`] =
      slugs.length === 1 ? slugs[0] : slugs.join(',');
    attrIndex += 1;
  }

  if (filters.priceMin != null && filters.priceMin > 0) {
    params.min_price = String(Math.round(filters.priceMin * 100));
  }
  if (filters.priceMax != null && filters.priceMax > 0) {
    params.max_price = String(Math.round(filters.priceMax * 100));
  }
  if (filters.inStockOnly) {
    params.in_stock = 'true';
  }

  return params;
}

export const emptyListingFilters = (): ListingFilters => ({});

export function countActiveFilters(filters: ListingFilters): number {
  let count = 0;
  for (const [slug, slugs] of Object.entries(filters.attributes ?? {})) {
    if (HIDDEN_FILTER_ATTRIBUTE_SLUGS.has(slug)) continue;
    count += slugs?.length ?? 0;
  }
  if (filters.priceMin != null && filters.priceMin > 0) count += 1;
  if (filters.priceMax != null && filters.priceMax > 0) count += 1;
  if (filters.inStockOnly) count += 1;
  if (filters.categorySlug) count += 1;
  return count;
}

/** WC category slug to send to the Store API. */
export function resolveFilterCategorySlug(filters: ListingFilters): string | undefined {
  return filters.categorySlug;
}
