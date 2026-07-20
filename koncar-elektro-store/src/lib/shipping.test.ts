import { describe, expect, it } from 'vitest';
import { calculateShipping, SHIPPING_CARRIER, SHIPPING_COST } from '@/lib/shipping';

describe('calculateShipping', () => {
  it('returns the fixed courier delivery price regardless of cart value or weight', () => {
    expect(calculateShipping(5_000, 1)).toMatchObject({
      cost: SHIPPING_COST,
      isFree: false,
      label: `Kurirska služba: ${SHIPPING_CARRIER}`,
    });

    expect(calculateShipping(50_000, 20).cost).toBe(SHIPPING_COST);
  });
});
