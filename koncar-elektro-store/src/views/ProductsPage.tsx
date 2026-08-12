'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ShopLayout } from '@/components/layout/ShopLayout';
import { ListingHero } from '@/components/catalog/ListingHero';
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard';
import { ProductFilters } from '@/components/catalog/ProductFilters';
import { MobileFiltersSheet } from '@/components/catalog/MobileFiltersSheet';
import { ActiveFilterBadges } from '@/components/catalog/ActiveFilterBadges';
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
import {
  findMenuIdByParentSlug,
  findWcParentByInternalSlug,
  getLiveParentSubcategoryChips,
} from '@/lib/navigation/buildNavigationMenu';
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
import { scheduleScrollAfterFilterApply, scheduleScrollToTop } from '@/lib/scrollToTop';

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
  const { getCategoryById, isLive: navLive, allCategories, isLoading: navLoading } =
    useNavigationMenu();

  const scrollListingToTop = useCallback(() => {
    scheduleScrollToTop();
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

  /** Apply / Poništi from filter panel — update + scroll (mobile: below hero). */
  const handleFiltersApply = useCallback((next: ListingFilters) => {
    setFilters(next);
    setPage(1);
    scheduleScrollAfterFilterApply();
  }, []);

  const handleFiltersClear = useCallback(() => {
    setFilters(emptyListingFilters());
    setPage(1);
    scheduleScrollAfterFilterApply();
  }, []);

  /** Badge X — update filters without jumping the page. */
  const handleFiltersPatch = useCallback((next: ListingFilters) => {
    setFilters(next);
    setPage(1);
  }, []);

  const parentData = isParentListingRoute(categorySlug, parentSlug, listingSlug)
    ? getParentListing(categorySlug, parentSlug)
    : undefined;

  const isParentRoute = Boolean(parentData);
  const parentMenuId = parentData ? findMenuIdByParentSlug(parentSlug) : undefined;
  const parentLiveMenu = parentMenuId ? getCategoryById(parentMenuId) : undefined;

  /** Always prefer WC children + real counts when live catalog is available. */
  const liveParentChips = useMemo(() => {
    if (!useLiveApi || !isParentRoute || !allCategories?.length) return undefined;
    const fromWc = getLiveParentSubcategoryChips(parentSlug, allCategories);
    if (fromWc.length) return fromWc;
    if (parentLiveMenu?.subcategories.length) {
      return parentLiveMenu.subcategories
        .filter((sub) => sub.slug)
        .map((sub) => ({
          slug: sub.slug!,
          label: sub.label,
          count: sub.count ?? 0,
          image: sub.image,
          href: resolveMegaMenuSubcategoryUrl(parentMenuId!, sub),
          parentWcSlug: sub.parentWcSlug ?? toWcParentSlug(parentSlug),
        }));
    }
    return [];
  }, [
    useLiveApi,
    isParentRoute,
    allCategories,
    parentSlug,
    parentLiveMenu,
    parentMenuId,
  ]);

  const parentChipSources = useMemo(() => {
    if (!isParentRoute) return [];
    if (liveParentChips?.length) {
      return liveParentChips.map((c) => ({ label: c.label, slug: c.slug }));
    }
    if (!useLiveApi && parentData?.chips.length) {
      return parentData.chips
        .filter((c) => c.slug && c.slug !== 'svi-proizvodi')
        .map((c) => ({ label: c.label, slug: c.slug! }));
    }
    return [];
  }, [isParentRoute, liveParentChips, useLiveApi, parentData]);

  const parentChipImages = useSubcategoryProductImages(parentChipSources);

  const listingData = listingSlug
    ? getProductListing(categorySlug, parentSlug, listingSlug)
    : isLeafProgramListingRoute(categorySlug, parentSlug, listingSlug)
      ? getProgramListing(categorySlug, parentSlug)
      : undefined;

  const wcCategorySlug =
    !parentData && listingData ? resolveListingCategorySlug(parentSlug, listingSlug) : undefined;

  const resolvedParentWc = useMemo(() => {
    if (!parentData) return undefined;
    if (allCategories?.length) {
      return findWcParentByInternalSlug(parentSlug, allCategories)?.slug;
    }
    return toWcParentSlug(parentSlug);
  }, [parentData, allCategories, parentSlug]);

  const parentWcSlug = resolvedParentWc;

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
    if (!useLiveApi || !listingData) return undefined;

    if (allCategories?.length) {
      const siblings = getLiveParentSubcategoryChips(parentSlug, allCategories);
      if (siblings.length) {
        return siblings.map((sub) => ({
          slug: sub.slug,
          label: sub.label,
          count: sub.count,
          image: sub.image,
          href: sub.href,
        }));
      }
    }

    if (!navLive) return undefined;
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
  }, [useLiveApi, listingData, allCategories, parentSlug, navLive, getCategoryById]);

  const listingParentWcSlug = useMemo(() => {
    if (categorySlug === 'alati') {
      if (allCategories?.length) {
        return (
          findWcParentByInternalSlug(parentSlug, allCategories)?.slug ??
          toWcParentSlug(parentSlug)
        );
      }
      return toWcParentSlug(parentSlug);
    }
    return programToWcSlug(parentSlug);
  }, [categorySlug, parentSlug, allCategories]);

  const saleCountQuery = useLiveSaleCount(useLiveApi ? listingParentWcSlug : undefined);

  const subcategoryImageSources = useMemo(() => {
    // Live API: never fall back to static catalogListing chips (fake counts).
    const siblings = liveListingChips ?? (!useLiveApi ? listingData?.chips : undefined) ?? [];
    return siblings
      .filter((c) => c.slug)
      .map((c) => ({
        label: c.label,
        slug: c.slug,
        image: c.image,
      }));
  }, [liveListingChips, useLiveApi, listingData?.chips]);

  const subcategoryImages = useSubcategoryProductImages(subcategoryImageSources);

  const highlightChips = useMemo(() => {
    const siblings = liveListingChips ?? (!useLiveApi ? listingData?.chips : undefined) ?? [];
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
    useLiveApi,
    listingData?.chips,
    listingParentWcSlug,
    saleCountQuery.data,
    subcategoryImages.data,
  ]);

  if (parentData) {
    const chipImagesSettled = !parentChipImages.isPending && !parentChipImages.isFetching;
    const chips =
      liveParentChips?.map((c) => ({
        slug: c.slug,
        label: c.label,
        count: c.count,
        href: c.href,
        image: parentChipImages.data?.[c.slug] || (chipImagesSettled ? c.image : undefined),
      })) ??
      (!useLiveApi
        ? parentData.chips.map((c) => ({
            ...c,
            image:
              (c.slug && parentChipImages.data?.[c.slug]) ||
              (chipImagesSettled ? c.image : undefined),
          }))
        : []);

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
        {useLiveApi && navLoading ? (
          <div className="container py-6">
            <CatalogStateMessage variant="loading" />
          </div>
        ) : chips.length > 0 ? (
          <SubcategoryChips
            chips={chips}
            title={parentData.sectionTitle}
            layout="cards"
            description=""
            imagesLoading={!chipImagesSettled}
          />
        ) : useLiveApi ? (
          <div className="container py-6">
            <CatalogStateMessage
              variant="empty"
              title="Nema kategorija"
              description="Za ovu kategoriju trenutno nema dostupnih kategorija u prodavnici."
            />
          </div>
        ) : null}
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

  if (!useLiveApi && !(initialListing && isDefaultListingQuery)) {
    return (
      <ShopLayout>
        <ListingHero breadcrumbs={listingData.breadcrumbs} title={listingData.title} />
        <div className="container py-12">
          <CatalogStateMessage variant="unavailable" />
        </div>
      </ShopLayout>
    );
  }

  const rawProducts = liveProducts.data?.products ?? initialListing?.products ?? [];
  const products =
    sort === 'bestsellers' ? markTopBestsellers(rawProducts) : rawProducts;
  const totalCount = liveProducts.data?.total ?? initialListing?.total ?? 0;
  const totalPages = liveProducts.data?.totalPages ?? initialListing?.totalPages ?? 0;
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
    if (liveProducts.isError && !hasInitialListing) {
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
