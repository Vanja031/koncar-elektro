import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatPrice } from '@/data/homepage';
import { getProductUrl } from '@/data/productDetail';
import { searchKoncarProducts } from '@/data/koncarProducts';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const MobileSearch = ({ open, onOpenChange }: Props) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const results = useMemo(() => searchKoncarProducts(query), [query]);

  const close = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="fixed inset-x-0 top-0 bottom-auto max-w-none translate-x-0 translate-y-0 rounded-none border-0 border-b border-border p-0 gap-0 shadow-xl data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top sm:inset-x-4 sm:top-4 sm:bottom-auto sm:max-w-xl sm:mx-auto sm:rounded-xl sm:border sm:translate-x-0 [&>button:last-child]:hidden"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">Pretraga proizvoda</DialogTitle>

        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-white">
          <Search className="w-5 h-5 text-primary shrink-0" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pretražite proizvode, brendove..."
            className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-foreground"
            autoFocus
            autoComplete="off"
          />
          <button
            type="button"
            onClick={close}
            className="p-2 -mr-1 rounded-full hover:bg-secondary transition-colors"
            aria-label="Zatvori pretragu"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="max-h-[min(70vh,28rem)] overflow-y-auto koncar-scrollbar bg-white">
          {query.trim().length === 0 ? (
            <p className="px-4 py-8 text-sm text-center text-muted-foreground">
              Unesite naziv proizvoda, brend ili kategoriju
            </p>
          ) : results.length === 0 ? (
            <p className="px-4 py-8 text-sm text-center text-muted-foreground">
              Nema rezultata za „{query.trim()}“
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {results.map((product) => (
                <li key={product.id}>
                  <Link
                    to={getProductUrl(product.id)}
                    onClick={close}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-14 h-14 shrink-0 flex items-center justify-center bg-secondary/40 rounded border border-border/60">
                      <img
                        src={product.image}
                        alt=""
                        className="max-h-full max-w-full object-contain p-1"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">{product.brand}</p>
                      <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">{product.name}</p>
                      <p className="text-sm font-display font-bold text-primary mt-0.5">{formatPrice(product.price)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
