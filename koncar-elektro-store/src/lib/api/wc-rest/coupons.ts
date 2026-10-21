/**
 * Server-only coupon check. Reads WooCommerce coupons and product prices.
 * Does not create orders. A successful checkout records one use afterwards.
 */
import { wcV3Fetch, WcRestError } from '@/lib/api/wc-rest/client';
import {
  isBrandSplitCoupon,
  grossToNet,
  quoteCoupon,
  roundMoney,
  type CouponLineInput,
  type CouponQuote,
} from '@/lib/coupon';

export class CouponError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'CouponError';
    this.status = status;
  }
}

type WcCoupon = {
  id: number;
  code: string;
  amount: string;
  discount_type: string;
  date_expires: string | null;
  date_expires_gmt: string | null;
  usage_count: number;
  usage_limit: number | null;
  usage_limit_per_user: number | null;
  minimum_amount: string;
  maximum_amount: string;
  email_restrictions: string[];
  exclude_sale_items?: boolean;
  used_by: string[];
};

type WcProductForCoupon = {
  id: number;
  price: string;
  regular_price?: string;
  sale_price?: string;
  on_sale?: boolean;
  tax_status?: string;
  attributes?: Array<{ name?: string; slug?: string; options?: string[] }>;
};

export type CouponKind = 'brand-split' | 'percent';

export type ResolvedCoupon = {
  quote: CouponQuote;
  kind: CouponKind;
  flatRate: number | null;
  redemption?: {
    id: number;
    usageCount: number;
    usedBy: string[];
    email: string;
  };
};

export type PricedCheckoutItem = {
  productId: number;
  quantity: number;
  subtotal?: string;
  total?: string;
};

export type PricedCheckout = {
  subtotal: number;
  items: PricedCheckoutItem[];
  meta: Array<{ key: string; value: string }>;
  note?: string;
  redemption?: ResolvedCoupon['redemption'];
};

function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'dj')
    .replace(/Đ/g, 'dj')
    .toLowerCase()
    .trim();
}

function isBrandAttribute(attr: { name?: string; slug?: string }): boolean {
  const slug = (attr.slug ?? '').toLowerCase();
  if (slug === 'pa_proizvodjac' || slug === 'pa_brend') return true;
  const name = fold(attr.name ?? '');
  return name === 'proizvodjac' || name === 'brend';
}

function productOnSale(product: WcProductForCoupon): boolean {
  if (product.on_sale) return true;
  const sale = Number(product.sale_price);
  const regular = Number(product.regular_price);
  return Number.isFinite(sale) && sale > 0 && Number.isFinite(regular) && sale < regular;
}

function brandFromProduct(product: WcProductForCoupon): string {
  for (const attr of product.attributes ?? []) {
    if (!isBrandAttribute(attr)) continue;
    const option = attr.options?.find((value) => value.trim());
    if (option) return option.trim();
  }
  return '';
}

let warnedCouponPermission = false;

async function findCoupon(code: string): Promise<WcCoupon | null> {
  try {
    const coupons = await wcV3Fetch<WcCoupon[]>(`coupons?code=${encodeURIComponent(code)}`);
    return coupons.find((coupon) => coupon.code.toLowerCase() === code) ?? null;
  } catch (error) {
    if (error instanceof WcRestError && error.status === 404) return null;
    // The shop key can price products but may not be allowed to list coupons.
    // Brand-split codes still apply; other codes are rejected as unknown.
    if (error instanceof WcRestError && error.status === 403) {
      if (!warnedCouponPermission) {
        warnedCouponPermission = true;
        console.warn('[coupon] WooCommerce key cannot read coupons. koncar10 still applies; expiry and usage limits are not checked.');
      }
      return null;
    }
    throw error;
  }
}

async function fetchProducts(ids: number[]): Promise<Map<number, WcProductForCoupon>> {
  const unique = [...new Set(ids)];
  const map = new Map<number, WcProductForCoupon>();
  for (let index = 0; index < unique.length; index += 100) {
    const chunk = unique.slice(index, index + 100);
    const products = await wcV3Fetch<WcProductForCoupon[]>(
      `products?include=${chunk.join(',')}&per_page=${chunk.length}`,
    );
    for (const product of products) map.set(product.id, product);
  }
  if (map.size !== unique.length) {
    throw new CouponError('Jedan artikal iz korpe više nije u ponudi.');
  }
  return map;
}

function assertCouponUsable(coupon: WcCoupon, subtotal: number, email?: string) {
  const expiresAt = Date.parse(coupon.date_expires_gmt || coupon.date_expires || '');
  if (Number.isFinite(expiresAt) && Date.now() > expiresAt) {
    throw new CouponError('Kod je istekao.');
  }
  if (coupon.usage_limit != null && coupon.usage_limit > 0 && coupon.usage_count >= coupon.usage_limit) {
    throw new CouponError('Kod je iskorišćen.');
  }
  const minimum = Number(coupon.minimum_amount);
  if (Number.isFinite(minimum) && minimum > 0 && subtotal + 0.001 < minimum) {
    throw new CouponError(`Kod važi za porudžbine od ${Math.round(minimum)} RSD.`);
  }
  const maximum = Number(coupon.maximum_amount);
  if (Number.isFinite(maximum) && maximum > 0 && subtotal > maximum + 0.001) {
    throw new CouponError('Iznos korpe je veći od dozvoljenog za ovaj kod.');
  }
  if (email && coupon.email_restrictions?.length) {
    const allowed = coupon.email_restrictions.map((value) => value.toLowerCase());
    if (!allowed.includes(email.toLowerCase())) {
      throw new CouponError('Kod nije važeći za ovu email adresu.');
    }
  }
  if (email && coupon.usage_limit_per_user != null && coupon.usage_limit_per_user > 0) {
    const uses = (coupon.used_by ?? []).filter((value) => value.toLowerCase() === email.toLowerCase()).length;
    if (uses >= coupon.usage_limit_per_user) {
      throw new CouponError('Kod je već iskorišćen za ovu email adresu.');
    }
  }
}

