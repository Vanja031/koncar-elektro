import type { BreadcrumbItem } from '@/data/categoryPages';
import { getTopCategoryUrl, ROUTES } from '@/lib/catalogUrls';

export type FaqEntry = { question: string; answer: string };

export const companyInfo = {
  name: 'Končar Elektro',
  legalName: 'KONČAR ELEKTRO',
  tagline: 'Prodaja alata i mašina renomiranih brendova',
  address: {
    street: 'Stanoja Glavaša br. 4',
    city: 'Leskovac',
    postal: '16000',
    country: 'Srbija',
    full: 'Stanoja Glavaša br. 4, 16000 Leskovac, Srbija',
  },
  phones: ['+381 61 65 444 90', '+381 61 152 00 71'],
  email: 'kontakt@koncarelektro.com',
  supportHours: [
    { day: 'Ponedeljak – Petak', hours: '08:00 – 20:00' },
    { day: 'Subota', hours: '08:00 – 16:00' },
    { day: 'Nedelja', hours: 'Ne radimo' },
  ],
  mapQuery: 'Stanoja Glavaša 4, Leskovac, Srbija',
};

export const brand = {
  whyChooseTitle: `Zašto kupci biraju ${companyInfo.name}?`,
  aboutIntro: `${companyInfo.name} je specijalizovana prodavnica profesionalnih i hobi alata, elektromaterijala, rasvete i solarne opreme. U ponudi imamo proizvode vodećih svetskih proizvođača — od električnih i akumulatorskih alata do kompresora, kosačica i opreme za elektro instalacije.`,
} as const;

export const contactChannels = {
  primaryPhone: companyInfo.phones[0],
  secondaryPhone: companyInfo.phones[1],
  primaryPhoneHref: `tel:${companyInfo.phones[0].replace(/\s/g, '')}`,
  secondaryPhoneHref: `tel:${companyInfo.phones[1].replace(/\s/g, '')}`,
  email: companyInfo.email,
  emailHref: `mailto:${companyInfo.email}`,
  addressShort: companyInfo.address.city,
  addressFull: companyInfo.address.full,
  hoursSummary: 'Pon–Pet: 08–20h, Sub: 08–16h',
} as const;

