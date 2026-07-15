import c11 from '@/assets/c1-1.png';
import c12 from '@/assets/c1-2.png';
import c21 from '@/assets/c2-1.png';
import c22 from '@/assets/c2-2.png';

export type HeroSlide = {
  image: string;
  brand: string;
  title: string;
  desc: string;
  variant: 'dark' | 'yellow';
  cta: 'expert' | 'delivery';
};

export const leftCarouselSlides: HeroSlide[] = [
  {
    image: c11,
    brand: 'Bosch',
    title: 'Kupuj alat uz pomoć stručnjaka!',
    desc: 'Pozovite nas ili pišite na Viber — pomoći ćemo vam da izaberete pravi alat za vaš posao.',
    variant: 'dark',
    cta: 'expert',
  },
  {
    image: c12,
    brand: 'Makita',
    title: 'Pomoć pri izboru alata!',
    desc: 'Naš tim stručnjaka pomaže majstorima i profesionalcima da pronađu idealan alat.',
    variant: 'dark',
    cta: 'expert',
  },
];

export const rightCarouselSlides: HeroSlide[] = [
  {
    image: c21,
    brand: 'DeWalt',
    title: 'Danas poručeno – sutra isporučeno!',
    desc: 'Brza i sigurna dostava na vašu adresu.',
    variant: 'yellow',
    cta: 'delivery',
  },
  {
    image: c22,
    brand: 'Končar Elektro',
    title: 'Pažljivo pakovanje – sigurna isporuka!',
    desc: 'Svaku pošiljku pakujemo i šaljemo u roku od 1–2 radna dana.',
    variant: 'yellow',
    cta: 'delivery',
  },
];
