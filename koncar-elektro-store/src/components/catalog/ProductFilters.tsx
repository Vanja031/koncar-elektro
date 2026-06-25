import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import type { FilterGroup } from '@/data/catalogListing';

type Props = {
  filters: FilterGroup[];
};

export const ProductFilters = ({ filters }: Props) => {
  const [openIds, setOpenIds] = useState<string[]>(filters.map((f) => f.id));

  const toggle = (id: string) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <aside className="catalog-filters koncar-scrollbar">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-primary uppercase text-sm">Filteri</h2>
        <button type="button" className="text-xs text-primary hover:underline">Očisti sve</button>
      </div>

      {filters.map((group) => {
        const isOpen = openIds.includes(group.id);
        return (
          <div key={group.id} className="border-b border-border py-4">
            <button
              type="button"
              onClick={() => toggle(group.id)}
              className="w-full flex items-center justify-between text-sm font-semibold text-foreground"
            >
              {group.label}
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && group.options && (
              <div className="mt-3 space-y-2">
                {group.id === 'brand' && (
                  <div className="relative mb-3">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="search"
                      placeholder="Pretraži brend..."
                      className="w-full border border-border rounded pl-8 pr-3 py-2 text-xs outline-none focus:border-primary"
                    />
                  </div>
                )}
                {group.options.map((opt) => (
                  <label key={opt.label} className="flex items-center justify-between gap-2 text-sm cursor-pointer">
                    <span className="flex items-center gap-2">
                      <input type={group.type === 'radio' ? 'radio' : 'checkbox'} name={group.id} className="rounded border-border" />
                      <span>{opt.label}</span>
                    </span>
                    {opt.count != null && <span className="text-xs text-muted-foreground">({opt.count})</span>}
                  </label>
                ))}
                {group.id === 'price' && (
                  <div className="flex items-center gap-2 pt-2">
                    <input type="number" placeholder="od" className="w-full border border-border rounded px-2 py-1.5 text-xs" />
                    <span className="text-muted-foreground">–</span>
                    <input type="number" placeholder="do" className="w-full border border-border rounded px-2 py-1.5 text-xs" />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <button type="button" className="btn-navy w-full mt-5 text-xs">Poništi filtere</button>
    </aside>
  );
};
