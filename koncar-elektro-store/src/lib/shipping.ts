export const SHIPPING_COST = 400;
export const SHIPPING_CARRIER = 'Post Express / AKS';

/** Porudžbine sa sumom preko ovog iznosa (RSD) kvalifikuju se za besplatnu dostavu. */
export const FREE_SHIPPING_MIN_SUBTOTAL = 15_000;

/** Besplatna dostava važi samo do ove ukupne težine korpe (kg) — uključivo. */
export const FREE_SHIPPING_MAX_WEIGHT_KG = 20;

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

/**
 * Cena dostave:
 * — Besplatna dostava za porudžbine preko {@link FREE_SHIPPING_MIN_SUBTOTAL} din,
 *   dok je ukupna težina korpe do {@link FREE_SHIPPING_MAX_WEIGHT_KG}kg.
 * — Porudžbine teže od {@link FREE_SHIPPING_MAX_WEIGHT_KG}kg (npr. agregati, kompresori,
 *   kolica sa alatom) trebalo bi da idu preko posebnog kalkulatora dostave po težini —
 *   dok taj kalkulator nije spreman, i za njih ostaje fiksna cena ispod
 *   ({@link SHIPPING_COST} din), kao privremeno rešenje.
 * — Sve ostale porudžbine (ispod praga za besplatnu dostavu) plaćaju fiksnu cenu.
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

  // TODO: kada kalkulator dostave po težini bude spreman, porudžbine preko
  // FREE_SHIPPING_MAX_WEIGHT_KG treba da koriste njega umesto SHIPPING_COST.
  return {
    cost: SHIPPING_COST,
    isFree: false,
    totalWeightKg,
    label: STANDARD_SHIPPING_LABEL,
    hint: STANDARD_HINT,
  };
};
