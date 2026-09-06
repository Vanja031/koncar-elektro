import { describe, expect, it } from 'vitest';
import {
  calculateShipping,
  FREE_SHIPPING_MAX_WEIGHT_KG,
  FREE_SHIPPING_MIN_SUBTOTAL,
  SHIPPING_CARRIER,
  SHIPPING_COST,
} from '@/lib/shipping';

describe('calculateShipping', () => {
  it('charges the fixed courier price below the free-shipping subtotal threshold', () => {
    expect(calculateShipping(5_000, 1)).toMatchObject({
      cost: SHIPPING_COST,
      isFree: false,
      label: `Kurirska služba: ${SHIPPING_CARRIER}`,
    });
  });

  it('is free once the subtotal threshold is met and weight stays within the limit', () => {
    const quote = calculateShipping(FREE_SHIPPING_MIN_SUBTOTAL, FREE_SHIPPING_MAX_WEIGHT_KG);
    expect(quote).toMatchObject({
      cost: 0,
      isFree: true,
      totalWeightKg: FREE_SHIPPING_MAX_WEIGHT_KG,
    });
  });

  it('falls back to the fixed price once weight exceeds the limit, even for high-value carts', () => {
    const quote = calculateShipping(50_000, FREE_SHIPPING_MAX_WEIGHT_KG + 0.1);
    expect(quote).toMatchObject({
      cost: SHIPPING_COST,
      isFree: false,
    });
  });

  it('charges the fixed price when subtotal is below the threshold, regardless of weight', () => {
    expect(calculateShipping(FREE_SHIPPING_MIN_SUBTOTAL - 1, 1).isFree).toBe(false);
  });

  it('always reports the requested total weight back', () => {
    expect(calculateShipping(1_000, 3.5).totalWeightKg).toBe(3.5);
  });
});
