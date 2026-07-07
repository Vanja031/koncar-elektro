import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { ShopLayout } from '@/components/layout/ShopLayout';
import { ListingHero } from '@/components/catalog/ListingHero';
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard';
import { ListingToolbar, type ListingPerPage } from '@/components/catalog/ListingToolbar';
import { CatalogStateMessage } from '@/components/catalog/CatalogStateMessage';
import { CatalogInfoSections } from '@/components/catalog/CatalogInfoSections';
import { useLiveApi } from '@/lib/api/config';
import { useLiveBestSellers } from '@/hooks/api/useLiveCatalog';
import { bestSellerProducts } from '@/data/homepage';
import { markTopBestsellers } from '@/lib/catalogCardHelpers';

const breadcrumbs = [
  { label: 'Početna', href: '/' },
  { label: 'Najprodavaniji proizvodi' },
];

const BestSellersPage = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<ListingPerPage>(24);
  const liveBestSellers = useLiveBestSellers({ page, perPage });

  const products = useMemo(() => {
    const list = useLiveApi ? (liveBestSellers.data?.products ?? []) : bestSellerProducts;
    return markTopBestsellers(list);
  }, [liveBestSellers.data?.products]);

  const totalCount = liveBestSellers.data?.total ?? products.length;
  const totalPages = liveBestSellers.data?.totalPages ?? 1;

  const pageNumbers = (() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = new Set([1, totalPages, page, page - 1, page + 1]);
    return [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  })();

  const listingBody = () => {
    if (useLiveApi && liveBestSellers.isLoading) {
      return <CatalogStateMessage variant="loading" className="mt-4" />;
    }
    if (useLiveApi && liveBestSellers.isError) {
      return <CatalogStateMessage variant="error" className="mt-4" onRetry={() => liveBestSellers.refetch()} />;
    }
    if (products.length === 0) {
      return <CatalogStateMessage variant="empty" className="mt-4" />;
    }

    return (
      <>
        <div className={view === 'grid' ? 'grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 mt-4' : 'flex flex-col gap-3 mt-4'}>
          {products.map((product) => (
            <CatalogProductCard key={product.id} product={product} view={view} bestsellerBadge />
          ))}
        </div>
        {useLiveApi && totalPages > 1 && (
          <nav className="flex items-center justify-center gap-2 mt-10 flex-wrap" aria-label="Paginacija">
            <button
              type="button"
              disabled={page <= 1 || liveBestSellers.isFetching}
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-9 h-9 border border-border rounded flex items-center justify-center hover:bg-secondary disabled:opacity-40"
              aria-label="Prethodna strana"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {pageNumbers.map((pageNum, index) => {
              const prev = pageNumbers[index - 1];
              const showEllipsis = prev != null && pageNum - prev > 1;
              return (
                <span key={pageNum} className="flex items-center gap-2">
                  {showEllipsis && <span className="px-1 text-muted-foreground">…</span>}
                  <button
                    type="button"
                    disabled={liveBestSellers.isFetching}
                    onClick={() => {
                      setPage(pageNum);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-9 h-9 border rounded text-sm font-medium ${
                      pageNum === page ? 'bg-primary text-white border-primary' : 'border-border hover:bg-secondary'
                    }`}
                  >
                    {pageNum}
                  </button>
                </span>
              );
            })}
            <button
              type="button"
              disabled={page >= totalPages || liveBestSellers.isFetching}
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-9 h-9 border border-border rounded flex items-center justify-center hover:bg-secondary disabled:opacity-40"
              aria-label="Sledeća strana"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </nav>
        )}
      </>
    );
  };

  return (
    <ShopLayout>
      <ListingHero breadcrumbs={breadcrumbs} title="Najprodavaniji proizvodi" />

      <section className="container py-8">
        {!useLiveApi || (!liveBestSellers.isLoading && !liveBestSellers.isError && products.length > 0) ? (
          <ListingToolbar
            view={view}
            onViewChange={setView}
            productCount={useLiveApi ? totalCount : products.length}
            perPage={perPage}
            onPerPageChange={(value) => {
              setPerPage(value);
              setPage(1);
            }}
          />
        ) : null}

        {listingBody()}
      </section>

      <CatalogInfoSections
        variant="category"
        whyTitle="Zašto kupci biraju najprodavanije kod nas?"
        whyBuy={[
          'Najtraženiji modeli sa odličnim odnosom cene i kvaliteta',
          'Proizvodi koje kupci najčešće kupuju i preporučuju',
          'Brza isporuka i proverena podrška posle kupovine',
        ]}
        faq={[
          {
            question: 'Kako se određuju najprodavaniji proizvodi?',
            answer: 'Lista se automatski osvežava prema prodaji i popularnosti u prodavnici.',
          },
          {
            question: 'Da li su svi artikli sa liste dostupni?',
            answer: 'Prikazujemo samo aktuelne proizvode, a status zaliha vidite na svakoj kartici.',
          },
        ]}
      />
    </ShopLayout>
  );
};

export default BestSellersPage;
