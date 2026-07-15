import { useEffect, useState } from 'react';
import { ArrowRight, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from '@/lib/router-compat';
import type { MegaMenuMode, MegaMenuSubcategory } from '@/data/navigation';
import { defaultCategoryByMode } from '@/data/navigation';
import { CatalogStateMessage } from '@/components/catalog/CatalogStateMessage';
import { useNavigationMenu } from '@/hooks/api/useNavigationMenu';
import { useSubcategoryProductImages } from '@/hooks/api/useSubcategoryProductImages';
import {
  getMegaMenuCategoryUrl,
  resolveMegaMenuSubcategoryUrl,
} from '@/lib/catalogUrls';

type Props = {
  mode: MegaMenuMode;
  onClose?: () => void;
};

const MegaMenuSubcategoryMedia = ({
  sub,
  productSrc,
  imagesLoading,
}: {
  sub: MegaMenuSubcategory;
  productSrc?: string;
  imagesLoading: boolean;
}) => {
  if (productSrc) {
    return (
      <img
        src={productSrc}
        alt=""
        className="group-hover:scale-105 transition-transform"
      />
    );
  }

  if (imagesLoading && sub.slug) {
    return (
      <div className="mega-menu-card-image-skeleton" aria-hidden>
        <Loader2 className="w-5 h-5 text-muted-foreground/50 animate-spin" />
      </div>
    );
  }

  return <div className="mega-menu-card-image-empty" aria-hidden />;
};

export const MegaMenu = ({ mode, onClose }: Props) => {
  const {
    alatiMenuCategories,
    otherProgramCategories,
    getCategoryById,
    isLoading,
    isError,
    refetch,
  } = useNavigationMenu();

  const [activeId, setActiveId] = useState(defaultCategoryByMode[mode]);

  useEffect(() => {
    setActiveId(defaultCategoryByMode[mode]);
  }, [mode]);

  const active = getCategoryById(activeId) ?? alatiMenuCategories[0];
  const {
    data: productImages,
    isFetching: imagesFetching,
    isPending: imagesPending,
  } = useSubcategoryProductImages(active.subcategories);
  const imagesLoading = imagesPending || imagesFetching;

  const subcategoryUrl = (menuId: string, sub: Parameters<typeof resolveMegaMenuSubcategoryUrl>[1]) =>
    resolveMegaMenuSubcategoryUrl(menuId, sub);

  return (
    <div className="mega-menu-panel absolute left-0 right-0 top-full z-40 pointer-events-none">
      <div data-mega-menu className="container mb-6 pointer-events-auto -mt-1 pt-1">
        <div className="mega-menu-inner flex">
          <aside className="mega-menu-sidebar koncar-scrollbar shrink-0 flex flex-col overflow-y-auto bg-[#eef2f7]">
            <div className="mega-menu-sidebar-alati pr-0">
              <p className="mega-menu-sidebar-label mega-menu-sidebar-label--muted">
                Alati i oprema
              </p>
              <ul>
                {alatiMenuCategories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeId === cat.id;
                  return (
                    <li key={cat.id}>
                      <Link
                        to={getMegaMenuCategoryUrl(cat.id)}
                        onMouseEnter={() => setActiveId(cat.id)}
                        onFocus={() => setActiveId(cat.id)}
                        onClick={onClose}
                        className={`mega-menu-nav-item w-full ${isActive ? 'mega-menu-nav-item--active' : ''}`}
                      >
                        <Icon className="mega-menu-nav-icon shrink-0" strokeWidth={1.85} />
                        <span className="flex-1 text-left leading-snug tracking-wide text-foreground">
                          {cat.label}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-40" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mega-menu-sidebar-programs pr-0 mt-auto">
              <p className="mega-menu-sidebar-label">
                Ostali programi
              </p>
              <ul>
                {otherProgramCategories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeId === cat.id;
                  return (
                    <li key={cat.id}>
                      <Link
                        to={getMegaMenuCategoryUrl(cat.id)}
                        onMouseEnter={() => setActiveId(cat.id)}
                        onFocus={() => setActiveId(cat.id)}
                        onClick={onClose}
                        className={`mega-menu-nav-item mega-menu-nav-item--program w-full ${isActive ? 'mega-menu-nav-item--active' : ''}`}
                      >
                        <Icon className="mega-menu-nav-icon shrink-0" strokeWidth={1.85} />
                        <span className="flex-1 text-left leading-snug uppercase text-[12px] font-semibold tracking-wider text-primary">
                          {cat.label}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-primary/50" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          <div className="mega-menu-content flex-1 flex flex-col min-w-0 min-h-0 bg-white">
            <Link
              to={getMegaMenuCategoryUrl(active.id)}
              onClick={onClose}
              className="title-accent-line font-display font-bold text-primary uppercase text-sm tracking-wider mb-2 shrink-0 px-4 pt-4 hover:text-primary/80 transition-colors"
            >
              {active.label}
            </Link>

            {isLoading ? (
              <p className="px-4 text-sm text-muted-foreground">Učitavanje kategorija…</p>
            ) : isError ? (
              <div className="px-4 pb-3">
                <CatalogStateMessage variant="error" onRetry={() => refetch()} className="py-6" />
              </div>
            ) : active.subcategories.length === 0 ? (
              <p className="px-4 text-sm text-muted-foreground">
                Trenutno nema kategorija za ovaj program.
              </p>
            ) : (
              <div className="mega-menu-grid koncar-scrollbar grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 px-4 content-start pb-1">
                {active.subcategories.map((sub) => (
                  <Link
                    key={sub.slug ?? sub.label}
                    to={subcategoryUrl(active.id, sub)}
                    onClick={onClose}
                    className="mega-menu-card group"
                  >
                    <div className="mega-menu-card-image">
                      <MegaMenuSubcategoryMedia
                        sub={sub}
                        productSrc={sub.slug ? productImages?.[sub.slug] : undefined}
                        imagesLoading={imagesLoading}
                      />
                    </div>
                    <div className="mega-menu-card-body">
                      <p className="font-display font-bold text-primary text-[11px] lg:text-xs uppercase tracking-wide leading-tight line-clamp-2">
                        {sub.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground/80 mt-0.5 tracking-wide">
                        {sub.count} proizvoda
                      </p>
                      <ArrowRight className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-primary/35 group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="mega-menu-footer shrink-0 px-4 pb-3 pt-1.5">
              <Link
                to={getMegaMenuCategoryUrl(active.id)}
                onClick={onClose}
                className="mega-menu-view-all"
              >
                {active.viewAllLabel}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
