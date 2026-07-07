import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { ProductSearchResults } from '@/components/search/ProductSearchResults';
import { getSearchUrl } from '@/lib/catalogUrls';

export const DesktopProductSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const goToSearchPage = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    navigate(getSearchUrl({ q: trimmed }));
    setOpen(false);
    setQuery('');
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={rootRef} className="relative flex-1 hidden md:flex items-stretch h-11 max-w-xl lg:max-w-2xl mx-auto">
      <form
        className="flex flex-1 items-stretch border border-border rounded overflow-hidden bg-white"
        onSubmit={(e) => {
          e.preventDefault();
          goToSearchPage(query);
        }}
      >
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              goToSearchPage(query);
            }
          }}
          placeholder="Pretražite proizvode, kategorije ili brendove..."
          className="flex-1 px-4 text-sm outline-none bg-white placeholder:text-muted-foreground"
          autoComplete="off"
        />
        <button
          type="submit"
          className="px-4 bg-primary text-white hover:brightness-110 transition-all"
          aria-label="Pretraži"
        >
          <Search className="w-5 h-5" />
        </button>
      </form>

      {open && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-[60] bg-white border border-border rounded-lg shadow-xl overflow-hidden max-h-[min(70vh,28rem)] overflow-y-auto koncar-scrollbar">
          <ProductSearchResults
            query={query}
            onResultClick={() => {
              setOpen(false);
              setQuery('');
            }}
            onViewAll={() => goToSearchPage(query)}
          />
        </div>
      )}
    </div>
  );
};
