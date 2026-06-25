export type Product = {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  oldPrice?: number;
  badge?: 'sale' | 'new' | 'hot';
  sold?: number;
  total?: number;
};

const fmt = (n: number) => n.toLocaleString('sr-RS') + ',00 дин';
export const formatPrice = fmt;

export const allProducts: Product[] = [
  { id: 33255, name: 'Inverterski aparat za zavarivanje VWM 205 COMBO', brand: 'Villager', category: 'Aparati za varenje', price: 24990, oldPrice: 26240, badge: 'sale', sold: 28, total: 50 },
  { id: 33252, name: 'Vazdušni uljni kompresor 50l', brand: 'AGM', category: 'Kompresori', price: 16990, oldPrice: 18690, badge: 'sale', sold: 42, total: 60 },
  { id: 33245, name: 'Set četki za čišćenje WCB1101 11/1', brand: 'SUPER INGCO', category: 'Ručni alat', price: 2560, oldPrice: 2700, badge: 'sale', sold: 15, total: 80 },
  { id: 33241, name: 'Čekić macola HSM81498 4,5kg', brand: 'SUPER INGCO', category: 'Ručni alat', price: 3150, oldPrice: 3320, badge: 'sale', sold: 33, total: 50 },
  { id: 33237, name: 'Baštenska prskalica trokraka HPS23602 3/4″', brand: 'SUPER INGCO', category: 'Bašta', price: 600, oldPrice: 630, badge: 'sale', sold: 67, total: 100 },
  { id: 33222, name: 'Set odvijača 6/1 HKSDS0628', brand: 'SUPER INGCO', category: 'Ručni alat', price: 990, oldPrice: 1040, badge: 'sale', sold: 51, total: 100 },
  { id: 33219, name: '12-delni set ključeva sa račnom HKSPAR1122 8-19mm', brand: 'INGCO', category: 'Ručni alat', price: 3990, oldPrice: 4200, badge: 'hot', sold: 38, total: 50 },
  { id: 33214, name: 'Set grip klešta COS23091 5/1', brand: 'SUPER INGCO', category: 'Ručni alat', price: 2850, oldPrice: 3000, badge: 'sale', sold: 22, total: 60 },
  { id: 33209, name: 'Lanac AGSC50618 1/4″ za CGSLI2066', brand: 'SUPER INGCO', category: 'Akumulatorski alat', price: 1150, oldPrice: 1210, badge: 'new', sold: 12, total: 80 },
  { id: 33198, name: 'Motorni duvač / usisivač ABV 2520 25.4 cm³', brand: 'AGM', category: 'Bašta', price: 13990, oldPrice: 14690, badge: 'new', sold: 19, total: 40 },
  { id: 33192, name: 'Traktorska kosačica IE-TM352-840 352cm3', brand: 'ISKRA ERO', category: 'Kosačice', price: 224900, oldPrice: 237990, badge: 'hot', sold: 4, total: 10 },
  { id: 33176, name: 'Traktorska kosačica VT 985 Loncin 9,5KS', brand: 'Villager', category: 'Kosačice', price: 235000, oldPrice: 259990, badge: 'hot', sold: 3, total: 8 },
  { id: 33170, name: 'Robot za čišćenje solarnih panela ZK2503 profesional', brand: 'Dolomite', category: 'Elektromaterijal', price: 711999, oldPrice: 747690, badge: 'new', sold: 2, total: 5 },
  { id: 33160, name: 'Akumulatorska baštenska prskalica HSPP3701 1l 4V', brand: 'SUPER INGCO', category: 'Akumulatorski alat', price: 1890, oldPrice: 1990, badge: 'sale', sold: 44, total: 70 },
  { id: 33134, name: 'Laserski daljinomer HLDD07085 85m', brand: 'SUPER INGCO', category: 'Akumulatorski alat', price: 6250, oldPrice: 6600, badge: 'new', sold: 18, total: 40 },
  { id: 33129, name: 'Električni pištolj za farbanje SPG4506E 530W', brand: 'SUPER INGCO', category: 'Električni alat', price: 3990, oldPrice: 4200, badge: 'sale', sold: 29, total: 60 },
  { id: 33124, name: 'Akumulatorski čekić za rušenje CDBLI20358 16J Solo', brand: 'SUPER INGCO', category: 'Akumulatorski alat', price: 15950, oldPrice: 16800, badge: 'hot', sold: 11, total: 25 },
  { id: 33100, name: 'Akumulatorski udarni odvijač CIWLI2050 1/2″ 500Nm 20V', brand: 'SUPER INGCO', category: 'Akumulatorski alat', price: 11990, oldPrice: 19990, badge: 'sale', sold: 56, total: 80 },
];

import {
  BatteryCharging, Zap, Wrench, Flame, Wind, Sprout, Tractor, Plug,
  Home, HardHat, SprayCan, Ruler, type LucideIcon,
} from 'lucide-react';

export interface Category {
  name: string;
  icon: LucideIcon;
  count: number;
}

export const categories: Category[] = [
  { name: 'Akumulatorski alat', icon: BatteryCharging, count: 245 },
  { name: 'Električni alat', icon: Zap, count: 312 },
  { name: 'Ručni alat i pribor', icon: Wrench, count: 480 },
  { name: 'Aparati za varenje', icon: Flame, count: 87 },
  { name: 'Kompresori i pneumatski alati', icon: Wind, count: 64 },
  { name: 'Kosačice i Trimeri', icon: Sprout, count: 92 },
  { name: 'Poljoprivredni alati', icon: Tractor, count: 138 },
  { name: 'Elektromaterijal i oprema', icon: Plug, count: 521 },
  { name: 'Oprema za dvorište', icon: Home, count: 156 },
  { name: 'HTZ oprema', icon: HardHat, count: 73 },
  { name: 'Pištolji za farbanje', icon: SprayCan, count: 34 },
  { name: 'Merni instrumenti', icon: Ruler, count: 45 },
];

export const brands = ['INGCO', 'SUPER INGCO', 'Villager', 'AGM', 'ISKRA ERO', 'Hugong', 'Dolomite', 'Bosch'];
