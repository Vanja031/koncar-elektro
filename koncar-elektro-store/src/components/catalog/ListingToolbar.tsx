import { ChevronDown, LayoutGrid, List } from 'lucide-react';
import type { ListingSort } from '@/lib/listingSort';
import { LISTING_SORT_OPTIONS } from '@/lib/listingSort';

export const LISTING_PER_PAGE_OPTIONS = [24, 48, 72] as const;
export type ListingPerPage = (typeof LISTING_PER_PAGE_OPTIONS)[number];

type Props = {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  productCount?: number;
  perPage?: ListingPerPage;
  onPerPageChange?: (perPage: ListingPerPage) => void;
  sort?: ListingSort;
  onSortChange?: (sort: ListingSort) => void;
};

export const ListingToolbar = ({
  view,
  onViewChange,
  productCount,
  perPage = 24,
  onPerPageChange,
  sort = 'bestsellers',
  onSortChange,
}: Props) => (
  <div className="catalog-toolbar">
    <div className="catalog-toolbar-left">
      <div className="catalog-toolbar-line catalog-toolbar-line--sort">
        <div className="catalog-toolbar-field catalog-toolbar-field--sort">
          <label htmlFor="sort-by" className="catalog-toolbar-label">Sortiraj</label>
          <div className="relative catalog-toolbar-select-wrap">
            <select
              id="sort-by"
              className="catalog-toolbar-select"
              value={sort}
              onChange={(e) => onSortChange?.(e.target.value as ListingSort)}
              disabled={!onSortChange}
            >
              {LISTING_SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        {productCount != null && (
          <p className="catalog-toolbar-count">
            <span className="font-semibold text-foreground">{productCount}</span> proizvoda
          </p>
        )}
      </div>

      <div className="catalog-toolbar-line catalog-toolbar-line--meta">
        <div className="catalog-toolbar-field catalog-toolbar-field--per-page">
          <label htmlFor="per-page" className="catalog-toolbar-label">Prikaži</label>
          <div className="relative catalog-toolbar-select-wrap">
            <select
              id="per-page"
              className="catalog-toolbar-select catalog-toolbar-select--compact"
              value={perPage}
              onChange={(e) => onPerPageChange?.(Number(e.target.value) as ListingPerPage)}
              disabled={!onPerPageChange}
            >
              {LISTING_PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>
    </div>

    <div className="catalog-view-toggle" role="group" aria-label="Prikaz proizvoda">
      <button
        type="button"
        onClick={() => onViewChange('grid')}
        className={view === 'grid' ? 'catalog-view-toggle-btn--active' : 'catalog-view-toggle-btn'}
        aria-label="Mreža"
        aria-pressed={view === 'grid'}
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onViewChange('list')}
        className={view === 'list' ? 'catalog-view-toggle-btn--active' : 'catalog-view-toggle-btn'}
        aria-label="Lista"
        aria-pressed={view === 'list'}
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  </div>
);
