/** WooCommerce Store API — subset used by Končar frontend. */

export type WcStoreAttributeTerm = {
  id: number;
  name: string;
  slug: string;
};

export type WcStoreAttribute = {
  id: number;
  name: string;
  taxonomy: string;
  has_variations: boolean;
  terms: WcStoreAttributeTerm[];
};

export type WcStorePrice = {
  price: string;
  regular_price: string;
  sale_price: string;
  currency_code: string;
  currency_minor_unit: number;
  currency_decimal_separator: string;
  currency_thousand_separator: string;
  currency_prefix: string;
  currency_suffix: string;
};

export type WcStoreImage = {
  id: number;
  src: string;
  thumbnail: string;
  srcset: string;
  sizes: string;
  name: string;
  alt: string;
};

export type WcStoreCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number;
  count: number;
  image: WcStoreImage | null;
  permalink: string;
};

export type WcStoreProduct = {
  id: number;
  name: string;
  slug: string;
  parent: number;
  type: string;
  variation: string;
  permalink: string;
  sku: string;
  short_description: string;
  description: string;
  on_sale: boolean;
  prices: WcStorePrice;
  price_html: string;
  average_rating: string;
  review_count: number;
  images: WcStoreImage[];
  categories: WcStoreCategory[];
  tags: { id: number; name: string; slug: string }[];
  stock_availability: {
    text: string;
    class: string;
  };
  is_in_stock: boolean;
  weight?: string;
  attributes?: WcStoreAttribute[];
  add_to_cart: {
    text: string;
    description: string;
    url: string;
    single_text: string;
    minimum: number;
    maximum: number;
    multiple_of: number;
  };
};

export type WcStoreProductsQuery = {
  page?: number;
  per_page?: number;
  search?: string;
  slug?: string;
  category?: string;
  orderby?: 'date' | 'title' | 'popularity' | 'rating' | 'price';
  order?: 'asc' | 'desc';
  on_sale?: boolean;
  in_stock?: boolean;
  min_price?: number;
  max_price?: number;
  /** Flat keys e.g. attributes[0][attribute], attributes[0][slug] */
  attributeParams?: Record<string, string>;
};

export type WcStoreCategoriesQuery = {
  page?: number;
  per_page?: number;
  parent?: number;
  search?: string;
  slug?: string;
};
