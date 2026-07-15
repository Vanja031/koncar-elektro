'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ShopLayout } from '@/components/layout/ShopLayout';
import { ListingHero } from '@/components/catalog/ListingHero';
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard';
import { ProductFilters } from '@/components/catalog/ProductFilters';
import { MobileFiltersSheet } from '@/components/catalog/MobileFiltersSheet';
import { SubcategoryChips } from '@/components/catalog/SubcategoryChips';
import { ListingToolbar, type ListingPerPage } from '@/components/catalog/ListingToolbar';
import { CatalogInfoSections } from '@/components/catalog/CatalogInfoSections';
import { ParentHubBestSellers } from '@/components/catalog/ParentHubBestSellers';
import { CatalogStateMessage } from '@/components/catalog/CatalogStateMessage';
import { getCategoryHubHeroDescription } from '@/data/categoryPages';
import { getParentListing, getProductListing, getProgramListing } from '@/data/catalogListing';
import { useLiveApi } from '@/lib/api/config';
import { useLiveProductsByCategory } from '@/hooks/api/useLiveCatalog';
import type { LiveProductsResult } from '@/hooks/api/useLiveCatalog';
import { useNavigationMenu } from '@/hooks/api/useNavigationMenu';
import {
  isLeafProgramListingRoute,
  isParentListingRoute,
  resolveMegaMenuSubcategoryUrl,
} from '@/lib/catalogUrls';
import { findMenuIdByParentSlug } from '@/lib/navigation/buildNavigationMenu';
import { slugify } from '@/lib/slugify';
import type { ListingSort } from '@/lib/listingSort';
import {
  countActiveFilters,
  emptyListingFilters,
  type ListingFilters,
} from '@/lib/listingFilters';
import { useListingAttributeGroups } from '@/hooks/api/useListingAttributeGroups';
import { toWcParentSlug, programToWcSlug, resolveListingCategorySlug } from '@/lib/wcSlugs';
import { markTopBestsellers } from '@/lib/catalogCardHelpers';
import { buildListingHighlightChips } from '@/lib/listingHighlightChips';
import { useSubcategoryProductImages } from '@/hooks/api/useSubcategoryProductImages';
import { useLiveSaleCount } from '@/hooks/api/useLiveCatalog';

type Props = {
  categorySlug?: string;
  parentSlug?: string;
  listingSlug?: string;
  initialListing?: LiveProductsResult;
};

