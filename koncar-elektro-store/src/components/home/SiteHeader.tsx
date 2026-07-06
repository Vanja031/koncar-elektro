import {
  Phone, Search, User, ShoppingCart, Menu, ChevronDown,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaIcon, footerIcons, trustIcons } from './FaIcon';
import { SocialLinks } from './SocialLinks';
import { MegaMenu } from './MegaMenu';
import { MobileNav } from '@/components/layout/MobileNav';
import { MobileSearch } from '@/components/layout/MobileSearch';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { useCart } from '@/context/CartContext';
import type { MegaMenuMode } from '@/data/navigation';
import { getTopCategoryUrl, ROUTES } from '@/lib/catalogUrls';
import { contactChannels } from '@/data/staticPages';

/** Širina kolone logotipa — ista u gornjem redu i na tabu „Svi proizvodi”. */
const LOGO_COLUMN_WIDTH = 'w-[13rem]';

type NavItem = {
  label: string;
  href: string;
  highlight?: boolean;
  megaMode?: MegaMenuMode;
};

const navItems: NavItem[] = [
  { label: 'Akcija', href: ROUTES.sale, highlight: true },
  { label: 'Alati', href: getTopCategoryUrl('alati'), megaMode: 'alati' },
  { label: 'Elektromaterijal', href: getTopCategoryUrl('elektromaterijal'), megaMode: 'elektromaterijal' },
  { label: 'Rasveta', href: getTopCategoryUrl('rasveta'), megaMode: 'rasveta' },
  { label: 'Solarne elektrane', href: getTopCategoryUrl('solarne'), megaMode: 'solarne' },
];

