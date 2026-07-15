'use client';

import { Navigate, useParams } from '@/lib/router-compat';
import CategoryPage from '@/views/CategoryPage';
import ProductsPage from '@/views/ProductsPage';
import { getTopCategoryUrl } from '@/lib/catalogUrls';
import { isProgramCategoryHub, parseProductCategoryPath } from '@/lib/routeParser';
import { wcToProgramSlug } from '@/lib/wcSlugs';
import type { LiveProductsResult } from '@/hooks/api/useLiveCatalog';

type Props = {
  initialListing?: LiveProductsResult;
};

const ProductCategoryRoute = ({ initialListing }: Props) => {
  const { '*': splat = '' } = useParams();
  const segments = splat.split('/').filter(Boolean);

  if (segments.length === 0) {
    return <Navigate to={getTopCategoryUrl('alati')} replace />;
  }

  if (isProgramCategoryHub(segments)) {
    const programSlug = wcToProgramSlug(segments[0]);
    if (programSlug) {
      return <CategoryPage programSlug={programSlug} />;
    }
  }

  const parsed = parseProductCategoryPath(segments);
  if (!parsed) {
    return <Navigate to={getTopCategoryUrl('alati')} replace />;
  }

  return (
    <ProductsPage
      categorySlug={parsed.categorySlug}
      parentSlug={parsed.parentSlug}
      listingSlug={parsed.listingSlug}
      initialListing={initialListing}
    />
  );
};

export default ProductCategoryRoute;
