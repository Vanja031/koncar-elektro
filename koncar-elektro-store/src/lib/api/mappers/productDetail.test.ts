import { describe, expect, it } from 'vitest';
import { mapStoreProductToDetail } from '@/lib/api/mappers/productDetail';
import type { WcStoreProduct } from '@/lib/api/types/wc-store';

function makeProduct(overrides: Partial<WcStoreProduct> = {}): WcStoreProduct {
  return {
    id: 1,
    name: 'Test proizvod',
    slug: 'test-proizvod',
    parent: 0,
    type: 'simple',
    variation: '',
    permalink: 'https://koncarelektro.rs/prodavnica/test/test-proizvod/',
    sku: 'SKU-1',
    short_description: '',
    description: '',
    on_sale: false,
    prices: {
      price: '10000',
      regular_price: '10000',
      sale_price: '10000',
      currency_code: 'RSD',
      currency_minor_unit: 2,
      currency_decimal_separator: ',',
      currency_thousand_separator: '.',
      currency_prefix: '',
      currency_suffix: ' rsd',
    },
    price_html: '',
    average_rating: '0',
    review_count: 0,
    images: [],
    categories: [],
    tags: [],
    stock_availability: { text: '', class: '' },
    is_in_stock: true,
    attributes: [],
    add_to_cart: {
      text: '',
      description: '',
      url: '',
      single_text: '',
      minimum: 1,
      maximum: 99,
      multiple_of: 1,
    },
    ...overrides,
  };
}

describe('mapStoreProductToDetail — specifications', () => {
  it('combines description bullets with base fields, without duplicating Brend', () => {
    const product = makeProduct({
      attributes: [
        {
          id: 1,
          name: 'Proizvodjač',
          taxonomy: 'pa_proizvodjac',
          has_variations: false,
          terms: [{ id: 1, name: 'MAKITA', slug: 'makita' }],
        },
      ],
      description: `
        <p><strong>Tehničke karakteristike proizvoda:</strong></p>
        <ul>
          <li>Brend: Makita</li>
          <li>Snaga: 190 W</li>
          <li>Težina: 1,4 kg.</li>
        </ul>
      `,
    });

    const detail = mapStoreProductToDetail(product);

    expect(detail.specifications).toEqual([
      { label: 'Brend', value: 'MAKITA' },
      { label: 'Šifra', value: 'SKU-1' },
      { label: 'Kategorija', value: 'Proizvodi' },
      { label: 'Snaga', value: '190 W' },
      { label: 'Težina', value: '1,4 kg.' },
    ]);
  });

  it('never repeats declaration fields (Proizvođač/Uvoznik/Zemlja porekla) in specifications', () => {
    const product = makeProduct({
      attributes: [
        {
          id: 1,
          name: 'Proizvodjač',
          taxonomy: 'pa_proizvodjac',
          has_variations: false,
          terms: [{ id: 1, name: 'HYUNDAI', slug: 'hyundai' }],
        },
        {
          id: 2,
          name: 'Uvoznik',
          taxonomy: 'pa_uvoznik',
          has_variations: false,
          terms: [{ id: 2, name: 'Neki uvoznik d.o.o.', slug: 'neki-uvoznik' }],
        },
        {
          id: 3,
          name: 'Zemlja porekla',
          taxonomy: 'pa_zemlja-porekla',
          has_variations: false,
          terms: [{ id: 3, name: 'Kina', slug: 'kina' }],
        },
        {
          id: 4,
          name: 'Snaga (W)',
          taxonomy: 'pa_snaga',
          has_variations: false,
          terms: [{ id: 4, name: '710W', slug: '710w' }],
        },
      ],
    });

    const detail = mapStoreProductToDetail(product);

    const labels = detail.specifications.map((s) => s.label);
    expect(labels).not.toContain('Uvoznik');
    expect(labels).not.toContain('Zemlja porekla');
    expect(labels).not.toContain('Proizvodjač');
    expect(detail.specifications).toContainEqual({ label: 'Snaga (W)', value: '710W' });

    // Declaration tab still gets them.
    expect(detail.declaration).toContainEqual({ label: 'Proizvodjač', value: 'HYUNDAI' });
    expect(detail.declaration).toContainEqual({ label: 'Uvoznik', value: 'Neki uvoznik d.o.o.' });
    expect(detail.declaration).toContainEqual({ label: 'Zemlja porekla', value: 'Kina' });
  });

  it('falls back to base fields only when the description has no tech-spec section and no WC attributes', () => {
    const product = makeProduct({ description: '<p>Samo marketinški opis, bez liste.</p>' });
    const detail = mapStoreProductToDetail(product);

    expect(detail.specifications).toEqual([
      { label: 'Brend', value: '' },
      { label: 'Šifra', value: 'SKU-1' },
      { label: 'Kategorija', value: 'Proizvodi' },
    ]);
  });

  it('includes Težina when the product has a numeric weight', () => {
    const product = makeProduct({ weight: '1.4' });
    const detail = mapStoreProductToDetail(product);
    expect(detail.specifications).toContainEqual({ label: 'Težina', value: '1.4 kg' });
  });
});
