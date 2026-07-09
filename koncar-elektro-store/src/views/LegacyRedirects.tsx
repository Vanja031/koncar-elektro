'use client';

import { Navigate, useParams } from '@/lib/router-compat';
import { getProductUrl } from '@/data/productDetail';
import { getProductBySlug } from '@/data/productDetail';
import { getTopCategoryUrl, getProductCategoryUrl } from '@/lib/catalogUrls';
import { programToWcSlug, toWcParentSlug } from '@/lib/wcSlugs';

export const LegacyProductRedirect = () => {
  const { slug = '' } = useParams();
  const product = getProductBySlug(slug);

  if (!product) {
    return <Navigate to={getTopCategoryUrl('alati')} replace />;
  }

  return <Navigate to={getProductUrl(product.id)} replace />;
};

/** 301-style client redirect from dev `/kategorija/*` paths to WooCommerce URLs. */
export const LegacyCategoryRedirect = () => {
  const { '*': splat = '' } = useParams();
  const parts = splat.split('/').filter(Boolean);

  if (parts.length === 0) {
    return <Navigate to={getTopCategoryUrl('alati')} replace />;
  }

  if (parts[0] === 'alati') {
    const rest = parts.slice(1);
    if (rest.length === 0) {
      return <Navigate to={getTopCategoryUrl('alati')} replace />;
    }
    const wcParent = toWcParentSlug(rest[0]);
    const tail = rest.slice(1);
    const target = tail.length
      ? `/product-category/${wcParent}/${tail.join('/')}`
      : getProductCategoryUrl(rest[0]);
    return <Navigate to={target} replace />;
  }

  const program = parts[0];
  const wc = programToWcSlug(program);
  const rest = parts.slice(1);
  const target = rest.length
    ? `/product-category/${wc}/${rest.join('/')}`
    : getTopCategoryUrl(program);

  return <Navigate to={target} replace />;
};
