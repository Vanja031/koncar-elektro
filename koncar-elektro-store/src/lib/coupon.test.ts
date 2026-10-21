import { describe, expect, it } from 'vitest';
import {
  BRAND_SPLIT_COUPON_CODE,
  isIngcoBrand,
  quoteCoupon,
} from '@/lib/coupon';
import { calculateShipping } from '@/lib/shipping';

describe('isIngcoBrand', () => {
  it('covers INGCO and SUPER INGCO spellings', () => {
    expect(isIngcoBrand('INGCO')).toBe(true);
    expect(isIngcoBrand('SUPER INGCO')).toBe(true);
    expect(isIngcoBrand('INGCO - SUPER INGCO')).toBe(true);
    expect(isIngcoBrand('ingco')).toBe(true);
  });

  it('leaves other brands at the standard rate', () => {
    expect(isIngcoBrand('Bosch')).toBe(false);
    expect(isIngcoBrand('')).toBe(false);
  });
});

describe('quoteCoupon koncar10', () => {
  it('takes 5% off other brands and 10% off Ingco, on the current price', () => {
    const quote = quoteCoupon(BRAND_SPLIT_COUPON_CODE, [
      { productId: 1, quantity: 1, unitPrice: 10_000, brand: 'Bosch' },
      { productId: 2, quantity: 1, unitPrice: 10_000, brand: 'INGCO' },
      { productId: 3, quantity: 2, unitPrice: 1_000, brand: 'SUPER INGCO' },
    ]);

    expect(quote.lines.map((line) => line.discount)).toEqual([500, 1_000, 200]);
    expect(quote.subtotal).toBe(22_000);
    expect(quote.discount).toBe(1_700);
    expect(quote.discountedSubtotal).toBe(20_300);
  });

  it('applies the sale price that was passed in, not a crossed-out price', () => {
    const quote = quoteCoupon('KONCAR10', [
      { productId: 4, quantity: 1, unitPrice: 1_990, brand: 'Super Ingco' },
    ]);
    expect(quote.discount).toBe(199);
    expect(quote.discountedSubtotal).toBe(1_791);
  });

  it('lets the discount drop the merchandise total under the free-shipping threshold', () => {
    const quote = quoteCoupon(BRAND_SPLIT_COUPON_CODE, [
      { productId: 5, quantity: 1, unitPrice: 15_200, brand: 'INGCO' },
    ]);
    expect(quote.discountedSubtotal).toBe(13_680);
    expect(calculateShipping(quote.subtotal, 1).isFree).toBe(true);
    expect(calculateShipping(quote.discountedSubtotal, 1).isFree).toBe(false);
  });
});

describe('quoteCoupon flat percent', () => {
  it('uses one rate for every line', () => {
    const quote = quoteCoupon('leto10', [
      { productId: 1, quantity: 1, unitPrice: 1_000, brand: 'INGCO' },
      { productId: 2, quantity: 1, unitPrice: 1_000, brand: 'Bosch' },
    ], { flatRate: 0.1 });
    expect(quote.discount).toBe(200);
    expect(quote.lines.every((line) => line.rate === 0.1)).toBe(true);
  });
});
