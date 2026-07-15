import { SITE_NAME, TITLE_SUFFIX } from '@/lib/seo/site';

export function productTitle(name: string): string {
  return `${name} cena | Kupovina online - ${TITLE_SUFFIX}`;
}

export function productDescription(name: string): string {
  return `Pogledajte ${name} po najboljoj ceni. Brza dostava i kupovina online. Garancija i podrška u Srbiji.`;
}

export function categoryTitle(name: string): string {
  return `${name} - ${TITLE_SUFFIX}`;
}

export function categoryDescription(name: string): string {
  return `Ponuda ${name} — brendovi, brza dostava, garancija. ${SITE_NAME} Leskovac.`;
}

export const STATIC_FALLBACKS: Record<
  string,
  { title: string; description: string }
> = {
  '/': {
    title: 'Končar Elektro - Prodaja alata i mašina renomiranih brendova',
    description:
      'Končar Elektro - Prodaja alata i mašina poznatih brendova: Makita, Bosch, Metabo, Hyundai, Varstroj, Hugong, Ingco, Villager, Scheppach i drugi. Brza dostava širom Srbije.',
  },
  '/kontakt/': {
    title: `Kontakt - ${TITLE_SUFFIX}`,
    description:
      'Kontaktirajte Končar Elektro u Leskovcu — telefon, email i radno vreme. Pomoć pri izboru alata, porudžbini i servisu.',
  },
  '/o-nama/': {
    title: `O nama - ${TITLE_SUFFIX}`,
    description:
      'Končar Elektro — vodeći distributer profesionalnog i hobi alata, elektromaterijala i rasvete u Leskovcu. Više od 30 godina iskustva.',
  },
  '/akcija/': {
    title: `Akcija - ${TITLE_SUFFIX}`,
    description:
      'Proizvodi na akciji i sniženja — alati, mašine i oprema poznatih brendova. Brza dostava širom Srbije. Končar Elektro.',
  },
  '/proizvodi/': {
    title: `Proizvodi cena | Kupovina online - ${TITLE_SUFFIX}`,
    description:
      'Pogledajte Proizvodi po najboljoj ceni. Brza dostava i kupovina online. Garancija i podrška u Srbiji.',
  },
  '/najprodavanije/': {
    title: `Najprodavaniji proizvodi - ${TITLE_SUFFIX}`,
    description:
      'Najprodavaniji alati i mašine u ponudi Končar Elektro — provereni modeli, brza dostava i garancija.',
  },
  '/pretraga/': {
    title: `Pretraga proizvoda - ${TITLE_SUFFIX}`,
    description: `Pretražite celokupnu ponudu ${SITE_NAME} — alati, mašine, elektromaterijal i rasveta.`,
  },
  '/pitanja/': {
    title: `Česta pitanja - ${TITLE_SUFFIX}`,
    description:
      'Odgovori na najčešća pitanja o kupovini, isporuci, plaćanju i servisu u Končar Elektro prodavnici.',
  },
  '/korpa/': {
    title: `Korpa | ${SITE_NAME}`,
    description: `Vaša korpa na ${SITE_NAME} online prodavnici.`,
  },
  '/placanje-odjava/': {
    title: `Plaćanje / Odjava | ${SITE_NAME}`,
    description: `Završite kupovinu na ${SITE_NAME}.`,
  },
  '/prijava/': {
    title: `Prijava | ${SITE_NAME}`,
    description: `Prijavite se na ${SITE_NAME} nalog.`,
  },
  '/registracija/': {
    title: `Registracija | ${SITE_NAME}`,
    description: `Kreirajte nalog na ${SITE_NAME}.`,
  },
};
