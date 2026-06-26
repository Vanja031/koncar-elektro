import { Navigate, useParams } from 'react-router-dom';
import CategoryPage from '@/pages/CategoryPage';
import ProductsPage from '@/pages/ProductsPage';
import { getTopCategoryUrl } from '@/lib/catalogUrls';
import { isProgramCategoryHub, parseProductCategoryPath } from '@/lib/routeParser';
import { wcToProgramSlug } from '@/lib/wcSlugs';

const ProductCategoryRoute = () => {
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
    />
  );
};

export default ProductCategoryRoute;
