'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ChevronDown, X } from 'lucide-react';
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
  BRAND_ATTRIBUTE_SLUG,
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
  /** When false, hide bottom Primeni/Poništi (mobile sheet footer owns them). */
  showActions?: boolean;
};

export type ProductFiltersHandle = {
  apply: () => void;
  clear: () => void;
  isDirty: () => boolean;
};

const OPTION_PAGE_SIZE = 20;

/** Accordion sections open by default — everything else starts collapsed. */
const DEFAULT_OPEN_SECTIONS = new Set(['availability', 'price', BRAND_ATTRIBUTE_SLUG]);

function parsePrice(raw: string): number | undefined {
  if (!raw.trim()) return undefined;
  const n = Number(raw);
  return !Number.isNaN(n) && n > 0 ? n : undefined;
}

function normalizeFilters(filters: ListingFilters): string {
  const attrs = Object.entries(filters.attributes ?? {})
    .filter(([, slugs]) => slugs?.length)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, slugs]) => [key, [...(slugs ?? [])].sort()]);
  return JSON.stringify({
    attributes: attrs,
    priceMin: filters.priceMin ?? null,
    priceMax: filters.priceMax ?? null,
    inStockOnly: Boolean(filters.inStockOnly),
    categorySlug: filters.categorySlug ?? null,
  });
}

function filtersEqual(a: ListingFilters, b: ListingFilters): boolean {
  return normalizeFilters(a) === normalizeFilters(b);
}

function priceInputsFromFilters(filters: ListingFilters) {
  return {
    min: filters.priceMin != null ? String(filters.priceMin) : '',
    max: filters.priceMax != null ? String(filters.priceMax) : '',
  };
}

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
  const [limit, setLimit] = useState(OPTION_PAGE_SIZE);
  const selectedSet = useMemo(
    () => new Set(getSelectedAttributeSlugs(filters, group.slug)),
    [filters, group.slug],
  );

  const visible = group.options.slice(0, limit);
  const hasMore = group.options.length > limit;

  useEffect(() => {
    setLimit(OPTION_PAGE_SIZE);
  }, [group.slug]);

  return (
    <div className="catalog-filters-options">
      {visible.length === 0 ? (
        <p className="text-xs text-muted-foreground py-1">Nema opcija.</p>
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
          Prikaži još ({group.options.length - limit})
        </button>
      )}
    </div>
  );
}

