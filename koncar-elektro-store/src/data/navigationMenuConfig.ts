import {
  Zap, BatteryFull, Wrench, Wind, Ruler, HardHat, Cog, Package,
  Sprout, Plug, Lightbulb, Sun, type LucideIcon,
} from 'lucide-react';
import imgElektricni from '@/assets/elektricni-alat.png';
import imgAku from '@/assets/aku-alat.png';
import imgRucni from '@/assets/rucni-alat.png';
import imgKompresor from '@/assets/kompresor.png';
import imgElektromaterijal from '@/assets/elektromaterijal.png';
import imgRasveta from '@/assets/rasveta.png';
import imgSolarne from '@/assets/solarne.png';
import productGeneric from '@/assets/product-generic.jpg';

export type NavigationMenuDef = {
  id: string;
  label: string;
  icon: LucideIcon;
  viewAllLabel: string;
  fallbackImage: string;
  /** Direct WC parent slug when internal map does not apply. */
  wcParentSlug?: string;
  /** Pull specific WC child categories by slug (e.g. merna oprema under aku program). */
  wcChildSlugs?: string[];
};

export const alatiMenuDefs: NavigationMenuDef[] = [
  {
    id: 'elektricni-alati',
    label: 'Električni alati',
    icon: Zap,
    viewAllLabel: 'Pogledajte sve električne alate',
    fallbackImage: imgElektricni,
  },
  {
    id: 'aku-alati',
    label: 'Aku alati i baterije',
    icon: BatteryFull,
    viewAllLabel: 'Pogledajte sve aku alate',
    fallbackImage: imgAku,
  },
  {
    id: 'rucni-alati',
    label: 'Ručni alati',
    icon: Wrench,
    viewAllLabel: 'Pogledajte sve ručne alate',
    fallbackImage: imgRucni,
  },
  {
    id: 'pneumatski-alati',
    label: 'Pneumatski alati',
    icon: Wind,
    viewAllLabel: 'Pogledajte sve pneumatske alate',
    fallbackImage: imgKompresor,
  },
  {
    id: 'merna-oprema',
    label: 'Merna oprema',
    icon: Ruler,
    viewAllLabel: 'Pogledajte svu mernu opremu',
    fallbackImage: productGeneric,
    wcChildSlugs: ['laseri', 'daljinomeri', 'detektori'],
  },
  {
    id: 'radna-oprema',
    label: 'Radna oprema i HTZ',
    icon: HardHat,
    viewAllLabel: 'Pogledajte svu radnu opremu',
    fallbackImage: productGeneric,
  },
  {
    id: 'masine-oprema',
    label: 'Mašine i oprema',
    icon: Cog,
    viewAllLabel: 'Pogledajte sve mašine',
    fallbackImage: productGeneric,
  },
  {
    id: 'potrosni-materijal',
    label: 'Potrošni materijal',
    icon: Package,
    viewAllLabel: 'Pogledajte sav potrošni materijal',
    fallbackImage: productGeneric,
  },
  {
    id: 'bastenski-alati',
    label: 'Baštenski alati',
    icon: Sprout,
    viewAllLabel: 'Pogledajte sve baštenske alate',
    fallbackImage: productGeneric,
  },
];

export const otherProgramMenuDefs: NavigationMenuDef[] = [
  {
    id: 'elektromaterijal',
    label: 'Elektromaterijal',
    icon: Plug,
    viewAllLabel: 'Pogledajte sav elektromaterijal',
    fallbackImage: imgElektromaterijal,
  },
  {
    id: 'rasveta',
    label: 'Rasveta',
    icon: Lightbulb,
    viewAllLabel: 'Pogledajte svu rasvetu',
    fallbackImage: imgRasveta,
  },
  {
    id: 'solarne',
    label: 'Solarne elektrane',
    icon: Sun,
    viewAllLabel: 'Pogledajte solarnu opremu',
    fallbackImage: imgSolarne,
  },
];
