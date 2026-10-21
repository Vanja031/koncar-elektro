import { describe, expect, it } from 'vitest';
import {
  BRAND_SPLIT_COUPON_CODE,
  grossToNet,
  isIngcoBrand,
  quoteCoupon,
  roundMoney,
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

describe('grossToNet', () => {
  it('splits included 20% PDV the same way WooCommerce stores a normal order', () => {
    expect(grossToNet(36_850)).toBe(30_708.33);
    expect(roundMoney(36_850 - 30_708.33)).toBe(6_141.67);
    expect(grossToNet(4_999)).toBe(4_165.83);
    expect(grossToNet(4_499.1)).toBe(3_749.25);
    expect(grossToNet(2_600)).toBe(2_166.67);
    expect(grossToNet(2_340)).toBe(1_950);
  });

  it('adds the 20% WooCommerce charges on the net amount back to the price the customer saw', () => {
    for (const gross of [4_999, 4_499.1, 2_600, 2_340, 36_850]) {
      const net = grossToNet(gross);
      expect(roundMoney(net + roundMoney(net * 0.2))).toBe(gross);
    }
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
