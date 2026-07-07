import { AlertCircle, PackageOpen, RefreshCw, WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/catalogUrls';

type Variant = 'loading' | 'error' | 'empty' | 'unavailable' | 'not-found';

const COPY: Record<Exclude<Variant, 'loading'>, { title: string; description: string }> = {
  error: {
    title: 'Greška pri učitavanju',
    description:
      'Trenutno ne možemo da učitamo proizvode. Proverite internet vezu i pokušajte ponovo.',
  },
  empty: {
    title: 'Nema proizvoda',
    description: 'U ovoj kategoriji trenutno nema dostupnih proizvoda.',
  },
  unavailable: {
    title: 'Katalog nije dostupan',
    description: 'Pregled proizvoda sa servera trenutno nije uključen. Pokušajte ponovo kasnije.',
  },
  'not-found': {
    title: 'Stranica nije pronađena',
    description: 'Kategorija ili proizvod koji tražite ne postoji ili je uklonjen iz ponude.',
  },
};

type Props = {
  variant: Variant;
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
};

export const CatalogStateMessage = ({
  variant,
  title,
  description,
  onRetry,
  className = '',
}: Props) => {
  if (variant === 'loading') {
    return (
      <p className={`text-center text-muted-foreground py-10 ${className}`}>
        Učitavanje…
      </p>
    );
  }

  const copy = COPY[variant];
  const Icon =
    variant === 'error' ? WifiOff : variant === 'empty' ? PackageOpen : AlertCircle;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center gap-3 py-10 px-4 ${className}`}
      role="status"
    >
      <Icon className="w-10 h-10 text-muted-foreground/70" aria-hidden />
      <h2 className="font-display font-bold text-lg text-foreground">
        {title ?? copy.title}
      </h2>
      <p className="text-sm text-muted-foreground max-w-md">{description ?? copy.description}</p>
      <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
        {onRetry && (
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Pokušaj ponovo
          </Button>
        )}
        {variant !== 'error' && (
          <Button asChild variant="default" size="sm">
            <Link to={ROUTES.shop}>Nazad na prodavnicu</Link>
          </Button>
        )}
      </div>
    </div>
  );
};
