'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ShopLayout } from '@/components/layout/ShopLayout';
import { ListingHero } from '@/components/catalog/ListingHero';
import { SaleIntroBanner } from '@/components/catalog/SaleIntroBanner';
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard';
import { ProductFilters } from '@/components/catalog/ProductFilters';
import { MobileFiltersSheet } from '@/components/catalog/MobileFiltersSheet';
import { ListingToolbar, type ListingPerPage } from '@/components/catalog/ListingToolbar';
import { CatalogInfoSections } from '@/components/catalog/CatalogInfoSections';
import { CatalogStateMessage } from '@/components/catalog/CatalogStateMessage';
import { saleListing } from '@/data/catalogListing';
import { getDiscountPercent } from '@/data/koncarProducts';
import { useLiveSaleProducts } from '@/hooks/api/useLiveCatalog';
import type { LiveProductsResult } from '@/hooks/api/useLiveCatalog';
import { useLiveApi } from '@/lib/api/config';
import { getSaleCategoryFilterOptions } from '@/lib/navigation/buildNavigationMenu';
import {
  countActiveFilters,
  emptyListingFilters,
  type ListingFilters,
} from '@/lib/listingFilters';
import { useListingAttributeGroups } from '@/hooks/api/useListingAttributeGroups';
import { useSearchParams } from '@/lib/router-compat';

type Props = {
  initialListing?: LiveProductsResult;
};

const saleCategoryOptions = getSaleCategoryFilterOptions().map((opt) => ({
  label: opt.label,
  slug: opt.wcSlug,
}));

const SalePage = ({ initialListing }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<ListingPerPage>(48);
  const [filters, setFilters] = useState<ListingFilters>(() => ({
    ...emptyListingFilters(),
    categorySlug: searchParams.get('kategorija') || undefined,
  }));
  const { breadcrumbs, title, whyBuy, faq } = saleListing;

  const isDefaultSaleQuery = page === 1 && perPage === 48 && countActiveFilters(filters) === 0;

  const liveSale = useLiveSaleProducts(
    { page, perPage, filters },
    isDefaultSaleQuery ? initialListing : undefined,
  );

  const { groups: attributeGroups } = useListingAttributeGroups(
    { onSale: true, category: filters.categorySlug },
    filters,
  );

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

  const scrollListingToTop = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  const syncFilterParams = useCallback(
    (nextFilters: ListingFilters) => {
      const next = new URLSearchParams(searchParams);
      if (nextFilters.categorySlug) next.set('kategorija', nextFilters.categorySlug);
      else next.delete('kategorija');
      next.delete('podkategorija');
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  const handleFiltersChange = useCallback(
    (next: ListingFilters) => {
      setFilters(next);
      syncFilterParams(next);
      setPage(1);
      scrollListingToTop();
    },
    [scrollListingToTop, syncFilterParams],
  );

  const handleFiltersClear = useCallback(() => {
    const next = emptyListingFilters();
    setFilters(next);
    syncFilterParams(next);
    setPage(1);
    scrollListingToTop();
  }, [scrollListingToTop, syncFilterParams]);

  useEffect(() => {
    const categorySlug = searchParams.get('kategorija') || undefined;
    setFilters((prev) =>
      prev.categorySlug === categorySlug ? prev : { ...prev, categorySlug },
    );
  }, [searchParams]);

  const pageNumbers = (() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = new Set([1, totalPages, page, page - 1, page + 1]);
    return [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  })();

  const listingBody = () => {
    const hasInitialListing = Boolean(initialListing && isDefaultSaleQuery);
    if (useLiveApi && liveSale.isLoading && !hasInitialListing) {
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
                scrollListingToTop();
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
                      scrollListingToTop();
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
                scrollListingToTop();
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
        <div className="grid grid-cols-1 lg:grid-cols-[15rem_1fr] gap-8 items-start">
          <div className="hidden lg:block">
            <ProductFilters
              attributeGroups={attributeGroups}
              categoryOptions={saleCategoryOptions}
              filters={filters}
              onChange={handleFiltersChange}
              onClear={handleFiltersClear}
            />
          </div>

          <div>
            <div className="catalog-mobile-actions lg:hidden">
              <MobileFiltersSheet
                attributeGroups={attributeGroups}
                categoryOptions={saleCategoryOptions}
                filters={filters}
                onChange={handleFiltersChange}
                onClear={handleFiltersClear}
              />
            </div>

            {!useLiveApi || (!liveSale.isLoading && !liveSale.isError) ? (
              <ListingToolbar
                view={view}
                onViewChange={setView}
                productCount={useLiveApi ? totalCount : products.length}
                perPage={perPage}
                onPerPageChange={(value) => {
                  setPerPage(value);
                  setPage(1);
                  scrollListingToTop();
                }}
              />
            ) : null}

            {listingBody()}
          </div>
        </div>
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
