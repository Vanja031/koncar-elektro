import { describe, expect, it } from 'vitest';
import {
  calculateShipping,
  FREE_SHIPPING_MAX_WEIGHT_KG,
  FREE_SHIPPING_MIN_SUBTOTAL,
  SHIPPING_CARRIER,
  SHIPPING_COST,
  SHIPPING_MAX_TIER_COST,
  getShippingCostByWeight,
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

  it('falls back to the weight-tier price once weight exceeds the free-shipping limit, even for high-value carts', () => {
    const quote = calculateShipping(50_000, FREE_SHIPPING_MAX_WEIGHT_KG + 0.1);
    expect(quote).toMatchObject({
      cost: 900,
      isFree: false,
    });
  });

  it('charges the weight-tier price when subtotal is below the threshold, regardless of the tier', () => {
    expect(calculateShipping(FREE_SHIPPING_MIN_SUBTOTAL - 1, 1).isFree).toBe(false);
  });

  it('always reports the requested total weight back', () => {
    expect(calculateShipping(1_000, 3.5).totalWeightKg).toBe(3.5);
  });
});

describe('getShippingCostByWeight', () => {
  it.each([
    [0, 400],
    [10, 400],
    [10.1, 600],
    [20, 600],
    [20.1, 900],
    [30, 900],
    [30.1, 1_500],
    [40, 1_500],
    [40.1, 2_000],
    [50, 2_000],
    [50.1, 3_000],
    [60, 3_000],
    [60.1, 3_500],
    [80, 3_500],
    [80.1, 4_000],
    [100, 4_000],
    [100.1, 5_000],
    [120, 5_000],
    [120.1, 6_000],
    [140, 6_000],
    [140.1, 7_000],
    [160, 7_000],
    [160.1, SHIPPING_MAX_TIER_COST],
    [500, SHIPPING_MAX_TIER_COST],
  ])('charges %skg at %s RSD', (weightKg, expectedCost) => {
    expect(getShippingCostByWeight(weightKg)).toBe(expectedCost);
  });
});
