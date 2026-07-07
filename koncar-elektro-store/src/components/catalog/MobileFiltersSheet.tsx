import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ProductFilters } from '@/components/catalog/ProductFilters';
import {
  countActiveFilters,
  type BrandFilterOption,
  type ListingFilters,
} from '@/lib/listingFilters';

type Props = {
  brandOptions: BrandFilterOption[];
  filters: ListingFilters;
  onChange: (filters: ListingFilters) => void;
  onClear: () => void;
};

export const MobileFiltersSheet = ({ brandOptions, filters, onChange, onClear }: Props) => {
  const [open, setOpen] = useState(false);
  const activeCount = countActiveFilters(filters);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="catalog-filters-mobile-trigger"
        aria-expanded={open}
      >
        <SlidersHorizontal className="w-4 h-4 shrink-0" aria-hidden />
        <span>Filteri</span>
        {activeCount > 0 && (
          <span className="catalog-filters-mobile-badge" aria-label={`${activeCount} aktivnih filtera`}>
            {activeCount}
          </span>
        )}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="catalog-filters-sheet w-full max-w-[min(100vw,24rem)] p-0 flex flex-col gap-0 border-l border-border"
        >
          <SheetHeader className="catalog-filters-sheet-header shrink-0 px-5 py-4 pr-12 border-b border-border text-left space-y-0">
            <SheetTitle className="font-display font-bold text-primary uppercase tracking-wide text-base">
              Filteri
            </SheetTitle>
            {activeCount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {activeCount} {activeCount === 1 ? 'aktivan filter' : 'aktivna filtera'}
              </p>
            )}
          </SheetHeader>

          <div className="flex-1 min-h-0 overflow-y-auto koncar-scrollbar px-5">
            <ProductFilters
              variant="drawer"
              brandOptions={brandOptions}
              filters={filters}
              onChange={onChange}
              onClear={onClear}
            />
          </div>

          <SheetFooter className="catalog-filters-sheet-footer shrink-0 border-t border-border p-4 gap-2 sm:flex-col sm:space-x-0">
            {activeCount > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="w-full border border-border rounded py-2.5 text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
              >
                Očisti filtere
              </button>
            )}
            <button type="button" onClick={() => setOpen(false)} className="btn-navy w-full text-sm">
              Prikaži rezultate
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};