function linesFromProducts(
  items: Array<{ productId: number; quantity: number }>,
  products: Map<number, WcProductForCoupon>,
): CouponLineInput[] {
  return items.map((item) => {
    const product = products.get(item.productId);
    if (!product) throw new CouponError('Jedan artikal iz korpe više nije u ponudi.');
    const price = Number(product.price);
    if (!Number.isFinite(price) || price < 0) {
      throw new CouponError('Cena jednog artikla nije dostupna.');
    }
    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: Math.round(price),
      brand: brandFromProduct(product),
      taxable: product.tax_status !== 'none',
    };
  });
}

/**
 * Confirms the code and prices the cart from WooCommerce.
 * `koncar10` keeps the 5% / 10% split even when the WP coupon amount is a single percent.
 * Other codes must be a WooCommerce percentage coupon.
 */
export async function resolveCoupon(
  rawCode: string,
  items: Array<{ productId: number; quantity: number }>,
  email?: string,
): Promise<ResolvedCoupon> {
  const code = rawCode.trim().toLowerCase();
  if (!code) throw new CouponError('Unesite kod za popust.');
  if (!items.length) throw new CouponError('Korpa je prazna.');

  let coupon: WcCoupon | null;
  let products: Map<number, WcProductForCoupon>;
  try {
    [coupon, products] = await Promise.all([findCoupon(code), fetchProducts(items.map((item) => item.productId))]);
  } catch (error) {
    if (error instanceof CouponError) throw error;
    console.error('[coupon] lookup failed', error);
    throw new CouponError('Kod trenutno ne možemo da proverimo. Pokušajte ponovo.', 503);
  }

  const lines = linesFromProducts(items, products);
  const catalogSubtotal = roundMoney(lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0));

  if (coupon) assertCouponUsable(coupon, catalogSubtotal, email);

  if (isBrandSplitCoupon(code)) {
    const quote = quoteCoupon(code, lines);
    return {
      quote,
      kind: 'brand-split',
      flatRate: null,
      redemption: coupon && email
        ? { id: coupon.id, usageCount: coupon.usage_count ?? 0, usedBy: coupon.used_by ?? [], email }
        : undefined,
    };
  }

  if (!coupon) throw new CouponError('Kod nije važeći.');
  if (coupon.discount_type !== 'percent') {
    throw new CouponError('Ovaj tip koda još nije podržan.');
  }
  const percent = Number(coupon.amount);
  if (!Number.isFinite(percent) || percent <= 0 || percent > 100) {
    throw new CouponError('Kod nije ispravno podešen.');
  }
  const flatRate = percent / 100;
  const rateByProductId = coupon.exclude_sale_items
    ? Object.fromEntries(
        lines.map((line) => {
          const product = products.get(line.productId);
          const rate = product && productOnSale(product) ? 0 : flatRate;
          return [line.productId, rate];
        }),
      )
    : undefined;
  return {
    quote: quoteCoupon(code, lines, rateByProductId ? { flatRate, rateByProductId } : { flatRate }),
    kind: 'percent',
    flatRate,
    redemption: email
      ? { id: coupon.id, usageCount: coupon.usage_count ?? 0, usedBy: coupon.used_by ?? [], email }
      : undefined,
  };
}

/** Replaces client totals when a code is present. Without a code, the cart snapshot is unchanged. */
export async function priceCheckout(input: {
  couponCode?: string | null;
  items: Array<{ productId: number; quantity: number }>;
  subtotal: number;
  email?: string;
}): Promise<PricedCheckout> {
  const code = input.couponCode?.trim().toLowerCase() ?? '';
  if (!code) {
    return { subtotal: input.subtotal, items: input.items, meta: [] };
  }

  const resolved = await resolveCoupon(code, input.items, input.email);
  const quote = resolved.quote;
  return {
    subtotal: quote.discountedSubtotal,
    items: quote.lines.map((line) => {
      const taxable = line.taxable !== false;
      return {
        productId: line.productId,
        quantity: line.quantity,
        // WC treats these fields as amounts without PDV, then adds 20%.
        subtotal: (taxable ? grossToNet(line.lineSubtotal) : line.lineSubtotal).toFixed(2),
        total: (taxable ? grossToNet(line.lineTotal) : line.lineTotal).toFixed(2),
      };
    }),
    meta: [
      { key: '_koncar_coupon_code', value: quote.code },
      { key: '_koncar_coupon_discount', value: quote.discount.toFixed(2) },
    ],
    note: `Primenjen kod ${quote.code}. Popust ${quote.discount.toFixed(2)} RSD.`,
    redemption: resolved.redemption,
  };
}

export async function recordCouponRedemption(
  redemption: NonNullable<ResolvedCoupon['redemption']>,
): Promise<void> {
  const email = redemption.email.trim();
  try {
    await wcV3Fetch(`coupons/${redemption.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        usage_count: redemption.usageCount + 1,
        ...(email ? { used_by: [...redemption.usedBy, email] } : {}),
      }),
    });
  } catch (error) {
    console.error('[coupon] failed to record use', error);
  }
}