export const aboutContent = {
  breadcrumbs: [
    { label: 'Početna', href: '/' },
    { label: 'O nama' },
  ] satisfies BreadcrumbItem[],
  title: 'O nama',
  subtitle:
    'Vodeći distributer profesionalnog i hobi alata, baštenskih i poljoprivrednih mašina, elektromaterijala i rasvete.',
  story: `Končar Elektro je porodična firma sa sedištem u Leskovcu, koja je kroz više od tri decenije izgradila reputaciju pouzdanog partnera za profesionalce i hobi entuzijaste na jugu Srbije i šire. Sve je počelo kao mala prodavnica alata, a danas smo regionalni distributer renomiranih svetskih brendova.

Naš tim čine iskusni stručnjaci koji razumeju potrebe kako zanatskih majstora i građevinskih firmi, tako i porodičnih domaćinstava koja traže pravi alat za svaki posao. Ponos nam je što svaki kupac odlazi sa pravim rešenjem — ne samo sa proizvodom.

Pored maloprodaje i veleprodaje, posebnu pažnju posvećujemo servisu. Kao ovlašćeni servisni centar za brendove Makita, Husqvarna i Garden Master, garantujemo stručnu i brzu popravku — u garantnom i van garantnog roka.`,
  mission:
    'Naša misija je da zajedno sa vama postanemo vodeći distributer profesionalnog i hobi alata, baštenskih i poljoprivrednih mašina, a kao poseban sektor izdvajamo veleprodaju i maloprodaju elektromaterijala i rasvete. Cilj nam je da svaki kupac pronađe pravo rešenje za svoju potrebu ili projekat, uz stručnu podršku i konkurentne cene.',
  vision:
    'Naša vizija je da u oblasti električnog i ručnog alata, poljoprivrednih mašina i elektromaterijala pružimo svu potrebnu tehničku podršku za realizaciju vaših potreba i projekata. Kao ovlašćeni servis nudimo servisiranje i popravku mašina u garantnom i van garantnom roku — uz originalnu opremu i stručno obučeno osoblje.',
  service:
    'Končar Elektro je ovlašćeni servis za brendove Makita, Husqvarna i Garden Master. Vršimo garantni i van garantni servis uz originalnu opremu i rezervne delove. Pored navedenih brendova, servisiramo i sve ostale proizvođače električnog i motornog alata. Izdvajamo se kvalitetom izrade, brzinom obrade i više od 30 godina iskustva u struci.',
  authorizedBrands: [
    'Makita', 'Bosch', 'Raid', 'Garden Master', 'Hyundai', 'Varstroj',
    'Wilo', 'Verto', 'Rade Končar', 'Aling Conel', 'Metalka Majur',
  ],
  highlights: [
    { title: '30+ godina', desc: 'Iskustva u prodaji i servisu alata' },
    { title: 'Ovlašćeni servis', desc: 'Garantni i van garantni servis mašina' },
    { title: 'Širok asortiman', desc: 'Alati, elektromaterijal, rasveta i baštenski program' },
    { title: 'Stručna podrška', desc: 'Pomoć pri izboru opreme i rešenja' },
  ],
  programs: [
    { label: 'Električni i akumulatorski alat', href: getTopCategoryUrl('alati') },
    { label: 'Ručni alat i pribor', href: getTopCategoryUrl('alati') },
    { label: 'Pneumatski alat i kompresori', href: getTopCategoryUrl('alati') },
    { label: 'Aparati za zavarivanje', href: getTopCategoryUrl('alati') },
    { label: 'Agregati i baštenski program', href: getTopCategoryUrl('alati') },
    { label: 'HTZ oprema', href: getTopCategoryUrl('alati') },
    { label: 'Elektromaterijal i rasveta', href: getTopCategoryUrl('elektromaterijal') },
    { label: 'Poljoprivredne mašine', href: getTopCategoryUrl('alati') },
  ],
};

export const contactContent = {
  breadcrumbs: [
    { label: 'Početna', href: '/' },
    { label: 'Kontakt' },
  ] satisfies BreadcrumbItem[],
  title: 'Kontakt',
  subtitle:
    'Imate pitanje o proizvodu, porudžbini ili servisu? Javite nam se — odgovaramo u najkraćem mogućem roku.',
  formIntro:
    'Pošaljite nam poruku putem forme i javićemo vam se u najkraćem mogućem roku.',
};

export const faqPageContent = {
  breadcrumbs: [
    { label: 'Početna', href: '/' },
    { label: 'Česta pitanja' },
  ] satisfies BreadcrumbItem[],
  title: 'Česta pitanja',
  subtitle: 'Odgovori na najčešća pitanja o kupovini, isporuci, plaćanju i servisu.',
};

