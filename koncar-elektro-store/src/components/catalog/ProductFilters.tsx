import { useMemo, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BrandFilterOption, ListingFilters } from '@/lib/listingFilters';

type Props = {
  brandOptions: BrandFilterOption[];
  filters: ListingFilters;
  onChange: (filters: ListingFilters) => void;
  onClear: () => void;
  variant?: 'sidebar' | 'drawer';
  className?: string;
};

export const ProductFilters = ({
  brandOptions,
  filters,
  onChange,
  onClear,
  variant = 'sidebar',
  className,
}: Props) => {
  const [openIds, setOpenIds] = useState<string[]>(['availability', 'brand', 'price']);
  const [brandQuery, setBrandQuery] = useState('');

  const toggle = (id: string) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const filteredBrands = useMemo(() => {
    const q = brandQuery.trim().toLowerCase();
    if (!q) return brandOptions.slice(0, 40);
    return brandOptions.filter((b) => b.label.toLowerCase().includes(q)).slice(0, 40);
  }, [brandOptions, brandQuery]);

  const hasActiveFilters =
    Boolean(filters.brandSlugs?.length) ||
    (filters.priceMin != null && filters.priceMin > 0) ||
    (filters.priceMax != null && filters.priceMax > 0) ||
    Boolean(filters.inStockOnly);

  const isDrawer = variant === 'drawer';

  return (
    <aside
      className={cn(
        'catalog-filters koncar-scrollbar',
        !isDrawer && 'lg:sticky lg:top-28 lg:self-start lg:max-h-[calc(100vh-8.5rem)] lg:overflow-y-auto lg:overscroll-y-contain',
        isDrawer && 'catalog-filters--drawer',
        className,
      )}
    >
      {!isDrawer && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-primary uppercase text-sm">Filteri</h2>
          {hasActiveFilters && (
            <button type="button" onClick={onClear} className="text-xs text-primary hover:underline">
              Očisti sve
            </button>
          )}
        </div>
      )}

      <div className="border-b border-border py-4">
        <button
          type="button"
          onClick={() => toggle('availability')}
          className="w-full flex items-center justify-between text-sm font-semibold text-foreground"
        >
          Dostupnost
          <ChevronDown className={`w-4 h-4 transition-transform ${openIds.includes('availability') ? 'rotate-180' : ''}`} />
        </button>
        {openIds.includes('availability') && (
          <div className="mt-3 space-y-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(filters.inStockOnly)}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    inStockOnly: e.target.checked ? true : undefined,
                  })
                }
                className="rounded border-border"
              />
              <span>Samo proizvodi na stanju</span>
            </label>
          </div>
        )}
      </div>

      <div className="border-b border-border py-4">
        <button
          type="button"
          onClick={() => toggle('brand')}
          className="w-full flex items-center justify-between text-sm font-semibold text-foreground"
        >
          Brend
          <ChevronDown className={`w-4 h-4 transition-transform ${openIds.includes('brand') ? 'rotate-180' : ''}`} />
        </button>
        {openIds.includes('brand') && (
          <div className="mt-3 space-y-2">
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="search"
                value={brandQuery}
                onChange={(e) => setBrandQuery(e.target.value)}
                placeholder="Pretraži brend..."
                className="w-full border border-border rounded pl-8 pr-3 py-2 text-xs outline-none focus:border-primary"
              />
            </div>
            {filteredBrands.map((opt) => {
              const selected = filters.brandSlugs?.includes(opt.slug) ?? false;
              return (
                <label key={opt.slug} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(e) => {
                      const current = filters.brandSlugs ?? [];
                      const next = e.target.checked
                        ? [...current, opt.slug]
                        : current.filter((s) => s !== opt.slug);
                      onChange({
                        ...filters,
                        brandSlugs: next.length ? next : undefined,
                      });
                    }}
                    className="rounded border-border"
                  />
                  <span className="line-clamp-1">{opt.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-b border-border py-4">
        <button
          type="button"
          onClick={() => toggle('price')}
          className="w-full flex items-center justify-between text-sm font-semibold text-foreground"
        >
          Cena (RSD)
          <ChevronDown className={`w-4 h-4 transition-transform ${openIds.includes('price') ? 'rotate-180' : ''}`} />
        </button>
        {openIds.includes('price') && (
          <div className="flex items-center gap-2 pt-3">
            <input
              type="number"
              min={0}
              placeholder="od"
              value={filters.priceMin ?? ''}
              onChange={(e) =>
                onChange({
                  ...filters,
                  priceMin: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full border border-border rounded px-2 py-1.5 text-xs"
            />
            <span className="text-muted-foreground">–</span>
            <input
              type="number"
              min={0}
              placeholder="do"
              value={filters.priceMax ?? ''}
              onChange={(e) =>
                onChange({
                  ...filters,
                  priceMax: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full border border-border rounded px-2 py-1.5 text-xs"
            />
          </div>
        )}
      </div>

      {hasActiveFilters && !isDrawer && (
        <button type="button" onClick={onClear} className="btn-navy w-full mt-5 text-xs">
          Poništi filtere
        </button>
      )}
    </aside>
  );
};
