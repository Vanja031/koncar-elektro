'use client';

import { useCallback, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ShopLayout } from '@/components/layout/ShopLayout';
import { ListingHero } from '@/components/catalog/ListingHero';
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard';
import { ProductFilters } from '@/components/catalog/ProductFilters';
import { MobileFiltersSheet } from '@/components/catalog/MobileFiltersSheet';
import { ActiveFilterBadges } from '@/components/catalog/ActiveFilterBadges';
import { ListingToolbar, type ListingPerPage } from '@/components/catalog/ListingToolbar';
import { CatalogStateMessage } from '@/components/catalog/CatalogStateMessage';
import { useLiveApi } from '@/lib/api/config';
import { useLiveSearchProducts } from '@/hooks/api/useLiveCatalog';
import type { ListingSort } from '@/lib/listingSort';
import { BRAND_ATTRIBUTE_SLUG, type ListingFilters } from '@/lib/listingFilters';
import { useListingAttributeGroups } from '@/hooks/api/useListingAttributeGroups';
import { scheduleScrollAfterFilterApply, scheduleScrollToTop } from '@/lib/scrollToTop';

type Props = {
  brandSlug: string;
  brandName: string;
  initialPage?: number;
};

const ManufacturerPage = ({ brandSlug, brandName, initialPage = 1 }: Props) => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(initialPage);
  const [perPage, setPerPage] = useState<ListingPerPage>(24);
  const [sort, setSort] = useState<ListingSort>('bestsellers');
  const [filters, setFilters] = useState<ListingFilters>({
    attributes: { [BRAND_ATTRIBUTE_SLUG]: [brandSlug] },
  });

  const scrollListingToTop = useCallback(() => {
    scheduleScrollToTop();
  }, []);

  const pinBrand = useCallback(
    (next: ListingFilters): ListingFilters => ({
      ...next,
      attributes: {
        ...next.attributes,
        [BRAND_ATTRIBUTE_SLUG]: [brandSlug],
      },
    }),
    [brandSlug],
  );

  const handleFiltersApply = useCallback(
    (next: ListingFilters) => {
      setFilters(pinBrand(next));
      setPage(1);
      scheduleScrollAfterFilterApply();
    },
    [pinBrand],
  );

  const handleFiltersClear = useCallback(() => {
    setFilters({ attributes: { [BRAND_ATTRIBUTE_SLUG]: [brandSlug] } });
    setPage(1);
    scheduleScrollAfterFilterApply();
  }, [brandSlug]);

  const handleFiltersPatch = useCallback(
    (next: ListingFilters) => {
      setFilters(pinBrand(next));
      setPage(1);
    },
    [pinBrand],
  );

  const liveSearch = useLiveSearchProducts({ page, perPage, sort, filters });
  const { groups: attributeGroups } = useListingAttributeGroups({}, filters);

  const products = liveSearch.data?.products ?? [];
  const totalCount = liveSearch.data?.total ?? 0;
  const totalPages = liveSearch.data?.totalPages ?? 0;

  const goToPage = useCallback(
    (nextPage: number) => {
      setPage(nextPage);
      scrollListingToTop();
    },
    [scrollListingToTop],
  );

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = new Set([1, totalPages, page, page - 1, page + 1]);
    return [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  }, [totalPages, page]);

  if (!useLiveApi) {
    return (
      <ShopLayout>
        <CatalogStateMessage variant="unavailable" className="min-h-[50vh]" />
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <ListingHero
        breadcrumbs={[
          { label: 'Početna', href: '/' },
          { label: 'Proizvođači' },
          { label: brandName },
        ]}
        title={brandName}
        description={`Ponuda proizvoda brenda ${brandName} — brza dostava i garancija. Končar Elektro.`}
      />

      <section className="container py-8" data-catalog-listing>
        <div className="grid grid-cols-1 lg:grid-cols-[15rem_1fr] gap-8 items-start">
          <div className="hidden lg:block">
            <ProductFilters
              attributeGroups={attributeGroups}
              filters={filters}
              onChange={handleFiltersApply}
              onClear={handleFiltersClear}
            />
          </div>

          <div>
            <div className="catalog-mobile-actions lg:hidden">
              <MobileFiltersSheet
                attributeGroups={attributeGroups}
                filters={filters}
                onChange={handleFiltersApply}
                onClear={handleFiltersClear}
              />
            </div>

            <ActiveFilterBadges
              attributeGroups={attributeGroups}
              filters={filters}
              onChange={handleFiltersPatch}
              onClear={handleFiltersClear}
            />

            {!liveSearch.isLoading && !liveSearch.isError && products.length > 0 && (
              <ListingToolbar
                view={view}
                onViewChange={setView}
                productCount={totalCount}
                perPage={perPage}
                onPerPageChange={(value) => {
                  setPerPage(value);
                  setPage(1);
                  scrollListingToTop();
                }}
                sort={sort}
                onSortChange={(value) => {
                  setSort(value);
                  setPage(1);
                  scrollListingToTop();
                }}
              />
            )}

            {liveSearch.isLoading ? (
              <CatalogStateMessage variant="loading" />
            ) : liveSearch.isError ? (
              <CatalogStateMessage variant="error" onRetry={() => liveSearch.refetch()} />
            ) : products.length === 0 ? (
              <CatalogStateMessage variant="empty" />
            ) : (
              <>
                <div
                  className={
                    view === 'grid'
                      ? 'grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4'
                      : 'flex flex-col gap-3'
                  }
                >
                  {products.map((product) => (
                    <CatalogProductCard key={product.id} product={product} view={view} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <nav
                    className="flex items-center justify-center gap-2 mt-10 flex-wrap"
                    aria-label="Paginacija"
                  >
                    <button
                      type="button"
                      disabled={page <= 1 || liveSearch.isFetching}
                      onClick={() => goToPage(Math.max(1, page - 1))}
                      className="w-9 h-9 border border-border rounded flex items-center justify-center hover:bg-secondary disabled:opacity-40 disabled:pointer-events-none"
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
                            disabled={liveSearch.isFetching}
                            onClick={() => goToPage(pageNum)}
                            className={`w-9 h-9 border rounded text-sm font-medium ${
                              pageNum === page
                                ? 'bg-primary text-white border-primary'
                                : 'border-border hover:bg-secondary'
                            }`}
                            aria-current={pageNum === page ? 'page' : undefined}
                          >
                            {pageNum}
                          </button>
                        </span>
                      );
                    })}
                    <button
                      type="button"
                      disabled={page >= totalPages || liveSearch.isFetching}
                      onClick={() => goToPage(Math.min(totalPages, page + 1))}
                      className="w-9 h-9 border border-border rounded flex items-center justify-center hover:bg-secondary disabled:opacity-40 disabled:pointer-events-none"
                      aria-label="Sledeća strana"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </ShopLayout>
  );
};

export default ManufacturerPage;
