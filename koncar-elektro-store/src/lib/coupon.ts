/** Kod sa 5% na sve i 10% na INGCO / SUPER INGCO. */
export const BRAND_SPLIT_COUPON_CODE = 'koncar10';

export const STANDARD_COUPON_RATE = 0.05;
export const INGCO_COUPON_RATE = 0.1;

/** Katalog cene već uključuju PDV. WooCommerce čuva stavku bez tog poreza i sam ga doda. */
export const INCLUDED_VAT_RATE = 0.2;

export function normalizeCouponCode(code: string): string {
  return code.trim().toLowerCase().slice(0, 40);
}

/** INGCO i SUPER INGCO, uključujući zapise tipa "INGCO - SUPER INGCO". */
export function isIngcoBrand(brand: string): boolean {
  return brand.toLowerCase().includes('ingco');
}

/** Dve decimale, kao WooCommerce `wc_round_discount`. */
export function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/** Iznos bez uračunatog PDV-a, zaokružen kao WooCommerce. */
export function grossToNet(gross: number, rate = INCLUDED_VAT_RATE): number {
  const tax = roundMoney((gross * rate) / (1 + rate));
  return roundMoney(gross - tax);
}

export type CouponLineInput = {
  productId: number;
  quantity: number;
  unitPrice: number;
  brand: string;
  /** False samo kad artikal u WooCommerce-u nije oporeziv. */
  taxable?: boolean;
};

export type CouponLineQuote = CouponLineInput & {
  rate: number;
  lineSubtotal: number;
  discount: number;
  lineTotal: number;
};

export type CouponQuote = {
  code: string;
  subtotal: number;
  discount: number;
  discountedSubtotal: number;
  lines: CouponLineQuote[];
};

export type CouponQuoteOptions = {
  /** Isti procenat na svaku stavku (običan WC kupon). Ignoriše se za koncar10. */
  flatRate?: number | null;
  /** Procena po proizvodu koju je server potvrdio (ima prednost nad brendom iz korpe). */
  rateByProductId?: Record<number, number>;
};

export function isBrandSplitCoupon(code: string): boolean {
  return normalizeCouponCode(code) === BRAND_SPLIT_COUPON_CODE;
}

export function rateForCouponLine(
  code: string,
  brand: string,
  options?: CouponQuoteOptions,
  productId?: number,
): number {
  const override = productId != null ? options?.rateByProductId?.[productId] : undefined;
  if (override != null && Number.isFinite(override)) return override;
  if (isBrandSplitCoupon(code)) {
    return isIngcoBrand(brand) ? INGCO_COUPON_RATE : STANDARD_COUPON_RATE;
  }
  if (options?.flatRate != null && Number.isFinite(options.flatRate)) return options.flatRate;
  return 0;
}

/**
 * Popust ide na prosleđenu cenu stavke (već sniženu, ako je artikal na akciji).
 * INGCO / SUPER INGCO dobijaju 10%, sve ostalo 5%, samo za `koncar10`.
 */
export function quoteCoupon(
  code: string,
  lines: CouponLineInput[],
  options?: CouponQuoteOptions,
): CouponQuote {
  const normalized = normalizeCouponCode(code);
  const quoted: CouponLineQuote[] = lines.map((line) => {
    const rate = rateForCouponLine(normalized, line.brand, options, line.productId);
    const lineSubtotal = roundMoney(line.unitPrice * line.quantity);
    const discount = roundMoney(lineSubtotal * rate);
    const lineTotal = roundMoney(Math.max(0, lineSubtotal - discount));
    return { ...line, rate, lineSubtotal, discount, lineTotal };
  });
  const subtotal = roundMoney(quoted.reduce((sum, line) => sum + line.lineSubtotal, 0));
  const discount = roundMoney(quoted.reduce((sum, line) => sum + line.discount, 0));
  const discountedSubtotal = roundMoney(Math.max(0, subtotal - discount));
  return { code: normalized, subtotal, discount, discountedSubtotal, lines: quoted };
}
