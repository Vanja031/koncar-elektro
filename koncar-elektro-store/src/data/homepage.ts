import catElektricni from '@/assets/elektricni-alat.png';
import catAku from '@/assets/aku-alat.png';
import catRucni from '@/assets/rucni-alat.png';
import catKompresor from '@/assets/kompresor.png';
import catAgregat from '@/assets/agregat.webp';
import catKosacica from '@/assets/kosacica.png';
import catHtz from '@/assets/htz-oprema.jpg';
import catTraktor from '@/assets/traktor.png';
import catVarenje from '@/assets/aparat-za-varenje.webp';
import catDvorishte from '@/assets/oprema-za-dvoriste.jpg';
import imgProfesionalni from '@/assets/prefesionalni-alati.png';
import imgElektromaterijal from '@/assets/elektromaterijal.png';
import imgRasveta from '@/assets/rasveta.png';
import imgSolarne from '@/assets/solarne.png';

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

export const saleProducts: Product[] = [
  { id: 1, brand: 'Bosch', name: 'Bosch GSB 18V-55', category: 'Aku udarna bušilica-odvijač', description: 'Aku udarna bušilica-odvijač', price: 21990, oldPrice: 27490, rating: 5, reviews: 24, image: 'https://images.unsplash.com/photo-1572981779307-38bfe4d974fb?w=400&h=400&fit=crop' },
  { id: 2, brand: 'Makita', name: 'Makita DHP484Z', category: 'Aku bušilica-odvijač', description: 'Aku bušilica-odvijač 18V', price: 18990, oldPrice: 22350, rating: 5, reviews: 18, image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop' },
  { id: 3, brand: 'Metabo', name: 'Metabo W 18 LTX', category: 'Aku ugaona brusilica', description: 'Aku ugaona brusilica 125mm', price: 15490, oldPrice: 18200, rating: 4, reviews: 12, image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop' },
  { id: 4, brand: 'Einhell', name: 'Einhell TE-VC 18', category: 'Aku usisivač', description: 'Aku usisivač za radionicu', price: 12990, oldPrice: 15300, rating: 5, reviews: 31, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop' },
  { id: 5, brand: 'Villager', name: 'Villager VLN 1055', category: 'Električna lančana testera', description: 'Električna lančana testera', price: 8990, oldPrice: 10580, rating: 4, reviews: 9, image: 'https://images.unsplash.com/photo-1597479266331-7e73e4d5c362?w=400&h=400&fit=crop' },
  { id: 6, brand: 'Ingco', name: 'Ingco CDLI205581', category: 'Aku odvijač', description: 'Aku odvijač 20V', price: 7490, oldPrice: 8800, rating: 5, reviews: 42, image: 'https://images.unsplash.com/photo-1530124566582-538217625050?w=400&h=400&fit=crop' },
];

export const bestSellerProducts: Product[] = [
  { id: 7, brand: 'Bosch', name: 'Bosch GWS 750', category: 'Ugaona brusilica', description: 'Ugaona brusilica 115mm', price: 6490, rating: 5, reviews: 56, image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop' },
  { id: 8, brand: 'Makita', name: 'Makita HR2630', category: 'Bušač-čekić', description: 'Električni bušač-čekić SDS+', price: 22990, rating: 5, reviews: 38, image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop' },
  { id: 9, brand: 'Metabo', name: 'Metabo BS 18 LTX', category: 'Aku testera', description: 'Aku testera za drvo', price: 19990, rating: 4, reviews: 22, image: 'https://images.unsplash.com/photo-1597479266331-7e73e4d5c362?w=400&h=400&fit=crop' },
  { id: 10, brand: 'Hyundai', name: 'Hyundai HYM 5100', category: 'Benzinska kosačica', description: 'Benzinska kosačica 51cm', price: 89990, rating: 5, reviews: 14, image: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=400&h=400&fit=crop' },
  { id: 11, brand: 'Scheppach', name: 'Scheppach HC52', category: 'Kompresor', description: 'Kompresor 50L', price: 34990, rating: 4, reviews: 19, image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=400&fit=crop' },
  { id: 12, brand: 'Villager', name: 'Villager VTP 1960', category: 'Traktorska kosačica', description: 'Traktorska kosačica 19KS', price: 189990, rating: 5, reviews: 7, image: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=400&h=400&fit=crop' },
];

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

export const paymentCards = ['VISA', 'Mastercard', 'DinaCard', 'Maestro'];
export const paymentBanks = ['Banca Intesa', 'OTP banka'];

export const googleReviewsUrl =
  'https://www.google.com/search?q=koncar+elektro&oq=koncar+elektro&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTINCAEQLhivARjHARiABDIHCAIQABiABDIHCAMQABiABDIICAQQABgWGB4yBggFEEUYPDIGCAYQRRg8MgYIBxBFGDzSAQgxNTU2ajBqN6gCALACAA&sourceid=chrome&ie=UTF-8#lrd=0x475583737055cdff:0xa172113ad40886fe,1,,,,';
