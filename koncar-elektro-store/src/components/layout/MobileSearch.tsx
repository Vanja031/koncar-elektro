import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductSearchResults } from '@/components/search/ProductSearchResults';
import { getSearchUrl } from '@/lib/catalogUrls';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const MobileSearch = ({ open, onOpenChange }: Props) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const close = () => onOpenChange(false);

  const goToSearchPage = () => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    navigate(getSearchUrl({ q: trimmed }));
    close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="fixed inset-0 left-0 right-0 top-0 bottom-0 z-[100] flex h-[100dvh] max-h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 flex-col rounded-none border-0 p-0 gap-0 shadow-none data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top [&>button:last-child]:hidden"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">Pretraga proizvoda</DialogTitle>

        <form
          className="flex shrink-0 items-center gap-2 border-b border-border bg-white px-4 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            goToSearchPage();
          }}
        >
          <Search className="w-5 h-5 text-primary shrink-0" />
          <input
            type="text"
            role="searchbox"
            inputMode="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pretražite proizvode, brendove..."
            className="flex-1 text-base outline-none bg-transparent placeholder:text-muted-foreground [appearance:textfield]"
            autoFocus
            autoComplete="off"
            enterKeyHint="search"
          />
          <button
            type="button"
            onClick={close}
            className="p-2 -mr-1 rounded-full hover:bg-secondary transition-colors"
            aria-label="Zatvori pretragu"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </form>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
          <ProductSearchResults
            query={query}
            onResultClick={close}
            onViewAll={goToSearchPage}
            alwaysOfferFullSearch
            className="h-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
