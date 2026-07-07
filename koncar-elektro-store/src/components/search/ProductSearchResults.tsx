import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import { formatPrice } from '@/data/homepage';
import { getCatalogProductUrl } from '@/lib/productUrls';
import { useProductSearch } from '@/hooks/api/useProductSearch';
import { useLiveApi } from '@/lib/api/config';
import { searchKoncarProducts } from '@/data/koncarProducts';
import { getProductUrl } from '@/data/productDetail';
import { getSearchUrl } from '@/lib/catalogUrls';

type Props = {
  query: string;
  onResultClick?: () => void;
  onViewAll?: () => void;
  /** Uvek prikaži CTA za punu stranicu pretrage kad ima ≥2 karaktera. */
  alwaysOfferFullSearch?: boolean;
  className?: string;
};

export const ProductSearchResults = ({
  query,
  onResultClick,
  onViewAll,
  alwaysOfferFullSearch = false,
  className,
}: Props) => {
  const trimmed = query.trim();
  const liveSearch = useProductSearch(trimmed, useLiveApi);

  const mockResults = useMemo(
    () => (useLiveApi ? [] : searchKoncarProducts(trimmed)),
    [trimmed],
  );

  const results = useLiveApi ? (liveSearch.data ?? []) : mockResults;
  const isLoading = useLiveApi && liveSearch.isLoading && trimmed.length >= 2;
  const showFullSearchCta = alwaysOfferFullSearch && trimmed.length >= 2;
  const viewAllHref = getSearchUrl({ q: trimmed });

  const fullSearchCta = showFullSearchCta ? (
    <div className="shrink-0 border-t border-border px-4 py-3 bg-white">
      {onViewAll ? (
        <button
          type="button"
          onClick={onViewAll}
          className="w-full flex items-center justify-center gap-1 text-sm font-semibold text-primary hover:underline py-1"
        >
          Pogledajte sve rezultate <ChevronRight className="w-4 h-4" />
        </button>
      ) : (
        <Link
          to={viewAllHref}
          onClick={onResultClick}
          className="flex items-center justify-center gap-1 text-sm font-semibold text-primary hover:underline py-1"
        >
          Pogledajte sve rezultate <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  ) : null;

  let body: ReactNode;

  if (trimmed.length === 0) {
    body = (
      <p className="px-4 py-8 text-sm text-center text-muted-foreground">
        Unesite naziv proizvoda, brend ili kategoriju
      </p>
    );
  } else if (trimmed.length < 2) {
    body = (
      <p className="px-4 py-6 text-sm text-center text-muted-foreground">
        Unesite bar 2 karaktera za pretragu
      </p>
    );
  } else if (isLoading) {
    body = (
      <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Pretraga…
      </div>
    );
  } else if (liveSearch.isError) {
    body = (
      <p className="px-4 py-8 text-sm text-center text-muted-foreground">
        Pretraga trenutno nije dostupna. Pokušajte ponovo.
      </p>
    );
  } else if (results.length === 0) {
    body = (
      <p className="px-4 py-8 text-sm text-center text-muted-foreground">
        Nema rezultata za „{trimmed}“
      </p>
    );
  } else {
    body = (
      <>
        <ul className="divide-y divide-border">
          {results.map((product) => {
            const href = useLiveApi
              ? getCatalogProductUrl(product)
              : getProductUrl(product.id);

            return (
              <li key={product.id}>
                <Link
                  to={href}
                  onClick={onResultClick}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-14 h-14 shrink-0 flex items-center justify-center bg-secondary/40 rounded border border-border/60">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt=""
                        className="max-h-full max-w-full object-contain p-1"
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">{product.brand}</p>
                    <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">{product.name}</p>
                    <p className="text-sm font-display font-bold text-primary mt-0.5">{formatPrice(product.price)}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        {!alwaysOfferFullSearch && (
          <div className="border-t border-border px-4 py-3 bg-secondary/30">
            {onViewAll ? (
              <button
                type="button"
                onClick={onViewAll}
                className="w-full flex items-center justify-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Pogledajte sve rezultate <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                to={viewAllHref}
                onClick={onResultClick}
                className="flex items-center justify-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Pogledajte sve rezultate <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}
      </>
    );
  }

  return (
    <div className={`flex flex-col min-h-0 ${className ?? ''}`}>
      <div className="flex-1 min-h-0 overflow-y-auto koncar-scrollbar">{body}</div>
      {fullSearchCta}
    </div>
  );
};
