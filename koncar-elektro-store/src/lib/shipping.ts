export const SHIPPING_COST = 400;
export const SHIPPING_CARRIER = 'Post Express / AKS';

/** Porudžbine sa sumom preko ovog iznosa (RSD) kvalifikuju se za besplatnu dostavu. */
export const FREE_SHIPPING_MIN_SUBTOTAL = 15_000;

/** Besplatna dostava važi samo do ove ukupne težine korpe (kg) — uključivo. */
export const FREE_SHIPPING_MAX_WEIGHT_KG = 20;

/**
 * Cenovnik dostave po ukupnoj težini korpe (kg) — svaki prag je uključiv gornja granica
 * (npr. tačno 10kg spada u prvi razred). Poslednji razred (160kg+) se koristi kad
 * težina premaši i najviši prag ovde definisan.
 */
export const SHIPPING_WEIGHT_TIERS: { maxWeightKg: number; cost: number }[] = [
  { maxWeightKg: 10, cost: 400 },
  { maxWeightKg: 20, cost: 600 },
  { maxWeightKg: 30, cost: 900 },
  { maxWeightKg: 40, cost: 1_500 },
  { maxWeightKg: 50, cost: 2_000 },
  { maxWeightKg: 60, cost: 3_000 },
  { maxWeightKg: 80, cost: 3_500 },
  { maxWeightKg: 100, cost: 4_000 },
  { maxWeightKg: 120, cost: 5_000 },
  { maxWeightKg: 140, cost: 6_000 },
  { maxWeightKg: 160, cost: 7_000 },
];

/** Cena dostave za porudžbine teže od najvišeg praga u {@link SHIPPING_WEIGHT_TIERS} (160kg+). */
export const SHIPPING_MAX_TIER_COST = 8_000;

export type ShippingQuote = {
  cost: number;
  isFree: boolean;
  totalWeightKg: number;
  label: string;
  hint?: string;
};

const FREE_SHIPPING_LABEL = `Besplatna dostava — ${SHIPPING_CARRIER}`;
const STANDARD_SHIPPING_LABEL = `Kurirska služba: ${SHIPPING_CARRIER}`;
const STANDARD_HINT = 'Isporuka 1–2 radna dana';

/** Cena dostave za dati razred težine, prema {@link SHIPPING_WEIGHT_TIERS}. */
export const getShippingCostByWeight = (totalWeightKg: number): number => {
  const tier = SHIPPING_WEIGHT_TIERS.find((t) => totalWeightKg <= t.maxWeightKg);
  return tier ? tier.cost : SHIPPING_MAX_TIER_COST;
};

/**
 * Cena dostave:
 * — Besplatna dostava za porudžbine preko {@link FREE_SHIPPING_MIN_SUBTOTAL} din,
 *   dok je ukupna težina korpe do {@link FREE_SHIPPING_MAX_WEIGHT_KG}kg (izuzetak koji
 *   ima prioritet nad cenovnikom po težini).
 * — Sve ostale porudžbine plaćaju po razredu težine iz {@link SHIPPING_WEIGHT_TIERS}
 *   (0–10kg = {@link SHIPPING_COST} din, pa dalje raste do {@link SHIPPING_MAX_TIER_COST}
 *   din za 160kg+).
 */
export const calculateShipping = (subtotal: number, totalWeightKg: number): ShippingQuote => {
  const withinFreeShippingWeightLimit = totalWeightKg <= FREE_SHIPPING_MAX_WEIGHT_KG;
  const qualifiesForFreeShipping = withinFreeShippingWeightLimit && subtotal >= FREE_SHIPPING_MIN_SUBTOTAL;

  if (qualifiesForFreeShipping) {
    return {
      cost: 0,
      isFree: true,
      totalWeightKg,
      label: FREE_SHIPPING_LABEL,
      hint: STANDARD_HINT,
    };
  }

  return {
    cost: getShippingCostByWeight(totalWeightKg),
    isFree: false,
    totalWeightKg,
    label: STANDARD_SHIPPING_LABEL,
    hint: STANDARD_HINT,
  };
};