export const staticFaqItems: FaqEntry[] = [
  {
    question: 'Kako mogu da poručim proizvod?',
    answer:
      'Naručivanje je jednostavno: pronađite željeni proizvod, kliknite "Dodaj u korpu" i završite kupovinu popunjavanjem kontakt podataka i odabirom načina plaćanja. Ukoliko niste sigurni koji proizvod odgovara vašim potrebama, slobodno nas pozovite ili pošaljite upit putem kontakt forme — naši stručnjaci će vam pomoći pri odabiru prave opreme za vaš projekat ili profesionalnu upotrebu.',
  },
  {
    question: 'Koliko traje isporuka?',
    answer:
      'Standardna isporuka na teritoriji Srbije traje 1–2 radna dana od potvrde porudžbine i dostupnosti artikla na stanju. Za manje centralne lokacije isporuka može potrajati i do 3 radna dana. Svi artikli koji su na stanju biće poslati isti ili naredni radni dan. O statusu vaše porudžbine možete se informisati pozivom ili putem kontakt forme.',
  },
  {
    question: 'Koje načine plaćanja prihvatate?',
    answer:
      'Prihvatamo plaćanje platnim karticama Visa, Mastercard, Maestro i Dina, pouzećem uz preuzimanje pošiljke od kurira, virmanom na tekući račun za pravna lica i preduzetnike (faktura sa PDV), kao i gotovinom u poslovnici. Za veće nabavke ili B2B narudžbine, kontaktirajte nas za posebne uslove saradnje.',
  },
  {
    question: 'Da li mogu da platim pouzećem?',
    answer:
      'Da, pouzeće je dostupno za sve porudžbine koje dostavljamo kurirskom službom na teritoriji Srbije. Plaćate kuriru u momentu preuzimanja robe. Pouzeće je opcija za fizička lica, dok pravna lica i preduzetnici plaćaju po fakturi ili unapred virmanom.',
  },
  {
    question: 'Kako funkcioniše garancija?',
    answer:
      'Svi proizvodi imaju fabričku garanciju u skladu sa zakonom, uz fiskalni račun i garancijski list. Period garancije zavisi od proizvođača i kategorije artikla — uobičajeno je 12 do 24 meseca. Kao ovlašćeni servis za Makita, Husqvarna i Garden Master, garancijski popravci se obavljaju direktno kod nas uz originalnu opremu i rezervne delove. Za ostale brendove servis organizujemo u saradnji sa zvaničnim servisima. Za reklamaciju donestite ili pošaljite proizvod sa dokazom o kupovini.',
  },
  {
    question: 'Da li nudite servis alata?',
    answer:
      'Da — servis je jedan od ključnih stubova našeg poslovanja. Končar Elektro je ovlašćeni servis za brendove Makita, Husqvarna i Garden Master, što znači da vršimo garantne i van garantne popravke uz originalnu opremu i sertifikovane tehničare. Pored toga, servisiramo i sve ostale brendove električnog i motornog alata van garantnog roka. Servisno odeljenje radi svim radnim danima tokom radnog vremena. Alat možete doneti lično ili poslati poštom odnosno kurirskom službom.',
  },
  {
    question: 'Gde se nalazite i koje je radno vreme?',
    answer:
      'Nalazimo se na adresi Stanoja Glavaša br. 4 u Leskovcu, u blizini centra grada. Radno vreme prodavnice i servisa: ponedeljak–petak 08:00–20:00, subota 08:00–16:00, nedeljom ne radimo. Parkiralište je dostupno ispred objekta. Ako dolazite iz drugog mesta, preporučujemo da prethodno pozovete da proverite dostupnost traženog artikla na stanju.',
  },
  {
    question: 'Mogu li da vratim proizvod?',
    answer:
      'Kupac koji kupuje kao fizičko lice ima pravo da odustane od kupovine u roku od 14 dana od prijema robe, bez navođenja razloga, u skladu sa Zakonom o zaštiti potrošača. Vraćena roba mora biti nekorišćena, u originalnom pakovanju i sa svom pratećom dokumentacijom. Troškove povrata snosi kupac, osim u slučaju kada je roba neispravna ili pogrešno isporučena. Povraćaj novca vrši se u roku od 14 dana od prijema vraćenog artikla.',
  },
];

/** Footer label → route (samo implementirane stranice). */
export const footerLinkRoutes: Record<string, string> = {
  Kontakt: ROUTES.contact,
  Dostava: '/nacini-isporuke',
  'Način plaćanja': '/nacin-placanja',
  'Povrat robe': '/pravo-na-odustajanje',
  Reklamacije: '/reklamacije',
  Garancija: '/reklamacije',
  'Česta pitanja': ROUTES.faq,
  'O nama': ROUTES.about,
};
