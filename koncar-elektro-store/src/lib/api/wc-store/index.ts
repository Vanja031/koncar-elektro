import { getStoreProductBySlug, getStoreProducts } from '@/lib/api/wc-store/products';
import { getStoreCategories } from '@/lib/api/wc-store/categories';

export { getStoreCategories, getStoreCategoryBySlug, getStoreTopLevelCategories } from './categories';
export { getStoreProductById, getStoreProductBySlug, getStoreProducts } from './products';

export type StoreProductsQuery = Parameters<typeof getStoreProducts>[0];