export const SiteHeader = () => {
  const { itemCount: cartCount } = useCart();
  const [megaOpen, setMegaOpen] = useState(false);
  const [megaMode, setMegaMode] = useState<MegaMenuMode>('alati');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const megaZoneRef = useRef<HTMLDivElement>(null);

  const openMega = (mode: MegaMenuMode) => {
    setMegaMode(mode);
    setMegaOpen(true);
  };

  const closeMega = () => setMegaOpen(false);

  const handleMegaZoneLeave = (e: React.MouseEvent) => {
    const related = e.relatedTarget;
    if (related instanceof Node && megaZoneRef.current?.contains(related)) return;
    closeMega();
  };

  const toggleAllProducts = () => {
    if (megaOpen && megaMode === 'alati') {
      closeMega();
    } else {
      openMega('alati');
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMega();
        setMobileSearchOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (
        megaZoneRef.current &&
        target instanceof Node &&
        !megaZoneRef.current.contains(target)
      ) {
        closeMega();
      }
    };
    if (megaOpen) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [megaOpen]);

  useEffect(() => {
    if (!megaOpen) return;

    const onMove = (e: MouseEvent) => {
      const zone = megaZoneRef.current;
      if (!zone) return;

      const navRow = zone.querySelector('[data-mega-nav]') as HTMLElement | null;
      const menuBox = zone.querySelector('[data-mega-menu]') as HTMLElement | null;
      if (!navRow || !menuBox) return;

      const { clientX: x, clientY: y } = e;
      const hit = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
      };

      if (!hit(navRow) && !hit(menuBox)) {
        closeMega();
      }
    };

    document.addEventListener('mousemove', onMove);
    return () => document.removeEventListener('mousemove', onMove);
  }, [megaOpen]);

  return (
    <>
      <div className="bg-navy-dark text-white text-xs">
        <div className="container flex items-center justify-between h-8 gap-4">
          <span className="flex items-center gap-1.5">
            <FaIcon icon={trustIcons.support} className="w-3.5 h-3.5 text-accent shrink-0" />
            Stručna podrška
          </span>
          <span className="hidden sm:flex items-center gap-1.5 text-center">
            <FaIcon icon={footerIcons.clock} className="w-3.5 h-3.5 text-accent shrink-0" />
            Radnim danom 08:00–20:00 | Subotom 08:00–16:00
          </span>
          <span className="flex items-center gap-1.5">
            <FaIcon icon={trustIcons.warranty} className="w-3.5 h-3.5 text-accent shrink-0" />
            Garancija na sve proizvode
          </span>
        </div>
      </div>

      <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container py-2 sm:py-3 flex items-center gap-2 sm:gap-3 lg:gap-6">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="lg:hidden header-mobile-action -ml-1"
            aria-label="Otvori meni"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link
            to="/"
            className={`min-w-0 shrink-0 overflow-hidden hidden sm:block ${LOGO_COLUMN_WIDTH}`}
          >
            <BrandLogo className="h-10 max-w-full min-[380px]:h-11 lg:h-14" />
          </Link>
          <Link
            to="/"
            className="flex-1 min-w-0 flex justify-center items-center overflow-hidden px-1 sm:hidden"
          >
            <BrandLogo className="h-9 w-auto max-w-full max-h-10 object-contain" />
          </Link>

          <div className="flex-1 hidden md:flex items-stretch h-11 border border-border rounded overflow-hidden max-w-xl lg:max-w-2xl mx-auto">
            <input
              type="search"
              placeholder="Pretražite proizvode, kategorije ili brendove..."
              className="flex-1 px-4 text-sm outline-none bg-white placeholder:text-muted-foreground"
            />
            <button type="button" className="px-4 bg-primary text-white hover:brightness-110 transition-all">
              <Search className="w-5 h-5" />
            </button>
          </div>

          <a
            href={contactChannels.primaryPhoneHref}
            className="hidden lg:flex items-center gap-2.5 bg-secondary rounded px-3 h-11 shrink-0 hover:bg-muted transition-colors header-expert-banner"
          >
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-accent-foreground" />
            </div>
            <div className="text-xs leading-tight min-w-0">
              <div className="font-semibold text-primary uppercase text-[10px] tracking-wide">Pozovite stručnjaka</div>
              <div className="font-bold text-sm text-primary whitespace-nowrap">{contactChannels.primaryPhone}</div>
            </div>
          </a>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">
            <button
              type="button"
              onClick={() => setMobileSearchOpen(true)}
              className="md:hidden header-mobile-action"
              aria-label="Pretraga"
            >
              <Search className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2.5">
              <User className="w-6 h-6 text-primary shrink-0" />
              <div className="flex flex-col leading-tight text-xs">
                <Link to={ROUTES.login} className="text-foreground hover:text-primary transition-colors font-medium">
                  Prijava
                </Link>
                <Link to={ROUTES.register} className="text-foreground hover:text-primary transition-colors font-medium">
                  Registracija
                </Link>
              </div>
            </div>
            <Link
              to={ROUTES.cart}
              className="flex items-center gap-1.5 text-xs text-foreground hover:text-primary transition-colors relative shrink-0"
            >
              <span className="md:hidden header-mobile-action relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </span>
              <ShoppingCart className="w-6 h-6 text-primary shrink-0 hidden md:block" />
              <span className="hidden lg:inline font-medium">Korpa</span>
              {cartCount > 0 && (
                <span className="hidden md:flex lg:static lg:ml-0 w-5 h-5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div
          ref={megaZoneRef}
          className="relative hidden lg:block border-t border-border bg-white header-nav-row"
          onMouseLeave={handleMegaZoneLeave}
        >
          <div data-mega-nav className="container flex items-center h-11 gap-1">
            <button
              type="button"
              onClick={toggleAllProducts}
              className={`flex items-center justify-center gap-2 h-11 font-display font-semibold uppercase text-sm transition-all shrink-0 ${LOGO_COLUMN_WIDTH} ${
                megaOpen
                  ? 'bg-accent/90 text-accent-foreground'
                  : 'bg-accent text-accent-foreground hover:brightness-105'
              }`}
            >
              <Menu className="w-4 h-4" />
              Svi proizvodi
              <ChevronDown className={`w-4 h-4 transition-transform ${megaOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className="flex items-center gap-0.5 ml-2">
              {navItems.map((item) => {
                const isActive = megaOpen && item.megaMode === megaMode;
                const className = `px-3 h-11 flex items-center gap-1 text-sm font-medium whitespace-nowrap transition-colors ${
                  item.highlight
                    ? 'text-destructive font-semibold hover:text-destructive'
                    : isActive
                      ? 'text-primary font-semibold'
                      : 'text-foreground hover:text-primary'
                }`;

                if (item.href.startsWith('/')) {
                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      onMouseEnter={() => (item.megaMode ? openMega(item.megaMode) : closeMega())}
                      onFocus={() => (item.megaMode ? openMega(item.megaMode) : closeMega())}
                      className={className}
                    >
                      {item.label}
                      {item.megaMode && (
                        <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform ${isActive ? 'rotate-180' : ''}`} />
                      )}
                    </Link>
                  );
                }

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onMouseEnter={() => (item.megaMode ? openMega(item.megaMode) : closeMega())}
                    onFocus={() => (item.megaMode ? openMega(item.megaMode) : closeMega())}
                    className={className}
                  >
                    {item.label}
                    {item.megaMode && (
                      <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform ${isActive ? 'rotate-180' : ''}`} />
                    )}
                  </a>
                );
              })}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <SocialLinks variant="header" />
            </div>
          </div>

          {megaOpen && <MegaMenu mode={megaMode} onClose={closeMega} />}
        </div>

        <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
        <MobileSearch open={mobileSearchOpen} onOpenChange={setMobileSearchOpen} />
      </header>
    </>
  );
};
