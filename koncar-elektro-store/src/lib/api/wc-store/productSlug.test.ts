import { describe, expect, it } from 'vitest';
import {
  encodeNonAsciiAsPercentLiteral,
  productSlugLookupVariants,
  productSlugsEqual,
  slugSearchFallbackQuery,
} from '@/lib/api/wc-store/productSlug';

describe('productSlug lookup helpers', () => {
  const broken = 'akumulatorski-udarni-odvijac-ciwli2001-1-2%e2%80%b3-solo-ingco';
  const decoded = 'akumulatorski-udarni-odvijac-ciwli2001-1-2\u2033-solo-ingco';

  it('round-trips literal percent slug with decoded browser path', () => {
    expect(productSlugsEqual(broken, decoded)).toBe(true);
    expect(productSlugLookupVariants(decoded)).toContain(broken);
    expect(encodeNonAsciiAsPercentLiteral(decoded)).toBe(broken);
  });

  it('builds a digit-preferring search fallback', () => {
    const q = slugSearchFallbackQuery(broken);
    expect(q.toLowerCase()).toContain('ciwli2001');
  });
});
