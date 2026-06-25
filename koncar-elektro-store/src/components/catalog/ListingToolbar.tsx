import { ChevronDown, LayoutGrid, List } from 'lucide-react';

type Props = {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
};

export const ListingToolbar = ({ view, onViewChange }: Props) => (
  <div className="catalog-toolbar">
    <div className="flex flex-wrap items-center gap-3">
      <div className="catalog-toolbar-field">
        <label htmlFor="sort-by" className="catalog-toolbar-label">Sortiraj</label>
        <div className="relative">
          <select id="sort-by" className="catalog-toolbar-select" defaultValue="bestsellers">
            <option value="bestsellers">Najprodavanije</option>
            <option value="price-asc">Cena rastuće</option>
            <option value="price-desc">Cena opadajuće</option>
            <option value="newest">Najnovije</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>
      <div className="catalog-toolbar-field">
        <label htmlFor="per-page" className="catalog-toolbar-label">Prikaži</label>
        <div className="relative">
          <select id="per-page" className="catalog-toolbar-select catalog-toolbar-select--compact" defaultValue="20">
            <option value="20">20</option>
            <option value="40">40</option>
            <option value="60">60</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
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
