import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ShopLayout } from '@/components/layout/ShopLayout';
import { ListingHero } from '@/components/catalog/ListingHero';
import { SaleIntroBanner } from '@/components/catalog/SaleIntroBanner';
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard';
import { ListingToolbar, type ListingPerPage } from '@/components/catalog/ListingToolbar';
import { CatalogInfoSections } from '@/components/catalog/CatalogInfoSections';
import { CatalogStateMessage } from '@/components/catalog/CatalogStateMessage';
import { saleListing } from '@/data/catalogListing';
import { getDiscountPercent } from '@/data/koncarProducts';
import { useLiveSaleProducts } from '@/hooks/api/useLiveCatalog';
import { useLiveApi } from '@/lib/api/config';

const SalePage = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<ListingPerPage>(48);
  const { breadcrumbs, title, whyBuy, faq } = saleListing;
  const liveSale = useLiveSaleProducts({ page, perPage });

  const products = useMemo(() => {
    const list = useLiveApi ? (liveSale.data?.products ?? []) : saleListing.products;
    return [...list].sort((a, b) => getDiscountPercent(b) - getDiscountPercent(a));
  }, [liveSale.data?.products]);

  const totalCount = liveSale.data?.total ?? products.length;
  const totalPages = liveSale.data?.totalPages ?? 1;

  const maxDiscount = useMemo(
    () => products.reduce((max, p) => Math.max(max, getDiscountPercent(p)), 0),
    [products],
  );

  const pageNumbers = (() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = new Set([1, totalPages, page, page - 1, page + 1]);
    return [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  })();

  const listingBody = () => {
    if (useLiveApi && liveSale.isLoading) {
      return <CatalogStateMessage variant="loading" className="mt-4" />;
    }
    if (useLiveApi && liveSale.isError) {
      return (
        <CatalogStateMessage
          variant="error"
          className="mt-4"
          onRetry={() => liveSale.refetch()}
        />
      );
    }
    if (products.length === 0) {
      return <CatalogStateMessage variant="empty" className="mt-4" />;
    }
    return (
      <>
        <div
          className={
            view === 'grid'
              ? 'grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 mt-4'
              : 'flex flex-col gap-3 mt-4'
          }
        >
          {products.map((product) => (
            <CatalogProductCard key={product.id} product={product} view={view} />
          ))}
        </div>
        {useLiveApi && totalPages > 1 && (
          <nav className="flex items-center justify-center gap-2 mt-10 flex-wrap" aria-label="Paginacija">
            <button
              type="button"
              disabled={page <= 1 || liveSale.isFetching}
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
                    disabled={liveSale.isFetching}
                    onClick={() => {
                      setPage(pageNum);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-9 h-9 border rounded text-sm font-medium ${
                      pageNum === page
                        ? 'bg-primary text-white border-primary'
                        : 'border-border hover:bg-secondary'
                    }`}
                  >
                    {pageNum}
                  </button>
                </span>
              );
            })}
            <button
              type="button"
              disabled={page >= totalPages || liveSale.isFetching}
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
      <ListingHero breadcrumbs={breadcrumbs} title={title} />
      <SaleIntroBanner maxDiscount={maxDiscount} />

      <section className="container py-8">
        {!useLiveApi || (!liveSale.isLoading && !liveSale.isError && products.length > 0) ? (
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
        whyBuy={whyBuy}
        faq={faq}
        whyTitle="Zašto kupovati na akciji kod nas?"
      />
    </ShopLayout>
  );
};

export default SalePage;
