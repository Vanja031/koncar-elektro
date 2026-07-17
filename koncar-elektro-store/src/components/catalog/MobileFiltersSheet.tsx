'use client';

import { useRef, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  ProductFilters,
  type ProductFiltersHandle,
} from '@/components/catalog/ProductFilters';
import {
  countActiveFilters,
  type AttributeFilterGroup,
  type CategoryFilterOption,
  type ListingFilters,
} from '@/lib/listingFilters';

type Props = {
  attributeGroups: AttributeFilterGroup[];
  filters: ListingFilters;
  onChange: (filters: ListingFilters) => void;
  onClear: () => void;
  categoryOptions?: CategoryFilterOption[];
};

export const MobileFiltersSheet = ({
  attributeGroups = [],
  filters,
  onChange,
  onClear,
  categoryOptions,
}: Props) => {
  const [open, setOpen] = useState(false);
  const filtersRef = useRef<ProductFiltersHandle>(null);
  const activeCount = countActiveFilters(filters);

  const handleApply = () => {
    filtersRef.current?.apply();
    setOpen(false);
  };

  const handleClear = () => {
    filtersRef.current?.clear();
  };

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
            <div className="flex items-center justify-between gap-3">
              <SheetTitle className="font-display font-bold text-primary uppercase tracking-wide text-base">
                Filteri
              </SheetTitle>
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="catalog-filters-clear shrink-0"
                >
                  <X className="w-3.5 h-3.5" aria-hidden />
                  Očisti
                </button>
              )}
            </div>
            {activeCount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {activeCount} {activeCount === 1 ? 'aktivan filter' : 'aktivna filtera'}
              </p>
            )}
          </SheetHeader>

          <div className="flex-1 min-h-0 overflow-y-auto koncar-scrollbar px-5">
            <ProductFilters
              ref={filtersRef}
              variant="drawer"
              showActions={false}
              attributeGroups={attributeGroups}
              categoryOptions={categoryOptions}
              filters={filters}
              onChange={onChange}
              onClear={onClear}
            />
          </div>

          <SheetFooter className="catalog-filters-sheet-footer shrink-0 border-t border-border p-4 gap-2 sm:flex-col sm:space-x-0">
            <button
              type="button"
              onClick={handleApply}
              className="catalog-filters-action catalog-filters-action--apply"
            >
              Primeni
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="catalog-filters-action catalog-filters-action--clear"
            >
              Poništi
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};
