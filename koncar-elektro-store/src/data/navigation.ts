import {
  Zap, BatteryCharging, Wrench, Wind, Ruler, HardHat, Cog, Package,
  Sprout, Settings, Plug, Lightbulb, Sun, type LucideIcon,
} from 'lucide-react';
import imgElektricni from '@/assets/elektricni-alat.png';
import imgAku from '@/assets/aku-alat.png';
import imgRucni from '@/assets/rucni-alat.png';
import imgKompresor from '@/assets/kompresor.png';
import imgElektromaterijal from '@/assets/elektromaterijal.png';
import imgRasveta from '@/assets/rasveta.png';
import imgSolarne from '@/assets/solarne.png';
import productGeneric from '@/assets/product-generic.jpg';

export type MegaMenuSubcategory = {
  label: string;
  count: number;
  image: string;
};

export type MegaMenuCategory = {
  id: string;
  label: string;
  icon: LucideIcon;
  subcategories: MegaMenuSubcategory[];
  viewAllLabel: string;
};

export type MegaMenuMode = 'alati' | 'elektromaterijal' | 'rasveta' | 'solarne';

export const alatiMenuCategories: MegaMenuCategory[] = [
  {
    id: 'elektricni-alati',
    label: 'Električni alati',
    icon: Zap,
    viewAllLabel: 'Pogledajte sve električne alate',
    subcategories: [
      { label: 'Aku bušilice', count: 132, image: imgAku },
      { label: 'Akumulatorske bušilice', count: 78, image: imgAku },
      { label: 'Električne bušilice', count: 64, image: imgElektricni },
      { label: 'Električna čeona creva', count: 41, image: imgElektricni },
      { label: 'Električne brusilice', count: 54, image: imgElektricni },
      { label: 'Električne testere', count: 37, image: productGeneric },
      { label: 'Električne rende i glodalice', count: 29, image: productGeneric },
      { label: 'Električni ubodni testeri', count: 22, image: productGeneric },
      { label: 'Električni odvijači', count: 48, image: imgElektricni },
      { label: 'Električna merdevine', count: 18, image: productGeneric },
      { label: 'Električni čekići i bušači', count: 33, image: productGeneric },
      { label: 'Električni ekscentrični brusilice', count: 26, image: imgElektricni },
    ],
  },
  {
    id: 'aku-alati',
    label: 'Aku alati i baterije',
    icon: BatteryCharging,
    viewAllLabel: 'Pogledajte sve aku alate',
    subcategories: [
      { label: 'Aku bušilice', count: 96, image: imgAku },
      { label: 'Aku odvijači', count: 72, image: imgAku },
      { label: 'Aku brusilice', count: 58, image: imgAku },
      { label: 'Aku testere', count: 44, image: imgAku },
      { label: 'Aku čekići', count: 31, image: imgAku },
      { label: 'Baterije i punjači', count: 89, image: imgAku },
      { label: 'Aku setovi', count: 27, image: imgAku },
      { label: 'Aku usisivači', count: 19, image: productGeneric },
    ],
  },
  {
    id: 'rucni-alati',
    label: 'Ručni alati',
    icon: Wrench,
    viewAllLabel: 'Pogledajte sve ručne alate',
    subcategories: [
      { label: 'Ključevi i nasadni', count: 124, image: imgRucni },
      { label: 'Odvijači', count: 98, image: imgRucni },
      { label: 'Klešta i grip', count: 76, image: imgRucni },
      { label: 'Čekići i macole', count: 52, image: imgRucni },
      { label: 'Setovi alata', count: 67, image: imgRucni },
      { label: 'Merdevine i skele', count: 34, image: productGeneric },
      { label: 'Noževi i sekači', count: 41, image: imgRucni },
      { label: 'Pribor za alat', count: 88, image: imgRucni },
    ],
  },
  {
    id: 'pneumatski-alati',
    label: 'Pneumatski alati',
    icon: Wind,
    viewAllLabel: 'Pogledajte sve pneumatske alate',
    subcategories: [
      { label: 'Kompresori', count: 45, image: imgKompresor },
      { label: 'Pneumatski čekići', count: 22, image: imgKompresor },
      { label: 'Pištolji za farbanje', count: 38, image: productGeneric },
      { label: 'Pneumatski alati', count: 56, image: imgKompresor },
      { label: 'Crevo i priključci', count: 64, image: productGeneric },
      { label: 'Pneumatske brusilice', count: 19, image: productGeneric },
    ],
  },
  {
    id: 'merna-oprema',
    label: 'Merna oprema',
    icon: Ruler,
    viewAllLabel: 'Pogledajte svu mernu opremu',
    subcategories: [
      { label: 'Laserni daljinomeri', count: 28, image: productGeneric },
      { label: 'Nivoi i libele', count: 34, image: productGeneric },
      { label: 'Multimetri', count: 42, image: productGeneric },
      { label: 'Merne trake', count: 51, image: productGeneric },
      { label: 'Termometri', count: 23, image: productGeneric },
      { label: 'Detektori', count: 17, image: productGeneric },
    ],
  },
  {
    id: 'radna-oprema',
    label: 'Radna oprema i HTZ',
    icon: HardHat,
    viewAllLabel: 'Pogledajte svu radnu opremu',
    subcategories: [
      { label: 'Zaštitna obuća', count: 67, image: productGeneric },
      { label: 'Zaštitne rukavice', count: 89, image: productGeneric },
      { label: 'Zaštitne naočare', count: 45, image: productGeneric },
      { label: 'Radna odela', count: 38, image: productGeneric },
      { label: 'Kacige', count: 52, image: productGeneric },
      { label: 'Radne lampe', count: 31, image: productGeneric },
    ],
  },
  {
    id: 'masine-oprema',
    label: 'Mašine i oprema',
    icon: Cog,
    viewAllLabel: 'Pogledajte sve mašine',
    subcategories: [
      { label: 'Agregati', count: 34, image: productGeneric },
      { label: 'Kosačice', count: 48, image: productGeneric },
      { label: 'Traktori', count: 12, image: productGeneric },
      { label: 'Trimeri', count: 29, image: productGeneric },
      { label: 'Dizalice', count: 18, image: productGeneric },
      { label: 'Mašine za varenje', count: 41, image: productGeneric },
    ],
  },
  {
    id: 'potrosni-materijal',
    label: 'Potrošni materijal',
    icon: Package,
    viewAllLabel: 'Pogledajte sav potrošni materijal',
    subcategories: [
      { label: 'Burgije', count: 156, image: productGeneric },
      { label: 'Brusni i reznih diskovi', count: 134, image: productGeneric },
      { label: 'Elektrode', count: 78, image: productGeneric },
      { label: 'Varila', count: 45, image: productGeneric },
      { label: 'Lanci i noževi', count: 62, image: productGeneric },
      { label: 'Pribor za alat', count: 98, image: productGeneric },
    ],
  },
  {
    id: 'bastenski-alati',
    label: 'Baštenski alati',
    icon: Sprout,
    viewAllLabel: 'Pogledajte sve baštenske alate',
    subcategories: [
      { label: 'Kosačice', count: 42, image: productGeneric },
      { label: 'Trimeri', count: 35, image: productGeneric },
      { label: 'Motorni alati', count: 28, image: productGeneric },
      { label: 'Prskalice', count: 51, image: productGeneric },
      { label: 'Baštenski alati', count: 67, image: productGeneric },
      { label: 'Cevi i prskalice', count: 39, image: productGeneric },
    ],
  },
  {
    id: 'servis-delovi',
    label: 'Servis i rezervni delovi',
    icon: Settings,
    viewAllLabel: 'Pogledajte servis i delove',
    subcategories: [
      { label: 'Rezervni delovi', count: 234, image: productGeneric },
      { label: 'Servis alata', count: 18, image: productGeneric },
      { label: 'Garantni servis', count: 12, image: productGeneric },
      { label: 'Usluge održavanja', count: 8, image: productGeneric },
    ],
  },
];

