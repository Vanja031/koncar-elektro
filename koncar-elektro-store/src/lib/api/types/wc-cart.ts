/** WooCommerce Store API — cart / checkout subset. */

export type WcStoreAddress = {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
};

export type WcStoreCartItem = {
  key: string;
  id: number;
  quantity: number;
  name: string;
};

export type WcStoreShippingRate = {
  rate_id: string;
  name: string;
  selected: boolean;
};

export type WcStoreShippingPackage = {
  package_id: number | string;
  shipping_rates: WcStoreShippingRate[];
};

export type WcStoreCart = {
  items: WcStoreCartItem[];
  shipping_rates?: WcStoreShippingPackage[];
  needs_shipping?: boolean;
  totals?: {
    total_price?: string;
    total_shipping?: string | null;
    currency_minor_unit?: number;
  };
};

export type WcStoreCheckoutResult = {
  order_id: number;
  status: string;
  order_key: string;
  order_number: string;
  customer_note?: string;
  payment_method?: string;
  payment_result?: {
    payment_status?: string;
    payment_details?: unknown[];
    redirect_url?: string;
  } | null;
};

export type WcStoreApiErrorBody = {
  code?: string;
  message?: string;
  data?: { status?: number; params?: Record<string, string> };
};
