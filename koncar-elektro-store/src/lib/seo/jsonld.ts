import { companyInfo } from '@/data/staticPages';
import type { BreadcrumbItem } from '@/data/categoryPages';
import type { ProductDetail } from '@/data/productDetail';
import { absoluteUrl, CANONICAL_SITE_URL, SITE_NAME } from '@/lib/seo/site';

/** JSON-LD for a schema.org node. Kept loose (Record) — schema.org has no official TS types. */
export type JsonLd = Record<string, unknown>;

/** Organization schema — emitted once, globally, in the root layout. */
export function buildOrganizationJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${CANONICAL_SITE_URL}/#organization`,
    name: companyInfo.name,
    legalName: companyInfo.legalName,
    url: CANONICAL_SITE_URL,
    logo: `${CANONICAL_SITE_URL}/favicon.jpg`,
    image: `${CANONICAL_SITE_URL}/favicon.jpg`,
    description: companyInfo.tagline,
    address: {
      '@type': 'PostalAddress',
      streetAddress: companyInfo.address.street,
      addressLocality: companyInfo.address.city,
      postalCode: companyInfo.address.postal,
      addressCountry: 'RS',
    },
    contactPoint: companyInfo.phones.map((phone) => ({
      '@type': 'ContactPoint',
      telephone: phone,
      contactType: 'customer service',
      email: companyInfo.email,
      areaServed: 'RS',
      availableLanguage: ['sr'],
    })),
  };
}

/** WebSite schema with a sitelinks search box — helps Google show the site search bar. */
export function buildWebsiteJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${CANONICAL_SITE_URL}/#website`,
    url: CANONICAL_SITE_URL,
    name: SITE_NAME,
    publisher: { '@id': `${CANONICAL_SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${CANONICAL_SITE_URL}/pretraga?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/** BreadcrumbList schema built from the same items rendered by <Breadcrumbs>. */
export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  };
}

/** Product schema for a PDP — availability/price drive Google Shopping rich results. */
export function buildProductJsonLd(product: ProductDetail, pathname: string): JsonLd {
  const url = absoluteUrl(pathname);
  const images = product.gallery.length > 0 ? product.gallery : product.image ? [product.image] : [];

  const node: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.name,
    description: product.longDescription || product.description,
    sku: product.sku,
    ...(images.length > 0 ? { image: images } : {}),
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'RSD',
      price: product.price,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${CANONICAL_SITE_URL}/#organization` },
    },
  };

  if (product.reviews > 0 && product.rating > 0) {
    node.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviews,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return node;
}

/** Render a `<script type="application/ld+json">` — call from server components only. */
export function jsonLdScriptProps(data: JsonLd | JsonLd[]) {
  return {
    type: 'application/ld+json' as const,
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  };
}