export const otherProgramCategories: MegaMenuCategory[] = [
  {
    id: 'elektromaterijal',
    label: 'Elektromaterijal',
    icon: Plug,
    viewAllLabel: 'Pogledajte sav elektromaterijal',
    subcategories: [
      { label: 'Kablovi i provodnici', count: 186, image: imgElektromaterijal },
      { label: 'Osigurači', count: 124, image: imgElektromaterijal },
      { label: 'Prekidači i utičnice', count: 98, image: imgElektromaterijal },
      { label: 'Razvodne table', count: 67, image: imgElektromaterijal },
      { label: 'Kanalice i bužiri', count: 54, image: imgElektromaterijal },
      { label: 'LED trake', count: 43, image: imgElektromaterijal },
      { label: 'Fideri i releji', count: 38, image: imgElektromaterijal },
      { label: 'Oprema za instalacije', count: 72, image: imgElektromaterijal },
    ],
  },
  {
    id: 'rasveta',
    label: 'Rasveta',
    icon: Lightbulb,
    viewAllLabel: 'Pogledajte svu rasvetu',
    subcategories: [
      { label: 'LED sijalice', count: 156, image: imgRasveta },
      { label: 'LED panele', count: 89, image: imgRasveta },
      { label: 'Spoljašnja rasveta', count: 67, image: imgRasveta },
      { label: 'Reflektori', count: 54, image: imgRasveta },
      { label: 'Ulična rasveta', count: 42, image: imgRasveta },
      { label: 'Lusteri i plafonjere', count: 78, image: imgRasveta },
      { label: 'Industrijska rasveta', count: 35, image: imgRasveta },
      { label: 'Pametna rasveta', count: 28, image: imgRasveta },
    ],
  },
  {
    id: 'solarne',
    label: 'Solarne elektrane',
    icon: Sun,
    viewAllLabel: 'Pogledajte solarnu opremu',
    subcategories: [
      { label: 'Solarni paneli', count: 45, image: imgSolarne },
      { label: 'Inverteri', count: 38, image: imgSolarne },
      { label: 'Baterije', count: 29, image: imgSolarne },
      { label: 'Kompleti za kuću', count: 22, image: imgSolarne },
      { label: 'Nosači i konstrukcije', count: 34, image: imgSolarne },
      { label: 'Kablovi i konektori', count: 41, image: imgSolarne },
      { label: 'Monitoring sistemi', count: 18, image: imgSolarne },
      { label: 'Oprema za održavanje', count: 15, image: imgSolarne },
    ],
  },
];

export const defaultCategoryByMode: Record<MegaMenuMode, string> = {
  alati: 'elektricni-alati',
  elektromaterijal: 'elektromaterijal',
  rasveta: 'rasveta',
  solarne: 'solarne',
};

export const allMenuCategories = [...alatiMenuCategories, ...otherProgramCategories];

export const getCategoryById = (id: string) =>
  allMenuCategories.find((c) => c.id === id);