export const ProductFilters = forwardRef<ProductFiltersHandle, Props>(function ProductFilters(
  {
    attributeGroups = [],
    filters,
    onChange,
    onClear,
    variant = 'sidebar',
    className,
    categoryOptions,
    showActions = true,
  },
  ref,
) {
  const showCategory = Boolean(categoryOptions?.length);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [draft, setDraft] = useState<ListingFilters>(filters);
  const [priceDraft, setPriceDraft] = useState(() => priceInputsFromFilters(filters));

  const isSectionOpen = (id: string) => openSections[id] ?? DEFAULT_OPEN_SECTIONS.has(id);

  const brandGroup = useMemo(
    () => attributeGroups.find((g) => g.slug === BRAND_ATTRIBUTE_SLUG),
    [attributeGroups],
  );
  const otherAttributeGroups = useMemo(
    () => attributeGroups.filter((g) => g.slug !== BRAND_ATTRIBUTE_SLUG),
    [attributeGroups],
  );

  // Sync draft when applied filters change from outside (badges, clear, URL).
  useEffect(() => {
    setDraft(filters);
    setPriceDraft(priceInputsFromFilters(filters));
  }, [filters]);

  const draftRef = useRef(draft);
  const priceDraftRef = useRef(priceDraft);
  draftRef.current = draft;
  priceDraftRef.current = priceDraft;
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onClearRef = useRef(onClear);
  onClearRef.current = onClear;

  const pendingFilters = useMemo<ListingFilters>(
    () => ({
      ...draft,
      priceMin: parsePrice(priceDraft.min),
      priceMax: parsePrice(priceDraft.max),
    }),
    [draft, priceDraft.min, priceDraft.max],
  );

  const dirty = !filtersEqual(pendingFilters, filters);
  const hasAppliedFilters = countActiveFilters(filters) > 0;
  const hasDraftFilters = countActiveFilters(pendingFilters) > 0;

  const apply = useCallback(() => {
    const next: ListingFilters = {
      ...draftRef.current,
      priceMin: parsePrice(priceDraftRef.current.min),
      priceMax: parsePrice(priceDraftRef.current.max),
    };
    if (filtersEqual(next, filtersRef.current)) return;
    onChangeRef.current(next);
  }, []);

  const clear = useCallback(() => {
    setDraft({});
    setPriceDraft({ min: '', max: '' });
    onClearRef.current();
  }, []);

  useImperativeHandle(ref, () => ({ apply, clear, isDirty: () => dirty }), [apply, clear, dirty]);

  const priceActiveCount =
    (pendingFilters.priceMin != null && pendingFilters.priceMin > 0 ? 1 : 0) +
    (pendingFilters.priceMax != null && pendingFilters.priceMax > 0 ? 1 : 0);
  const categoryActiveCount = pendingFilters.categorySlug ? 1 : 0;
  const availabilityActiveCount = pendingFilters.inStockOnly ? 1 : 0;
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
          {(hasAppliedFilters || dirty) && (
            <button type="button" onClick={clear} className="catalog-filters-clear">
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
                checked={!draft.categorySlug}
                onChange={() =>
                  setDraft((prev) => ({
                    ...prev,
                    categorySlug: undefined,
                    attributes: undefined,
                  }))
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
                  checked={draft.categorySlug === opt.slug}
                  onChange={() =>
                    setDraft((prev) => ({
                      ...prev,
                      categorySlug: opt.slug,
                      attributes: undefined,
                    }))
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
              checked={Boolean(draft.inStockOnly)}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  inStockOnly: e.target.checked ? true : undefined,
                }))
              }
              className="catalog-filters-input catalog-filters-input--check"
            />
            <span>Samo proizvodi na stanju</span>
          </label>
        </div>
      </FilterSection>

      {brandGroup && (
        <FilterSection
          id={brandGroup.slug}
          title={brandGroup.label}
          open={isSectionOpen(brandGroup.slug)}
          onOpenChange={(open) =>
            setOpenSections((prev) => ({ ...prev, [brandGroup.slug]: open }))
          }
          activeCount={getSelectedAttributeSlugs(draft, brandGroup.slug).length}
        >
          <AttributeOptionsList
            group={brandGroup}
            filters={draft}
            onChange={setDraft}
            variant={variant}
          />
        </FilterSection>
      )}

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
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                apply();
              }
            }}
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                apply();
              }
            }}
            className="catalog-filters-price-input"
          />
        </div>
      </FilterSection>

      {otherAttributeGroups.map((group) => (
        <FilterSection
          key={group.slug}
          id={group.slug}
          title={group.label}
          open={isSectionOpen(group.slug)}
          onOpenChange={(open) => setOpenSections((prev) => ({ ...prev, [group.slug]: open }))}
          activeCount={getSelectedAttributeSlugs(draft, group.slug).length}
        >
          <AttributeOptionsList
            group={group}
            filters={draft}
            onChange={setDraft}
            variant={variant}
          />
        </FilterSection>
      ))}

      {showActions && (
        <div className="catalog-filters-actions">
          <button
            type="button"
            onClick={apply}
            disabled={!dirty}
            className="catalog-filters-action catalog-filters-action--apply"
          >
            Primeni
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={!hasAppliedFilters && !hasDraftFilters}
            className="catalog-filters-action catalog-filters-action--clear"
          >
            Poništi
          </button>
        </div>
      )}
    </aside>
  );
});
