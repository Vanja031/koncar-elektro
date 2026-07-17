'use client';

import { X } from 'lucide-react';
import {
  getActiveFilterChips,
  removeActiveFilterChip,
  type ActiveFilterChip,
  type AttributeFilterGroup,
  type CategoryFilterOption,
  type ListingFilters,
} from '@/lib/listingFilters';

type Props = {
  filters: ListingFilters;
  onChange: (filters: ListingFilters) => void;
  onClear: () => void;
  attributeGroups?: AttributeFilterGroup[];
  categoryOptions?: CategoryFilterOption[];
  className?: string;
};

export const ActiveFilterBadges = ({
  filters,
  onChange,
  onClear,
  attributeGroups,
  categoryOptions,
  className,
}: Props) => {
  const chips = getActiveFilterChips(filters, { attributeGroups, categoryOptions });
  if (chips.length === 0) return null;

  const remove = (chip: ActiveFilterChip) => {
    onChange(removeActiveFilterChip(filters, chip));
  };

  return (
    <div className={className ?? 'catalog-active-filters'}>
      <div className="catalog-active-filters-list" role="list" aria-label="Aktivni filteri">
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            role="listitem"
            onClick={() => remove(chip)}
            className="catalog-active-filter-badge"
            aria-label={`Ukloni filter: ${chip.label}`}
          >
            <span className="truncate max-w-[14rem]">{chip.label}</span>
            <X className="w-3.5 h-3.5 shrink-0 opacity-70" aria-hidden />
          </button>
        ))}
      </div>
      <button type="button" onClick={onClear} className="catalog-active-filters-clear">
        Ukloni sve
      </button>
    </div>
  );
};
