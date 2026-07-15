'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from '@/lib/router-compat';
import { ShopLayout } from '@/components/layout/ShopLayout';
import { ListingHero } from '@/components/catalog/ListingHero';
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard';
import { ProductFilters } from '@/components/catalog/ProductFilters';
import { MobileFiltersSheet } from '@/components/catalog/MobileFiltersSheet';
import { ListingToolbar, type ListingPerPage } from '@/components/catalog/ListingToolbar';
import { CatalogStateMessage } from '@/components/catalog/CatalogStateMessage';
import { getDiscountPercent } from '@/data/koncarProducts';
import { useLiveApi } from '@/lib/api/config';
import { useLiveSearchProducts } from '@/hooks/api/useLiveCatalog';
import type { ListingSort } from '@/lib/listingSort';
import {
  BRAND_ATTRIBUTE_SLUG,
  emptyListingFilters,
  getBrandAttributeSlug,
  getBrandFilterOptions,
  type ListingFilters,
} from '@/lib/listingFilters';
import { useListingAttributeGroups } from '@/hooks/api/useListingAttributeGroups';
import { featuredBrands } from '@/data/homepage';

/** WC term names are often ALL CAPS (e.g. "MAKITA") — prettify for display. */
const titleCaseLabel = (label: string) =>
  /^[A-ZŠĐČĆŽ0-9 .-]+$/.test(label)
    ? label
        .toLowerCase()
        .split(' ')
        .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
        .join(' ')
    : label;

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? undefined;
  const onSale = searchParams.get('akcija') === '1';
  const brandSlug = searchParams.get('brend') ?? undefined;

  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<ListingPerPage>(24);
  const [sort, setSort] = useState<ListingSort>('bestsellers');
  const [filters, setFilters] = useState<ListingFilters>(
    brandSlug ? { attributes: { [BRAND_ATTRIBUTE_SLUG]: [brandSlug] } } : emptyListingFilters(),
  );

  const scrollListingToTop = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    setPage(1);
    setPerPage(24);
    setSort('bestsellers');
    setFilters(
      brandSlug ? { attributes: { [BRAND_ATTRIBUTE_SLUG]: [brandSlug] } } : emptyListingFilters(),
    );
  }, [query, category, onSale, brandSlug]);

  const liveSearch = useLiveSearchProducts({
    search: query || undefined,
    category,
    onSale,
    page,
    perPage,
    sort,
    filters,
  });

  const { groups: attributeGroups } = useListingAttributeGroups(
    {
      search: query || undefined,
      category,
      onSale: onSale || undefined,
    },
    filters,
  );

  const brandName = (() => {
    if (!brandSlug) return undefined;
    const known = featuredBrands.find((b) => getBrandAttributeSlug(b.name, b.slug) === brandSlug);
    if (known) return known.name;
    const option = getBrandFilterOptions().find((o) => o.slug === brandSlug);
    return option ? titleCaseLabel(option.label) : brandSlug;
  })();

  const title = (() => {
    if (onSale && query.trim()) return `Akcija: „${query.trim()}“`;
    if (onSale) return 'Proizvodi na akciji';
    if (brandName && query.trim()) return `${brandName}: „${query.trim()}“`;
    if (brandName) return `Brend: ${brandName}`;
    if (query.trim()) return `Rezultati pretrage: „${query.trim()}“`;
    return 'Pretraga proizvoda';
  })();

  const breadcrumbs = [
    { label: 'Početna', href: '/' },
    { label: brandName ?? 'Pretraga' },
  ];

  const products = useMemo(() => {
    const list = liveSearch.data?.products ?? [];
    if (onSale) {
      return [...list].sort((a, b) => getDiscountPercent(b) - getDiscountPercent(a));
    }
    return list;
  }, [liveSearch.data?.products, onSale]);
  const totalCount = liveSearch.data?.total ?? 0;
  const totalPages = liveSearch.data?.totalPages ?? 0;

  const goToPage = useCallback(
    (nextPage: number) => {
      setPage(nextPage);
      scrollListingToTop();
    },
    [scrollListingToTop],
  );

  const pageNumbers = (() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = new Set([1, totalPages, page, page - 1, page + 1]);
    return [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  })();

  if (!useLiveApi) {
    return (
      <ShopLayout>
        <CatalogStateMessage variant="unavailable" className="min-h-[50vh]" />
      </ShopLayout>
    );
  }

  const hasSearchContext = Boolean(query.trim()) || Boolean(category) || onSale || Boolean(brandSlug);

  const listingBody = () => {
    if (!hasSearchContext) {
      return (
        <CatalogStateMessage
          variant="empty"
          title="Unesite pojam za pretragu"
          description="Koristite polje za pretragu u zaglavlju sajta."
        />
      );
    }
    if (liveSearch.isLoading) {
      return <CatalogStateMessage variant="loading" />;
    }
    if (liveSearch.isError) {
      return <CatalogStateMessage variant="error" onRetry={() => liveSearch.refetch()} />;
    }
    if (products.length === 0) {
      return <CatalogStateMessage variant="empty" />;
    }
    return (
      <>
        <div className={view === 'grid' ? 'grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4' : 'flex flex-col gap-3'}>
          {products.map((product) => (
            <CatalogProductCard key={product.id} product={product} view={view} />
          ))}
        </div>
        {totalPages > 1 && (
          <nav className="flex items-center justify-center gap-2 mt-10 flex-wrap" aria-label="Paginacija">
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
    );
  };

  return (
    <ShopLayout>
      <ListingHero breadcrumbs={breadcrumbs} title={title} />

      <section className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[15rem_1fr] gap-8 items-start">
          <div className="hidden lg:block">
            <ProductFilters
              attributeGroups={attributeGroups}
              filters={filters}
              onChange={(next) => {
                setFilters(next);
                setPage(1);
                scrollListingToTop();
              }}
              onClear={() => {
                setFilters(emptyListingFilters());
                setPage(1);
                scrollListingToTop();
              }}
            />
          </div>

          <div>
            <div className="catalog-mobile-actions lg:hidden">
              <MobileFiltersSheet
                attributeGroups={attributeGroups}
                filters={filters}
                onChange={(next) => {
                  setFilters(next);
                  setPage(1);
                  scrollListingToTop();
                }}
                onClear={() => {
                  setFilters(emptyListingFilters());
                  setPage(1);
                  scrollListingToTop();
                }}
              />
            </div>

            {hasSearchContext && !liveSearch.isLoading && !liveSearch.isError && products.length > 0 && (
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

            {listingBody()}
          </div>
        </div>
      </section>
    </ShopLayout>
  );
};

export default SearchPage;
