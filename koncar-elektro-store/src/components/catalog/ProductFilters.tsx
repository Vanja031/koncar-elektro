'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  countActiveFilters,
  getSelectedAttributeSlugs,
  toggleAttributeTerm,
  type AttributeFilterGroup,
  type CategoryFilterOption,
  type ListingFilters,
} from '@/lib/listingFilters';

type Props = {
  attributeGroups: AttributeFilterGroup[];
  filters: ListingFilters;
  onChange: (filters: ListingFilters) => void;
  onClear: () => void;
  variant?: 'sidebar' | 'drawer';
  className?: string;
  categoryOptions?: CategoryFilterOption[];
};

const OPTION_PAGE_SIZE = 20;
const PRICE_DEBOUNCE_MS = 400;

function FilterSection({
  id,
  title,
  open,
  onOpenChange,
  activeCount,
  children,
}: {
  id: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeCount?: number;
  children: ReactNode;
}) {
  const contentId = `filter-section-${id}`;

  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="catalog-filters-section">
      <CollapsibleTrigger
        type="button"
        className="catalog-filters-section-trigger"
        aria-expanded={open}
        aria-controls={contentId}
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="truncate">{title}</span>
          {activeCount != null && activeCount > 0 && (
            <span className="catalog-filters-section-badge" aria-hidden>
              {activeCount}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </CollapsibleTrigger>
      <CollapsibleContent id={contentId} className="catalog-filters-section-content">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function AttributeOptionsList({
  group,
  filters,
  onChange,
  variant,
}: {
  group: AttributeFilterGroup;
  filters: ListingFilters;
  onChange: (filters: ListingFilters) => void;
  variant: string;
}) {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(OPTION_PAGE_SIZE);
  const selectedSet = useMemo(
    () => new Set(getSelectedAttributeSlugs(filters, group.slug)),
    [filters, group.slug],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = q
      ? group.options.filter((o) => o.label.toLowerCase().includes(q))
      : group.options;
    const selected = matched.filter((o) => selectedSet.has(o.slug));
    const rest = matched.filter((o) => !selectedSet.has(o.slug));
    return [...selected, ...rest];
  }, [group.options, query, selectedSet]);

  const visible = filtered.slice(0, limit);
  const hasMore = filtered.length > limit;

  useEffect(() => {
    setLimit(OPTION_PAGE_SIZE);
  }, [query, group.slug]);

  return (
    <div className="catalog-filters-options">
      {group.searchable && (
        <div className="relative mb-1">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Pretraži ${group.label.toLowerCase()}...`}
            className="catalog-filters-search"
            aria-label={`Pretraži ${group.label}`}
          />
        </div>
      )}

      {visible.length === 0 ? (
        <p className="text-xs text-muted-foreground py-1">
          Nema rezultata{query.trim() ? ` za „${query.trim()}”` : ''}.
        </p>
      ) : (
        visible.map((opt) => {
          const selected = selectedSet.has(opt.slug);
          return (
            <label key={opt.slug} className="catalog-filters-option">
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) =>
                  onChange(toggleAttributeTerm(filters, group.slug, opt.slug, e.target.checked))
                }
                className="catalog-filters-input catalog-filters-input--check"
                name={`filter-${group.slug}-${variant}`}
              />
              <span className="line-clamp-1">{opt.label}</span>
            </label>
          );
        })
      )}

      {hasMore && (
        <button
          type="button"
          onClick={() => setLimit((n) => n + OPTION_PAGE_SIZE)}
          className="catalog-filters-more"
        >
          Prikaži još ({filtered.length - limit})
        </button>
      )}
    </div>
  );
}

export const ProductFilters = ({
  attributeGroups = [],
  filters,
  onChange,
  onClear,
  variant = 'sidebar',
  className,
  categoryOptions,
}: Props) => {
  const showCategory = Boolean(categoryOptions?.length);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [priceDraft, setPriceDraft] = useState({
    min: filters.priceMin != null ? String(filters.priceMin) : '',
    max: filters.priceMax != null ? String(filters.priceMax) : '',
  });
  const filtersRef = useRef(filters);
  const onChangeRef = useRef(onChange);
  filtersRef.current = filters;
  onChangeRef.current = onChange;

  const isSectionOpen = (id: string) => openSections[id] ?? true;

  useEffect(() => {
    if (filters.priceMin == null && filters.priceMax == null) {
      setPriceDraft((prev) =>
        prev.min === '' && prev.max === '' ? prev : { min: '', max: '' },
      );
    }
  }, [filters.priceMin, filters.priceMax]);

  useEffect(() => {
    const nextMinRaw = priceDraft.min ? Number(priceDraft.min) : undefined;
    const nextMaxRaw = priceDraft.max ? Number(priceDraft.max) : undefined;
    const nextMin =
      nextMinRaw != null && !Number.isNaN(nextMinRaw) && nextMinRaw > 0 ? nextMinRaw : undefined;
    const nextMax =
      nextMaxRaw != null && !Number.isNaN(nextMaxRaw) && nextMaxRaw > 0 ? nextMaxRaw : undefined;

    const current = filtersRef.current;
    if (nextMin === current.priceMin && nextMax === current.priceMax) return;

    const timer = window.setTimeout(() => {
      onChangeRef.current({
        ...filtersRef.current,
        priceMin: nextMin,
        priceMax: nextMax,
      });
    }, PRICE_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [priceDraft.min, priceDraft.max]);

  const hasActiveFilters = countActiveFilters(filters) > 0;
  const priceActiveCount =
    (filters.priceMin != null && filters.priceMin > 0 ? 1 : 0) +
    (filters.priceMax != null && filters.priceMax > 0 ? 1 : 0);
  const categoryActiveCount = filters.categorySlug ? 1 : 0;
  const availabilityActiveCount = filters.inStockOnly ? 1 : 0;
  const isDrawer = variant === 'drawer';

  return (
    <aside
      className={cn(
        'catalog-filters',
        isDrawer && 'catalog-filters--drawer',
        className,
      )}
    >
      {!isDrawer && (
        <div className="catalog-filters-header">
          <h2 className="font-display font-bold text-primary uppercase text-sm tracking-wide">
            Filteri
          </h2>
          {hasActiveFilters && (
            <button type="button" onClick={onClear} className="catalog-filters-clear">
              <X className="w-3.5 h-3.5" aria-hidden />
              Očisti
            </button>
          )}
        </div>
      )}

      {showCategory && (
        <FilterSection
          id="category"
          title="Kategorija"
          open={isSectionOpen('category')}
          onOpenChange={(open) => setOpenSections((prev) => ({ ...prev, category: open }))}
          activeCount={categoryActiveCount}
        >
          <div className="catalog-filters-options">
            <label className="catalog-filters-option">
              <input
                type="radio"
                name={`catalog-category-${variant}`}
                checked={!filters.categorySlug}
                onChange={() =>
                  onChange({ ...filters, categorySlug: undefined, attributes: undefined })
                }
                className="catalog-filters-input"
              />
              <span>Sve kategorije</span>
            </label>
            {categoryOptions!.map((opt) => (
              <label key={opt.slug} className="catalog-filters-option">
                <input
                  type="radio"
                  name={`catalog-category-${variant}`}
                  checked={filters.categorySlug === opt.slug}
                  onChange={() =>
                    onChange({ ...filters, categorySlug: opt.slug, attributes: undefined })
                  }
                  className="catalog-filters-input"
                />
                <span className="leading-snug">{opt.label}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      <FilterSection
        id="availability"
        title="Dostupnost"
        open={isSectionOpen('availability')}
        onOpenChange={(open) => setOpenSections((prev) => ({ ...prev, availability: open }))}
        activeCount={availabilityActiveCount}
      >
        <div className="catalog-filters-options">
          <label className="catalog-filters-option">
            <input
              type="checkbox"
              checked={Boolean(filters.inStockOnly)}
              onChange={(e) =>
                onChange({
                  ...filters,
                  inStockOnly: e.target.checked ? true : undefined,
                })
              }
              className="catalog-filters-input catalog-filters-input--check"
            />
            <span>Samo proizvodi na stanju</span>
          </label>
        </div>
      </FilterSection>

      {attributeGroups.map((group) => (
        <FilterSection
          key={group.slug}
          id={group.slug}
          title={group.label}
          open={isSectionOpen(group.slug)}
          onOpenChange={(open) => setOpenSections((prev) => ({ ...prev, [group.slug]: open }))}
          activeCount={getSelectedAttributeSlugs(filters, group.slug).length}
        >
          <AttributeOptionsList
            group={group}
            filters={filters}
            onChange={onChange}
            variant={variant}
          />
        </FilterSection>
      ))}

      <FilterSection
        id="price"
        title="Cena (RSD)"
        open={isSectionOpen('price')}
        onOpenChange={(open) => setOpenSections((prev) => ({ ...prev, price: open }))}
        activeCount={priceActiveCount}
      >
        <div className="catalog-filters-price">
          <label className="sr-only" htmlFor={`price-min-${variant}`}>
            Minimalna cena
          </label>
          <input
            id={`price-min-${variant}`}
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Od"
            value={priceDraft.min}
            onChange={(e) => setPriceDraft((prev) => ({ ...prev, min: e.target.value }))}
            className="catalog-filters-price-input"
          />
          <span className="text-muted-foreground text-xs" aria-hidden>
            –
          </span>
          <label className="sr-only" htmlFor={`price-max-${variant}`}>
            Maksimalna cena
          </label>
          <input
            id={`price-max-${variant}`}
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Do"
            value={priceDraft.max}
            onChange={(e) => setPriceDraft((prev) => ({ ...prev, max: e.target.value }))}
            className="catalog-filters-price-input"
          />
        </div>
      </FilterSection>

      {hasActiveFilters && !isDrawer && (
        <button type="button" onClick={onClear} className="btn-navy w-full mt-4 text-xs">
          Poništi filtere
        </button>
      )}
    </aside>
  );
};
