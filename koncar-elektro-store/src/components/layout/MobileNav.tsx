import { useState } from 'react';
import {
  ChevronRight, Phone, Flame, Info, Mail, UserPlus,
} from 'lucide-react';
import { Link } from '@/lib/router-compat';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useNavigationMenu } from '@/hooks/api/useNavigationMenu';
import {
  getMegaMenuCategoryUrl,
  getTopCategoryUrl,
  resolveMegaMenuSubcategoryUrl,
  ROUTES,
} from '@/lib/catalogUrls';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { contactChannels } from '@/data/staticPages';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const MobileNav = ({ open, onOpenChange }: Props) => {
  const { alatiMenuCategories, otherProgramCategories, isLoading, isError } = useNavigationMenu();
  const [openSection, setOpenSection] = useState<string | null>('alati');

  const close = () => onOpenChange(false);

  const subcategoryUrl = (menuId: string, sub: Parameters<typeof resolveMegaMenuSubcategoryUrl>[1]) =>
    resolveMegaMenuSubcategoryUrl(menuId, sub);

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[min(100vw,22rem)] sm:max-w-sm p-0 flex flex-col gap-0 border-r border-border [&>button]:top-3.5 [&>button]:right-3.5"
      >
        <SheetHeader className="px-4 py-4 border-b border-border bg-secondary/30 text-left space-y-2">
          <SheetTitle className="text-left p-0">
            <BrandLogo height="sm" className="max-w-[10rem]" />
          </SheetTitle>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
            Katalog i kategorije
          </p>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto koncar-scrollbar py-2">
          <ul className="px-2 space-y-0.5">
            <li>
              <Link
                to={ROUTES.login}
                onClick={close}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                <UserPlus className="w-4 h-4 text-primary shrink-0" />
                Prijava / Registracija
              </Link>
            </li>
            <li>
              <Link
                to="/akcija"
                onClick={close}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold text-destructive hover:bg-destructive/5 transition-colors"
              >
                <Flame className="w-4 h-4 shrink-0 fill-destructive/20" />
                Akcija
              </Link>
            </li>
          </ul>

          <div className="my-3 border-t border-border" />

          <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Alati i oprema
          </p>

          <Link
            to={getTopCategoryUrl('alati')}
            onClick={close}
            className="mx-2 mb-2 flex items-center justify-between px-3 py-2.5 rounded-lg bg-accent/15 text-sm font-display font-semibold text-primary uppercase"
          >
            Svi alati
            <ChevronRight className="w-4 h-4 text-accent" />
          </Link>

          {isLoading ? (
            <p className="px-4 py-2 text-xs text-muted-foreground">Učitavanje kategorija…</p>
          ) : isError ? (
            <p className="px-4 py-2 text-xs text-destructive">Kategorije nisu učitane. Pokušajte ponovo.</p>
          ) : null}

          <ul className="px-2 space-y-0.5">
            {alatiMenuCategories.map((cat) => {
              const Icon = cat.icon;
              const isOpen = openSection === cat.id;
              return (
                <li key={cat.id}>
                  <Collapsible open={isOpen} onOpenChange={() => toggleSection(cat.id)}>
                    <CollapsibleTrigger className="flex w-full items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                      <Icon className="w-4 h-4 shrink-0 text-primary/80" strokeWidth={1.75} />
                      <span className="flex-1 text-left leading-snug">{cat.label}</span>
                      <ChevronRight className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 pr-1 pb-1">
                      <Link
                        to={getMegaMenuCategoryUrl(cat.id)}
                        onClick={close}
                        className="block px-3 py-2 text-xs font-semibold text-primary hover:underline"
                      >
                        Pogledajte sve →
                      </Link>
                      <ul className="space-y-0.5 max-h-[12rem] overflow-y-auto koncar-scrollbar">
                        {cat.subcategories.map((sub) => (
                          <li key={sub.slug ?? sub.label}>
                            <Link
                              to={subcategoryUrl(cat.id, sub)}
                              onClick={close}
                              className="block px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-primary hover:bg-secondary/60 transition-colors line-clamp-2"
                            >
                              {sub.label}
                              <span className="text-[10px] text-muted-foreground/70 ml-1">({sub.count})</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                </li>
              );
            })}
          </ul>

          <div className="my-3 border-t border-border" />

          <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Ostali programi
          </p>

          <ul className="px-2 space-y-0.5 pb-4">
            {otherProgramCategories.map((cat) => {
              const Icon = cat.icon;
              const isOpen = openSection === cat.id;
              return (
                <li key={cat.id}>
                  <Collapsible open={isOpen} onOpenChange={() => toggleSection(cat.id)}>
                    <CollapsibleTrigger className="flex w-full items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                      <Icon className="w-4 h-4 shrink-0 text-primary/80" strokeWidth={1.75} />
                      <span className="flex-1 text-left leading-snug">{cat.label}</span>
                      <ChevronRight className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 pr-1 pb-1">
                      <Link
                        to={getMegaMenuCategoryUrl(cat.id)}
                        onClick={close}
                        className="block px-3 py-2 text-xs font-semibold text-primary hover:underline"
                      >
                        Pogledajte sve →
                      </Link>
                      <ul className="space-y-0.5">
                        {cat.subcategories.map((sub) => (
                          <li key={sub.label}>
                            <Link
                              to={subcategoryUrl(cat.id, sub)}
                              onClick={close}
                              className="block px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-primary hover:bg-secondary/60 transition-colors line-clamp-2"
                            >
                              {sub.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                </li>
              );
            })}
          </ul>

          <div className="my-3 border-t border-border" />

          <ul className="px-2 space-y-0.5 pb-4">
            <li>
              <Link
                to="/o-nama"
                onClick={close}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                <Info className="w-4 h-4 text-primary shrink-0" />
                O nama
              </Link>
            </li>
            <li>
              <Link
                to="/kontakt"
                onClick={close}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                <Mail className="w-4 h-4 text-primary shrink-0" />
                Kontakt
              </Link>
            </li>
          </ul>
        </nav>

        <div className="shrink-0 border-t border-border p-4 bg-secondary/20">
          <a
            href={contactChannels.primaryPhoneHref}
            className="flex items-center gap-3 btn-yellow w-full justify-center text-xs py-3"
          >
            <Phone className="w-4 h-4" />
            Pozovite {contactChannels.primaryPhone}
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
};
