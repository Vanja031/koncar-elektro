import { describe, expect, it } from 'vitest';
import {
  normalizeSearchText,
  productMatchesAllTokens,
  tokenMatchesHaystack,
  tokenizeQuery,
} from './relevance';

describe('tokenizeQuery', () => {
  it('splits multi-word queries', () => {
    expect(tokenizeQuery('cirkular ingco')).toEqual(['cirkular', 'ingco']);
  });
});

describe('tokenMatchesHaystack', () => {
  it('matches prefix variants like cirkularna', () => {
    const haystack = normalizeSearchText('Akumulatorska cirkularna testera SUPER INGCO');
    expect(tokenMatchesHaystack('cirkular', haystack)).toBe(true);
    expect(tokenMatchesHaystack('ingco', haystack)).toBe(true);
  });
});

describe('productMatchesAllTokens', () => {
  it('requires every token in searchable fields', () => {
    const source = {
      name: 'Elektricna mini cirkularna testera MFS1251 750W INGCO',
      brand: 'INGCO',
    };
    expect(productMatchesAllTokens(source, tokenizeQuery('cirkular ingco'))).toBe(true);
    expect(productMatchesAllTokens(source, tokenizeQuery('cirkular makita'))).toBe(false);
  });

  it('matches brand-only ingco token', () => {
    const source = {
      name: 'INGCO Cirkularna testera CS2358',
      brand: 'INGCO',
    };
    expect(productMatchesAllTokens(source, tokenizeQuery('cirkular ingco'))).toBe(true);
  });
});
