'use client';

import { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link, Navigate, useParams } from '@/lib/router-compat';
import { ShopLayout } from '@/components/layout/ShopLayout';
import { CategoryHero, SubcategoryGrid } from '@/components/catalog/CategoryHero';
import { CatalogInfoSections } from '@/components/catalog/CatalogInfoSections';
import { CatalogStateMessage } from '@/components/catalog/CatalogStateMessage';
import { Carousel } from '@/components/home/Carousel';
import { ProductCard } from '@/components/home/ProductCard';
import { getCategoryPage } from '@/data/categoryPages';
import type { SubcategoryItem } from '@/data/categoryPages';
import { useCategoryPageLive } from '@/hooks/api/useCategoryPageLive';
import { useLiveBestSellers } from '@/hooks/api/useLiveCatalog';
import { useSubcategoryProductImages } from '@/hooks/api/useSubcategoryProductImages';
import { useLiveApi } from '@/lib/api/config';
import {
  getProductCategoryUrl,
  getProductListingUrl,
  getTopCategoryUrl,
} from '@/lib/catalogUrls';
import { resolveSubcategoryImage } from '@/lib/subcategoryImages';
import { programToWcSlug, toWcParentSlug } from '@/lib/wcSlugs';

type Props = {
  /** When rendered from `/product-category/:program`, bypass URL param. */
  programSlug?: string;
};

const CategoryPage = ({ programSlug }: Props) => {
  const { slug: paramSlug } = useParams();
  const slug = programSlug ?? paramSlug ?? 'alati';
  const staticData = getCategoryPage(slug);
  const { subcategories: liveSubcategories, isLive, isLoading } = useCategoryPageLive(slug);

  const hubImageSlugs = useMemo(() => {
    if (!isLive || liveSubcategories.length === 0) return [];
    return liveSubcategories.map((item) => ({
      label: item.name,
      slug: item.wcSlug ?? toWcParentSlug(item.slug),
    }));
  }, [isLive, liveSubcategories]);

  const { data: hubImages } = useSubcategoryProductImages(hubImageSlugs);

  const subcategories = useMemo((): SubcategoryItem[] => {
    const base =
      isLive && liveSubcategories.length > 0 ? liveSubcategories : staticData?.subcategories ?? [];

    return base.map((item) => ({
      ...item,
      image: resolveSubcategoryImage(
        item.wcSlug ?? toWcParentSlug(item.slug),
        item.slug,
        hubImages,
        item.image,
      ),
    }));
  }, [isLive, liveSubcategories, staticData?.subcategories, hubImages]);

  const bestSellerCategory =
    slug === 'alati' ? undefined : programToWcSlug(slug);
  const liveBestSellers = useLiveBestSellers({
    perPage: 8,
    categorySlug: useLiveApi ? bestSellerCategory : undefined,
  });

  if (!staticData) {
    return <Navigate to={getTopCategoryUrl('alati')} replace />;
  }

  const listingHref =
    slug === 'alati'
      ? getProductListingUrl('alati', 'elektricni-alat', 'busilice-i-odvijaci')
      : getProductCategoryUrl(slug, subcategories[0]?.slug ?? '');

  const bestSellers = useLiveApi ? (liveBestSellers.data?.products ?? []) : staticData.bestSellers;

  return (
    <ShopLayout>
      <CategoryHero data={staticData} />

      {useLiveApi && isLoading ? (
        <div className="container py-10">
          <CatalogStateMessage variant="loading" />
        </div>
      ) : subcategories.length > 0 ? (
        <SubcategoryGrid
          title={staticData.slug === 'alati' ? 'Izaberite kategoriju alata' : 'Izaberite podkategoriju'}
          items={subcategories}
          categorySlug={staticData.slug}
        />
      ) : isLive ? (
        <div className="container py-10">
          <CatalogStateMessage
            variant="empty"
            title="Nema podkategorija"
            description="Za ovu kategoriju trenutno nema dostupnih podkategorija u prodavnici."
          />
        </div>
      ) : null}

      <section className="container py-8 border-t border-border">
        <div className="flex items-center justify-between mb-4 gap-4">
          <h2 className="section-heading text-lg md:text-xl">
            Najprodavaniji proizvodi iz kategorije {staticData.title.toLowerCase()}
          </h2>
          <Link to={listingHref} className="section-link">
            Pogledajte sve proizvode <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {useLiveApi && liveBestSellers.isLoading ? (
          <CatalogStateMessage variant="loading" />
        ) : useLiveApi && liveBestSellers.isError ? (
          <CatalogStateMessage variant="error" onRetry={() => liveBestSellers.refetch()} />
        ) : bestSellers.length > 0 ? (
          <Carousel edgeArrowsOnMobile>
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} bestseller />
            ))}
          </Carousel>
        ) : useLiveApi ? (
          <CatalogStateMessage variant="empty" />
        ) : null}
      </section>

      <CatalogInfoSections
        variant="category"
        whyBuy={staticData.whyBuy}
        faq={staticData.faq}
      />
    </ShopLayout>
  );
};

export default CategoryPage;
