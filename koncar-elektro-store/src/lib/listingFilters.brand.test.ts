import { describe, expect, it } from 'vitest';
import {
  BRAND_API_ATTRIBUTE_SLUG,
  BRAND_ATTRIBUTE_SLUG,
  buildAttributeFilterGroups,
  collectAttributeFacets,
  listingFiltersToSearchParams,
} from '@/lib/listingFilters';
import type { WcStoreProduct } from '@/lib/api/types/wc-store';

describe('listingFilters brand taxonomy', () => {
  it('maps UI brand filters to the API taxonomy for the active WP host', () => {
    const params = listingFiltersToSearchParams({
      attributes: { [BRAND_ATTRIBUTE_SLUG]: ['ingco'] },
    });

    expect(params['attributes[0][attribute]']).toBe(BRAND_API_ATTRIBUTE_SLUG);
    expect(params['attributes[0][slug]']).toBe(
      BRAND_API_ATTRIBUTE_SLUG === 'pa_proizvodjac' ? 'ingco-2' : 'ingco',
    );
    expect(params['attributes[0][operator]']).toBe('in');
  });

  it('normalizes pa_brend / pa_proizvodjac aliases into a single API attribute', () => {
    const params = listingFiltersToSearchParams({
      attributes: {
        pa_brend: ['ingco'],
        pa_proizvodjac: ['ingco'],
      },
    });

    expect(params['attributes[0][attribute]']).toBe(BRAND_API_ATTRIBUTE_SLUG);
    expect(params['attributes[0][slug]']).toBe(
      BRAND_API_ATTRIBUTE_SLUG === 'pa_proizvodjac' ? 'ingco-2' : 'ingco',
    );
    expect(params['attributes[1][attribute]']).toBeUndefined();
  });

  it('rewrites live manufacturer slugs that do not match the attribute dump', () => {
    const params = listingFiltersToSearchParams({
      attributes: { [BRAND_ATTRIBUTE_SLUG]: ['ingco', 'bosch', 'f-f-group'] },
    });

    if (BRAND_API_ATTRIBUTE_SLUG === 'pa_proizvodjac') {
      expect(params['attributes[0][slug]']).toBe('ingco-2,bosch-professional,f-f-group-2');
    } else {
      expect(params['attributes[0][slug]']).toBe('ingco,bosch,f-f-group');
    }
  });
});

describe('collectAttributeFacets', () => {
  it('keeps only attributes present on products and collapses live brand taxonomy', () => {
    const products = [
      {
        attributes: [
          {
            id: 1,
            name: 'Proizvođač',
            taxonomy: 'pa_proizvodjac',
            has_variations: false,
            terms: [{ id: 1065, name: 'WIRMAN', slug: 'wirman' }],
          },
          {
            id: 2,
            name: 'Snaga',
            taxonomy: 'pa_snaga',
            has_variations: false,
            terms: [{ id: 4224, name: '11kW', slug: '11kw' }],
          },
          {
            id: 3,
            name: 'Uvoznik',
            taxonomy: 'pa_uvoznik',
            has_variations: false,
            terms: [{ id: 983, name: 'X', slug: 'x' }],
          },
        ],
      },
    ] as Array<Pick<WcStoreProduct, 'attributes'>>;

    const facets = collectAttributeFacets(products);

    expect([...facets[BRAND_ATTRIBUTE_SLUG]!.keys()]).toEqual(['wirman']);
    expect([...facets.pa_snaga!.keys()]).toEqual(['11kw']);
    expect(facets.pa_uvoznik).toBeUndefined();
    expect(facets.pa_jacina_udarca ?? facets['pa_jacina-udarca']).toBeUndefined();
  });

  it('maps live ingco-2 onto the Ingco filter option', () => {
    const facets = collectAttributeFacets([
      {
        attributes: [
          {
            id: 1,
            name: 'Proizvođač',
            taxonomy: 'pa_proizvodjac',
            has_variations: false,
            terms: [{ id: 4034, name: 'Ingco', slug: 'ingco-2' }],
          },
        ],
      },
      {
        attributes: [
          {
            id: 1,
            name: 'Proizvođač',
            taxonomy: 'pa_proizvodjac',
            has_variations: false,
            terms: [{ id: 2, name: 'Makita', slug: 'makita' }],
          },
        ],
      },
    ] as Array<Pick<WcStoreProduct, 'attributes'>>);

    const brand = buildAttributeFilterGroups(facets).find((g) => g.slug === BRAND_ATTRIBUTE_SLUG);
    const ingco = brand?.options.find((o) => o.label === 'Ingco' || o.slug === 'ingco');

    expect(ingco).toEqual({ label: 'Ingco', slug: 'ingco' });
    expect(brand?.options.some((o) => o.slug === 'ingco-2')).toBe(false);
  });
});
