import { useEffect, useState } from 'react';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  alatiMenuCategories,
  otherProgramCategories,
  defaultCategoryByMode,
  getCategoryById,
  type MegaMenuMode,
} from '@/data/navigation';

type Props = {
  mode: MegaMenuMode;
  onClose?: () => void;
};

const PRODUCTS_LISTING_URL = '/kategorija/alati/elektricni-alat/busilice-i-odvijaci';

export const MegaMenu = ({ mode, onClose }: Props) => {
  const [activeId, setActiveId] = useState(defaultCategoryByMode[mode]);

  useEffect(() => {
    setActiveId(defaultCategoryByMode[mode]);
  }, [mode]);

  const active = getCategoryById(activeId) ?? alatiMenuCategories[0];

  const subcategoryHref = (label: string) => {
    const slug = label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    if (activeId === 'elektricni-alati') {
      return `/kategorija/alati/elektricni-alat/busilice-i-odvijaci`;
    }
    if (otherProgramCategories.some((c) => c.id === activeId)) {
      return `/kategorija/${activeId}`;
    }
    return `/kategorija/alati/${slug}`;
  };

  return (
    <div className="mega-menu-panel absolute left-0 right-0 top-full z-40 pointer-events-none">
      <div data-mega-menu className="container mb-6 pointer-events-auto -mt-1 pt-1">
        <div className="mega-menu-inner flex">
          {/* Left sidebar */}
          <aside className="mega-menu-sidebar koncar-scrollbar w-[17.5rem] shrink-0 py-5 pr-0 overflow-y-auto">
            <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Alati i oprema
            </p>
            <ul className="mb-5">
              {alatiMenuCategories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeId === cat.id;
                return (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveId(cat.id)}
                      onFocus={() => setActiveId(cat.id)}
                      className={`mega-menu-nav-item w-full ${isActive ? 'mega-menu-nav-item--active' : ''}`}
                    >
                      <Icon className="w-4 h-4 shrink-0 opacity-80" strokeWidth={1.75} />
                      <span className="flex-1 text-left leading-snug">{cat.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-40" />
                    </button>
                  </li>
                );
              })}
            </ul>

            <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Ostali programi
            </p>
            <ul>
              {otherProgramCategories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeId === cat.id;
                return (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveId(cat.id)}
                      onFocus={() => setActiveId(cat.id)}
                      className={`mega-menu-nav-item w-full ${isActive ? 'mega-menu-nav-item--active' : ''}`}
                    >
                      <Icon className="w-4 h-4 shrink-0 opacity-80" strokeWidth={1.75} />
                      <span className="flex-1 text-left leading-snug">{cat.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-40" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Right content */}
          <div className="mega-menu-content flex-1 flex flex-col min-w-0 min-h-0 bg-white">
            <h3 className="title-accent-line font-display font-bold text-primary uppercase text-base tracking-wide mb-3 shrink-0 px-6 pt-5">
              {active.label}
            </h3>

            <div className="mega-menu-grid grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 px-6 content-start">
              {active.subcategories.map((sub) => (
                <Link
                  key={sub.label}
                  to={subcategoryHref(sub.label)}
                  onClick={onClose}
                  className="mega-menu-card group"
                >
                  <div className="mega-menu-card-image">
                    <img
                      src={sub.image}
                      alt=""
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  </div>
                  <div className="mega-menu-card-body">
                    <p className="font-display font-bold text-primary text-[11px] leading-tight pr-5 line-clamp-2">
                      {sub.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {sub.count} proizvoda
                    </p>
                    <ArrowRight className="absolute right-2 bottom-2.5 w-3.5 h-3.5 text-primary/40 group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>

            <div className="mega-menu-footer shrink-0 px-6 pb-3 pt-2">
              <Link to={PRODUCTS_LISTING_URL} onClick={onClose} className="mega-menu-view-all">
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
