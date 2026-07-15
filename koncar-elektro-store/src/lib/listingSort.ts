export type ListingSort = 'bestsellers' | 'price-asc' | 'price-desc' | 'newest';

export const LISTING_SORT_OPTIONS: { value: ListingSort; label: string }[] = [
  { value: 'bestsellers', label: 'Najprodavanije' },
  { value: 'price-asc', label: 'Cena rastuće' },
  { value: 'price-desc', label: 'Cena opadajuće' },
  { value: 'newest', label: 'Najnovije' },
];

export function listingSortToStoreQuery(sort: ListingSort): {
  orderby: 'date' | 'popularity' | 'price';
  order: 'asc' | 'desc';
} {
  switch (sort) {
    case 'price-asc':
      return { orderby: 'price', order: 'asc' };
    case 'price-desc':
      return { orderby: 'price', order: 'desc' };
    case 'newest':
      return { orderby: 'date', order: 'desc' };
    default:
      return { orderby: 'popularity', order: 'desc' };
  }
}
