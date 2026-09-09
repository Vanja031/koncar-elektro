import { describe, expect, it } from 'vitest';
import {
  BRAND_API_ATTRIBUTE_SLUG,
  BRAND_ATTRIBUTE_SLUG,
  listingFiltersToSearchParams,
} from '@/lib/listingFilters';

describe('listingFilters brand taxonomy', () => {
  it('maps UI brand filters to the API taxonomy for the active WP host', () => {
    const params = listingFiltersToSearchParams({
      attributes: { [BRAND_ATTRIBUTE_SLUG]: ['ingco'] },
    });

    expect(params['attributes[0][attribute]']).toBe(BRAND_API_ATTRIBUTE_SLUG);
    expect(params['attributes[0][slug]']).toBe('ingco');
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
    expect(params['attributes[0][slug]']).toBe('ingco');
    expect(params['attributes[1][attribute]']).toBeUndefined();
  });
});
