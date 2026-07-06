export const FREE_SHIPPING_THRESHOLD = 15_000;

export type ShippingQuote = {
  cost: number;
  isFree: boolean;
  totalWeightKg: number;
  label: string;
  hint?: string;
};

/** Automatski obračun dostave na osnovu težine i vrednosti korpe. */
export const calculateShipping = (subtotal: number, totalWeightKg: number): ShippingQuote => {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return {
      cost: 0,
      isFree: true,
      totalWeightKg,
      label: 'Besplatna dostava',
      hint: `Porudžbine preko ${FREE_SHIPPING_THRESHOLD.toLocaleString('sr-RS')} RSD`,
    };
  }

  const base = 390;
  const perKg = 70;
  const cost = Math.round(base + Math.max(0, totalWeightKg - 1) * perKg);

  return {
    cost,
    isFree: false,
    totalWeightKg,
    label: 'Dostava kurirskom službom',
    hint: 'Isporuka 1–2 radna dana',
  };
};
