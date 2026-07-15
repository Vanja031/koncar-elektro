/** Brand logo files live in `/public/brands/{slug}.{ext}` */

const LOGO_FILES: Record<string, string> = {
  abac: 'abac.jpg',
  adk: 'adk.jpg',
  agm: 'agm.jpg',
  agrina: 'agrina.jpg',
  altuna: 'altuna.jpg',
  'anti-fire': 'anti-fire.jpg',
  benman: 'benman.jpg',
  bihui: 'bihui.jpg',
  bluebird: 'bluebird.jpg',
  bormann: 'bormann.jpg',
  bosch: 'bosch.jpg',
  castelgarden: 'castelgarden.jpg',
  cedrus: 'cedrus.jpg',
  daewoo: 'daewoo.png',
  'dah-solar': 'dah-solar.jpg',
  dedra: 'dedra.jpg',
  dewalt: 'dewalt.jpg',
  divinol: 'divinol.jpg',
  dolomite: 'dolomite.jpg',
  einhell: 'einhell.jpg',
  elmark: 'elmark.jpg',
  esab: 'esab.png',
  eurostep: 'eurostep.jpg',
  ferm: 'ferm.png',
  'ff-group': 'ff-group.jpg',
  ford: 'ford.png',
  'garden-master': 'garden-master.png',
  getout: 'getout.jpg',
  graphite: 'graphite.jpg',
  grifo: 'grifo.jpg',
  harvest: 'harvest.jpg',
  heka: 'heka.jpg',
  hikoki: 'hikoki.jpg',
  honda: 'honda.jpg',
  hugong: 'hugong.png',
  hyundai: 'hyundai.png',
  ingco: 'ingco.jpg',
  iskra: 'iskra.jpg',
  kapro: 'kapro.jpg',
  kasei: 'kasei.jpg',
  kassmayer: 'kassmayer.jpg',
  'koncar-elektro': 'koncar-elektro.png',
  loncin: 'loncin.jpg',
  lynx: 'lynx.jpg',
  makita: 'makita.png',
  metabo: 'metabo.png',
  milwaukee: 'milwaukee.png',
  nakayama: 'nakayama.jpg',
  neo: 'neo.png',
  otc: 'otc.jpg',
  pantherol: 'pantherol.jpg',
  prosto: 'prosto.jpg',
  proxxon: 'proxxon.jpg',
  qbrick: 'qbrick.jpg',
  raider: 'raider.jpg',
  reca: 'reca.jpg',
  'rem-power': 'rem-power.jpg',
  ridgid: 'ridgid.png',
  scheppach: 'scheppach.jpg',
  shineray: 'shineray.jpg',
  'st-garden': 'st-garden.jpg',
  'super-ingco': 'super-ingco.jpg',
  sword: 'sword.jpg',
  topex: 'topex.jpg',
  topmaster: 'topmaster.jpg',
  truper: 'truper.jpg',
  tyrolit: 'tyrolit.png',
  varstroj: 'varstroj.png',
  villager: 'villager.jpg',
  wadfow: 'wadfow.jpg',
  weibang: 'weibang.jpg',
  willtek: 'willtek.jpg',
  wilo: 'wilo.jpg',
  wirman: 'wirman.jpg',
};

/** Normalize alternate spellings / display names → logo slug */
const ALIASES: Record<string, string> = {
  'rema power': 'rem-power',
  'rem power': 'rem-power',
  rempower: 'rem-power',
  'super ingco': 'super-ingco',
  'f.f. group': 'ff-group',
  'ff group': 'ff-group',
  'f.f.group': 'ff-group',
  'dah solar': 'dah-solar',
  'garden master': 'garden-master',
  'st garden': 'st-garden',
  'anti fire': 'anti-fire',
  antifire: 'anti-fire',
  raid: 'raider',
  borman: 'bormann',
  'koncar elektro': 'koncar-elektro',
  'končar elektro': 'koncar-elektro',
  'rade koncar': 'koncar-elektro',
  'rade končar': 'koncar-elektro',
  'lynx elektro maschinen': 'lynx',
  'iskra ero': 'iskra',
};

export function brandToSlug(brand: string): string {
  const normalized = brand
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

  if (ALIASES[normalized]) return ALIASES[normalized];

  const slug = normalized.replace(/\s+/g, '-');
  if (LOGO_FILES[slug]) return slug;

  // Prefer more specific multi-word match (e.g. "SUPER INGCO" before "INGCO")
  const aliasHit = Object.entries(ALIASES).find(([key]) => normalized.includes(key));
  if (aliasHit) return aliasHit[1];

  const fileHit = Object.keys(LOGO_FILES).find(
    (key) => key !== 'koncar-elektro' && (normalized.includes(key.replace(/-/g, ' ')) || normalized.includes(key)),
  );
  return fileHit ?? slug;
}

export function getBrandLogoSrc(brand: string | null | undefined): string | null {
  if (!brand?.trim()) return null;
  const slug = brandToSlug(brand);
  const file = LOGO_FILES[slug];
  return file ? `/brands/${file}` : null;
}

export const featuredBrandSlugs = [
  'bosch',
  'makita',
  'metabo',
  'villager',
  'einhell',
  'hyundai',
  'scheppach',
  'ingco',
  'rem-power',
  'cedrus',
] as const;

export function getBrandLogoBySlug(slug: string): string | null {
  const file = LOGO_FILES[slug];
  return file ? `/brands/${file}` : null;
}
