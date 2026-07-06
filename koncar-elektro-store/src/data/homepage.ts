import catElektricni from '@/assets/elektricni-alat.png';
import catAku from '@/assets/aku-alat.png';
import catRucni from '@/assets/rucni-alat.png';
import catKompresor from '@/assets/kompresor.png';
import catAgregat from '@/assets/agregat.webp';
import catKosacica from '@/assets/kosacica.png';
import catHtz from '@/assets/htz-oprema.png';
import catTraktor from '@/assets/traktor.png';
import catVarenje from '@/assets/aparat-za-varenje.png';
import catDvorishte from '@/assets/oprema-za-dvoriste.png';
import imgProfesionalni from '@/assets/prefesionalni-alati.png';
import imgElektromaterijal from '@/assets/elektromaterijal.png';
import imgRasveta from '@/assets/rasveta.png';
import imgSolarne from '@/assets/solarne.png';
import {
  getBestSellerProductsFromKoncar,
  getSaleProductsFromKoncar,
} from '@/data/koncarProducts';

export type Product = {
  id: number;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  image: string;
};

export const formatPrice = (n: number) =>
  n.toLocaleString('sr-RS', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' RSD';

export const saleProducts: Product[] = getSaleProductsFromKoncar();

export const bestSellerProducts: Product[] = getBestSellerProductsFromKoncar();

export const popularCategories = [
  { name: 'Električni alati', image: catElektricni },
  { name: 'Aku alati', image: catAku },
  { name: 'Ručni alati', image: catRucni },
  { name: 'Aparati za varenje', image: catVarenje },
  { name: 'Kompresori', image: catKompresor },
  { name: 'Agregati', image: catAgregat },
  { name: 'Kosačice i trimeri', image: catKosacica },
  { name: 'HTZ oprema', image: catHtz },
  { name: 'Poljoprivredni program', image: catTraktor },
  { name: 'Oprema za dvorište', image: catDvorishte },
];

export const featuredBrands = [
  'Bosch', 'Makita', 'Metabo', 'Villager', 'Einhell', 'Hyundai', 'Scheppach', 'Ingco', 'Rema Power', 'Cedrus',
];

export const faqItems = [
  {
    question: 'Kako mogu da poručim proizvod?',
    answer: 'Dodajte proizvod u korpu i završite kupovinu na sajtu.',
  },
  {
    question: 'Koliko traje isporuka?',
    answer: 'Isporuka je u roku od 1–2 radna dana na teritoriji Srbije.',
  },
  {
    question: 'Da li mogu da platim pouzećem?',
    answer: 'Da, pouzeće je dostupno za većinu porudžbina.',
  },
  {
    question: 'Kako funkcioniše garancija?',
    answer: 'Svi proizvodi imaju fabričku garanciju uz račun i garancijski list.',
  },
];

export const whyChooseItems = [
  'Provereni brendovi i kvalitet',
  'Stručna podrška pri izboru',
  'Brza isporuka na adresu',
  'Garancija na sve proizvode',
  'Sigurna kupovina karticama',
];

export const categoryHighlights = [
  { title: 'Profesionalni alati', desc: 'Električni, aku i ručni alat za profesionalce i majstore.', icon: 'drill' as const, image: imgProfesionalni },
  { title: 'Elektromaterijal', desc: 'Kablovi, prekidači, osigurači i oprema za elektro instalacije.', icon: 'plug' as const, image: imgElektromaterijal },
  { title: 'Rasveta', desc: 'Unutrašnja i spoljašnja rasveta za svaki prostor i namenu.', icon: 'bulb' as const, image: imgRasveta },
  { title: 'Solarne elektrane', desc: 'Kompletna oprema za domaćinstva i privredu. Ušteda energije i novca.', icon: 'solar' as const, image: imgSolarne },
];

export const categoryBanners = [
  {
    title: 'Elektromaterijal',
    desc: 'Kablovi, prekidači, osigurači i sve što vam treba',
    image: imgElektromaterijal,
    className: 'bg-primary',
  },
  {
    title: 'Rasveta',
    desc: 'LED rasveta za svaki prostor i potrebu',
    image: imgRasveta,
    className: 'bg-gradient-to-r from-[#5c3218] via-[#8b4e24] to-[#a8622f]',
  },
  {
    title: 'Solarne elektrane',
    desc: 'Kompletna rešenja za vašu energetsku nezavisnost',
    image: imgSolarne,
    className: 'bg-gradient-to-r from-[#143528] via-[#1d4a38] to-[#25634a]',
  },
];

export const valueProps = [
  { title: '20+ godina iskustva', desc: 'Dugogodišnje iskustvo i poverenje hiljada zadovoljnih kupaca širom Srbije.' },
  { title: 'Stručna podrška', desc: 'Naš tim stručnjaka uvek tu da vam pomogne pri izboru najboljeg rešenja.' },
  { title: 'Brza isporuka', desc: 'Robu isporučujemo brzo i sigurno na vašu adresu, u celoj Srbiji.' },
];

export const footerServiceLinks = [
  'Kontakt', 'Dostava', 'Način plaćanja', 'Povrat robe', 'Reklamacije', 'Garancija', 'Česta pitanja',
];

export const footerInfoLinks = [
  'O nama', 'Blog', 'Uslovi korišćenja', 'Politika privatnosti', 'Politika kolačića',
];

export const paymentBanks = ['Banca Intesa', 'OTP banka'];

export const googleReviewsUrl =
  'https://www.google.com/search?q=koncar+elektro&oq=koncar+elektro&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTINCAEQLhivARjHARiABDIHCAIQABiABDIHCAMQABiABDIICAQQABgWGB4yBggFEEUYPDIGCAYQRRg8MgYIBxBFGDzSAQgxNTU2ajBqN6gCALACAA&sourceid=chrome&ie=UTF-8#lrd=0x475583737055cdff:0xa172113ad40886fe,1,,,,';
