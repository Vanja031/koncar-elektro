import {
  Phone, Search, User, ShoppingCart, Menu, ChevronDown,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaIcon, footerIcons, trustIcons } from './FaIcon';
import { SocialIcon } from './SocialIcon';
import { SocialLinks } from './SocialLinks';
import { MegaMenu } from './MegaMenu';
import { MobileNav } from '@/components/layout/MobileNav';
import { MobileSearch } from '@/components/layout/MobileSearch';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { useCart } from '@/context/CartContext';
import type { MegaMenuMode } from '@/data/navigation';
import { getTopCategoryUrl, ROUTES } from '@/lib/catalogUrls';
import { companyInfo, contactChannels } from '@/data/staticPages';

type NavItem = {
  label: string;
  href: string;
  highlight?: boolean;
  megaMode?: MegaMenuMode;
};

const navItems: NavItem[] = [
  { label: 'Početna', href: ROUTES.home },
  { label: 'Akcija', href: ROUTES.sale, highlight: true },
  { label: 'Alati', href: getTopCategoryUrl('alati'), megaMode: 'alati' },
  { label: 'Elektromaterijal', href: getTopCategoryUrl('elektromaterijal'), megaMode: 'elektromaterijal' },
  { label: 'Rasveta', href: getTopCategoryUrl('rasveta'), megaMode: 'rasveta' },
  { label: 'Solarne elektrane', href: getTopCategoryUrl('solarne'), megaMode: 'solarne' },
  { label: 'O nama', href: ROUTES.about },
  { label: 'Kontakt', href: ROUTES.contact },
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
            className="lg:hidden flex items-center justify-center w-10 h-10 -ml-1 rounded-lg border border-border hover:bg-secondary transition-colors shrink-0"
            aria-label="Otvori meni"
          >
            <Menu className="w-5 h-5 text-primary" />
          </button>

          <Link to="/" className="min-w-0 flex-1 sm:flex-none overflow-hidden">
            <BrandLogo className="h-6 max-w-[6.5rem] min-[380px]:h-7 min-[380px]:max-w-[7.25rem] sm:h-12 sm:max-w-none lg:h-14" />
            <div className="hidden sm:block text-[10px] text-destructive font-semibold tracking-wider uppercase mt-0.5 truncate">
              {companyInfo.tagline}
            </div>
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

          <div className="hidden xl:flex items-center gap-3 shrink-0">
            <a href={contactChannels.primaryPhoneHref} className="flex items-center gap-2 bg-secondary rounded px-3 py-2 hover:bg-muted transition-colors">
              <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-accent-foreground" />
              </div>
              <div className="text-xs leading-tight">
                <div className="font-semibold text-primary uppercase">Pozovite stručnjaka</div>
                <div className="font-bold text-sm">{contactChannels.primaryPhone}</div>
                <div className="text-muted-foreground">08–20h radnim danima</div>
              </div>
            </a>
            <a href="#" className="flex items-center gap-2 bg-secondary rounded px-3 py-2 hover:bg-muted transition-colors">
              <SocialIcon name="viber" className="w-9 h-9" />
              <div className="text-xs leading-tight">
                <div className="font-semibold text-primary uppercase">Viber podrška</div>
                <div className="font-bold text-sm">063 123 4567</div>
                <div className="text-muted-foreground">Kliknite za chat</div>
              </div>
            </a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">
            <button
              type="button"
              onClick={() => setMobileSearchOpen(true)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-secondary transition-colors"
              aria-label="Pretraga"
            >
              <Search className="w-5 h-5 text-primary" />
            </button>
            <a href="#" className="hidden sm:flex items-center gap-1.5 text-xs text-foreground hover:text-primary transition-colors">
              <User className="w-5 h-5" />
              <span className="hidden lg:inline">Prijava / registracija</span>
            </a>
            <Link to={ROUTES.cart} className="flex items-center gap-1.5 text-xs text-foreground hover:text-primary transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden lg:inline font-medium">Korpa</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 lg:static lg:ml-0 w-5 h-5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div
          ref={megaZoneRef}
          className="relative hidden lg:block border-t border-border bg-white"
          onMouseLeave={handleMegaZoneLeave}
        >
          <div data-mega-nav className="container flex items-center h-11 gap-1">
            <button
              type="button"
              onClick={toggleAllProducts}
              className={`flex items-center gap-2 px-4 h-11 font-display font-semibold uppercase text-sm transition-all shrink-0 ${
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
