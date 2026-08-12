'use client';

import { Heart } from 'lucide-react';
import { Link } from '@/lib/router-compat';
import { InfoPageShell } from '@/components/static/InfoPageShell';
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard';
import { CatalogStateMessage } from '@/components/catalog/CatalogStateMessage';
import { useWishlist } from '@/context/WishlistContext';
import { ROUTES } from '@/lib/catalogUrls';

const breadcrumbs = [{ label: 'Početna', href: '/' }, { label: 'Lista želja' }];

const WishlistPage = () => {
  const { products, count, clear } = useWishlist();

  return (
    <InfoPageShell
      breadcrumbs={breadcrumbs}
      title="Lista želja"
      subtitle="Proizvodi koje ste sačuvali za kasnije. Lista se čuva u ovom pregledaču."
    >
      {count === 0 ? (
        <CatalogStateMessage
          variant="empty"
          title="Lista želja je prazna"
          description="Kliknite na srce na kartici proizvoda da dodate artikle."
        />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary fill-primary" />
              {count} {count === 1 ? 'proizvod' : 'proizvoda'}
            </p>
            <div className="flex items-center gap-3">
              <Link to={ROUTES.shop} className="text-sm text-primary hover:underline">
                Nastavi kupovinu
              </Link>
              <button
                type="button"
                onClick={clear}
                className="text-sm text-muted-foreground hover:text-destructive transition-colors"
              >
                Isprazni listu
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
            {products.map((product) => (
              <CatalogProductCard
                key={product.id}
                product={{
                  ...product,
                  brand: product.brand ?? '',
                  category: product.category ?? '',
                  description: product.name,
                  rating: 0,
                  reviews: 0,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </InfoPageShell>
  );
};

export default WishlistPage;