const ProductsPage = ({
  categorySlug = 'alati',
  parentSlug = 'elektricni-alat',
  listingSlug,
  initialListing,
}: Props) => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<ListingPerPage>(24);
  const [sort, setSort] = useState<ListingSort>('bestsellers');
  const [filters, setFilters] = useState<ListingFilters>(emptyListingFilters());
  const { getCategoryById, isLive: navLive } = useNavigationMenu();

  const scrollListingToTop = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  const goToPage = useCallback(
    (nextPage: number) => {
      setPage(nextPage);
      scrollListingToTop();
    },
    [scrollListingToTop],
  );

  const handlePerPageChange = useCallback(
    (value: ListingPerPage) => {
      setPerPage(value);
      setPage(1);
      scrollListingToTop();
    },
    [scrollListingToTop],
  );

  const handleSortChange = useCallback(
    (value: ListingSort) => {
      setSort(value);
      setPage(1);
      scrollListingToTop();
    },
    [scrollListingToTop],
  );

  const handleFiltersChange = useCallback(
    (next: ListingFilters) => {
      setFilters(next);
      setPage(1);
      scrollListingToTop();
    },
    [scrollListingToTop],
  );

  const handleFiltersClear = useCallback(() => {
    setFilters(emptyListingFilters());
    setPage(1);
    scrollListingToTop();
  }, [scrollListingToTop]);

  const parentData = isParentListingRoute(categorySlug, parentSlug, listingSlug)
    ? getParentListing(categorySlug, parentSlug)
    : undefined;

  const isParentRoute = Boolean(parentData);
  const parentMenuId = parentData ? findMenuIdByParentSlug(parentSlug) : undefined;
  const parentLiveMenu = parentMenuId ? getCategoryById(parentMenuId) : undefined;

  const parentChipSources = useMemo(() => {
    if (!isParentRoute) return [];
    if (navLive && parentLiveMenu?.subcategories.length) {
      return parentLiveMenu.subcategories
        .filter((sub) => sub.slug)
        .map((sub) => ({ label: sub.label, slug: sub.slug! }));
    }
    // Hub categories not wired into the mega menu (e.g. Poljoprivredni program, Oprema za
    // dvorište) render their subcategory chips from the static fallback list — still fetch
    // each one's real first-product photo instead of showing the same category placeholder.
    if (parentData?.chips.length) {
      return parentData.chips
        .filter((c) => c.slug && c.slug !== 'svi-proizvodi')
        .map((c) => ({ label: c.label, slug: c.slug! }));
    }
    return [];
  }, [isParentRoute, navLive, parentLiveMenu, parentData]);

  const parentChipImages = useSubcategoryProductImages(parentChipSources);

  const listingData = listingSlug
    ? getProductListing(categorySlug, parentSlug, listingSlug)
    : isLeafProgramListingRoute(categorySlug, parentSlug, listingSlug)
      ? getProgramListing(categorySlug, parentSlug)
      : undefined;

  const wcCategorySlug =
    !parentData && listingData ? resolveListingCategorySlug(parentSlug, listingSlug) : undefined;

  const parentWcSlug = parentData ? toWcParentSlug(parentSlug) : undefined;

  useEffect(() => {
    setPage(1);
    setPerPage(24);
    setSort('bestsellers');
    setFilters(emptyListingFilters());
  }, [wcCategorySlug]);

  const isDefaultListingQuery =
    page === 1 &&
    perPage === 24 &&
    sort === 'bestsellers' &&
    countActiveFilters(filters) === 0;

  const liveProducts = useLiveProductsByCategory(
    useLiveApi ? wcCategorySlug : undefined,
    { page, perPage, sort, filters },
    isDefaultListingQuery ? initialListing : undefined,
  );

  const { groups: attributeGroups } = useListingAttributeGroups(
    { category: wcCategorySlug },
    filters,
  );

  const parentBestSellers = useLiveProductsByCategory(useLiveApi ? parentWcSlug : undefined, {
    perPage: 8,
    sort: 'bestsellers',
  });

  const liveListingChips = useMemo(() => {
    if (!navLive || !listingData) return undefined;
    const menuId = findMenuIdByParentSlug(parentSlug);
    const liveMenu = menuId ? getCategoryById(menuId) : undefined;
    if (!liveMenu?.subcategories.length) return undefined;

    return liveMenu.subcategories.map((sub) => ({
      slug: sub.slug ?? slugify(sub.label),
      label: sub.label,
      count: sub.count ?? 0,
      image: sub.image,
      href: resolveMegaMenuSubcategoryUrl(menuId!, sub),
    }));
  }, [navLive, listingData, parentSlug, getCategoryById]);

  const listingParentWcSlug =
    categorySlug === 'alati' ? toWcParentSlug(parentSlug) : programToWcSlug(parentSlug);

  const saleCountQuery = useLiveSaleCount(useLiveApi ? listingParentWcSlug : undefined);

  const subcategoryImageSources = useMemo(() => {
    const siblings = liveListingChips ?? listingData?.chips ?? [];
    return siblings
      .filter((c) => c.slug)
      .map((c) => ({
        label: c.label,
        slug: c.slug,
        image: c.image,
      }));
  }, [liveListingChips, listingData?.chips]);

  const subcategoryImages = useSubcategoryProductImages(subcategoryImageSources);

  const highlightChips = useMemo(() => {
    const siblings = liveListingChips ?? listingData?.chips ?? [];
    if (!siblings.length) return [];

    const imageMap = subcategoryImages.data ?? {};
    const withImages = siblings.map((c) => ({
      ...c,
      image: (c.slug && imageMap[c.slug]) || c.image,
    }));

    return buildListingHighlightChips(
      withImages,
      listingParentWcSlug,
      saleCountQuery.data,
    );
  }, [
    liveListingChips,
    listingData?.chips,
    listingParentWcSlug,
    saleCountQuery.data,
    subcategoryImages.data,
  ]);

  if (parentData) {
    const isLiveChips =
      navLive && Boolean(parentLiveMenu) && (parentLiveMenu?.subcategories.length ?? 0) > 0;
    const chips = isLiveChips
      ? parentLiveMenu!.subcategories.map((sub) => ({
          slug: sub.slug ?? slugify(sub.label),
          label: sub.label,
          count: sub.count ?? 0,
          image: sub.slug ? parentChipImages.data?.[sub.slug] : undefined,
          href: resolveMegaMenuSubcategoryUrl(parentMenuId!, sub),
        }))
      : parentData.chips.map((c) => ({
          ...c,
          image: (c.slug && parentChipImages.data?.[c.slug]) || c.image,
        }));

    const bestSellers = useLiveApi ? (parentBestSellers.data?.products ?? []) : [];
    const firstChipHref = chips[0]?.href;

    return (
      <ShopLayout>
        <ListingHero
          breadcrumbs={parentData.breadcrumbs}
          title={parentData.title}
          description={
            parentData.description ||
            getCategoryHubHeroDescription(parentSlug, parentData.title)
          }
        />
        {chips.length > 0 ? (
          <SubcategoryChips
            chips={chips}
            title={parentData.sectionTitle}
            layout="cards"
            description=""
            imagesLoading={isLiveChips && (parentChipImages.isPending || parentChipImages.isFetching)}
          />
        ) : (
          <div className="container py-6">
            <CatalogStateMessage
              variant="empty"
              title="Nema kategorija"
              description="Za ovu kategoriju trenutno nema dostupnih kategorija u prodavnici."
            />
          </div>
        )}
        {useLiveApi ? (
          parentBestSellers.isLoading ? (
            <div className="container py-8">
              <CatalogStateMessage variant="loading" />
            </div>
          ) : parentBestSellers.isError ? (
            <div className="container py-8">
              <CatalogStateMessage variant="error" onRetry={() => parentBestSellers.refetch()} />
            </div>
          ) : (
            <ParentHubBestSellers
              title={`Najprodavaniji u kategoriji ${parentData.title.toLowerCase()}`}
              products={bestSellers}
              viewAllHref={firstChipHref}
            />
          )
        ) : (
          <div className="container py-8">
            <CatalogStateMessage variant="unavailable" />
          </div>
        )}
      </ShopLayout>
    );
  }

  if (!listingData) {
    return (
      <ShopLayout>
        <CatalogStateMessage variant="not-found" className="min-h-[50vh]" />
      </ShopLayout>
    );
  }

  if (!useLiveApi) {
    return (
      <ShopLayout>
        <ListingHero breadcrumbs={listingData.breadcrumbs} title={listingData.title} />
        <div className="container py-12">
          <CatalogStateMessage variant="unavailable" />
        </div>
      </ShopLayout>
    );
  }

  const rawProducts = liveProducts.data?.products ?? [];
  const products =
    sort === 'bestsellers' ? markTopBestsellers(rawProducts) : rawProducts;
  const totalCount = liveProducts.data?.total ?? 0;
  const totalPages = liveProducts.data?.totalPages ?? 0;
  const currentPage = page;
  const chips = highlightChips;

  const pageNumbers = (() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
    return [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  })();

  const hasInitialListing = Boolean(initialListing && isDefaultListingQuery);

  const listingBody = () => {
    if (liveProducts.isLoading && !hasInitialListing) {
      return <CatalogStateMessage variant="loading" />;
    }
    if (liveProducts.isError) {
      return (
        <CatalogStateMessage
          variant="error"
          onRetry={() => liveProducts.refetch()}
        />
      );
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
              disabled={currentPage <= 1 || liveProducts.isFetching}
              onClick={() => goToPage(Math.max(1, currentPage - 1))}
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
                    disabled={liveProducts.isFetching}
                    onClick={() => goToPage(pageNum)}
                    className={`w-9 h-9 border rounded text-sm font-medium ${
                      pageNum === currentPage
                        ? 'bg-primary text-white border-primary'
                        : 'border-border hover:bg-secondary'
                    }`}
                    aria-current={pageNum === currentPage ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                </span>
              );
            })}
            <button
              type="button"
              disabled={currentPage >= totalPages || liveProducts.isFetching}
              onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
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
      <ListingHero
        breadcrumbs={listingData.breadcrumbs}
        title={listingData.title}
        description={listingData.description}
      />

      {chips.length > 0 && (
        <SubcategoryChips
          chips={chips}
          description=""
          hideOnMobile
        />
      )}

      <section className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[15rem_1fr] gap-8 items-start">
          <div className="hidden lg:block">
            <ProductFilters
              attributeGroups={attributeGroups}
              filters={filters}
              onChange={handleFiltersChange}
              onClear={handleFiltersClear}
            />
          </div>

          <div>
            <div className="catalog-mobile-actions lg:hidden">
              <MobileFiltersSheet
                attributeGroups={attributeGroups}
                filters={filters}
                onChange={handleFiltersChange}
                onClear={handleFiltersClear}
              />
            </div>

            {!liveProducts.isLoading && !liveProducts.isError && (
              <ListingToolbar
                view={view}
                onViewChange={setView}
                productCount={products.length > 0 ? totalCount : undefined}
                perPage={perPage}
                onPerPageChange={handlePerPageChange}
                sort={sort}
                onSortChange={handleSortChange}
              />
            )}

            {listingBody()}
          </div>
        </div>
      </section>

      <CatalogInfoSections
        variant="category"
        whyBuy={listingData.whyBuy}
        faq={listingData.faq}
        whyTitle="Zašto kupiti bušilicu kod nas?"
      />
    </ShopLayout>
  );
};

export default ProductsPage;
