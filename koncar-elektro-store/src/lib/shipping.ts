export const SHIPPING_COST = 400;
export const SHIPPING_CARRIER = 'Post Express / AKS';

export type ShippingQuote = {
  cost: number;
  isFree: boolean;
  totalWeightKg: number;
  label: string;
  hint?: string;
};

/** Fiksna cena dostave za sve porudžbine. */
export const calculateShipping = (_subtotal: number, totalWeightKg: number): ShippingQuote => {
  return {
    cost: SHIPPING_COST,
    isFree: false,
    totalWeightKg,
    label: `Kurirska služba: ${SHIPPING_CARRIER}`,
    hint: 'Isporuka 1–2 radna dana',
  };
};
