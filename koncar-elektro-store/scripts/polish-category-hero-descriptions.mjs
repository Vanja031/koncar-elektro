/**
 * Polish WooCommerce category hero descriptions (hubs + leaves).
 * Usage: node scripts/polish-category-hero-descriptions.mjs [--dry-run]
 */
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const dryRun = process.argv.includes('--dry-run');

function loadEnv() {
  const envPath = resolve(root, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
}

loadEnv();

const BASE = (process.env.NEXT_PUBLIC_WP_API_URL || '').replace(/\/$/, '');
const CK = process.env.WC_CONSUMER_KEY || '';
const CS = process.env.WC_CONSUMER_SECRET || '';
if (!BASE || !CK || !CS) {
  console.error('Missing WP URL / WC keys in .env');
  process.exit(1);
}

const auth = 'Basic ' + Buffer.from(`${CK}:${CS}`).toString('base64');

/** Hub / program hero copy — short, specific, less repetitive. */
export const HUB_DESCRIPTIONS = {
  'elektricni-alat':
    'Električni alati za radionicu i teren — bušilice, brusilice, testere i više. Provereni brendovi, garancija i brza dostava.',
  'akumulatorski-alat':
    'Akumulatorski alati za rad bez kabla: bušilice, odvijači, testere i setovi. Veliki izbor na stanju uz stručnu podršku.',
  'rucni-alat-i-pribor':
    'Ručni alati i pribor za precizan rad — ključevi, klešta, odvijači i organizacija alata. Kvalitet za majstore i hobi.',
  'aparati-za-varenje':
    'Aparati za varenje, elektrode i oprema za MIG, TIG i MMA. Rešenja za radionicu, montažu i terenski rad.',
  'htz-oprema':
    'HTZ oprema i lična zaštita na radu — kacige, rukavice, naočare i radna odeća. Bezbednost prema propisima.',
  'kompresori-i-pneumatski-alati':
    'Kompresori i pneumatski alati za farbanje, duvanje i radionicu. Uljni i bezuljni modeli različitih snaga.',
  agregati:
    'Benzinski, dizel i inverterski agregati za pouzdano napajanje kod kuće, na gradilištu i u privredi.',
  'kosacice-i-trimeri-dobra':
    'Kosačice, trimeri i baštenski alati za uređen travnjak i dvorište. Benzinski, električni i aku modeli.',
  'kosacice-i-trimeri':
    'Kosačice, trimeri i baštenski alati za uređen travnjak i dvorište. Benzinski, električni i aku modeli.',
  'poljoprivredni-alati-i-oprema':
    'Poljoprivredni alati i oprema za obradu zemlje, košenje i održavanje. Pouzdana rešenja za farmu i okućnicu.',
  'oprema-za-dvoriste':
    'Oprema za dvorište i baštu — zalivanje, čišćenje i održavanje zelenih površina. Praktična rešenja na stanju.',
  'elektromaterijal-i-oprema':
    'Elektromaterijal za instalacije: kablovi, prekidači, osigurači i razvodna oprema. Sve za stručni i kućni rad.',
  rasveta:
    'LED i klasična rasveta za enterijer, eksterijer i industriju. Sijalice, paneli, reflektori i trake.',
  'solarna-elektrana':
    'Oprema za solarne elektrane — paneli, inverteri i kompleti. Ušteda energije za domaćinstva i objekte.',
  // Other visible roots
  'pumpe-za-vodu':
    'Pumpe za vodu za domaćinstvo, baštu i objekat — hidrofori, bastenske i potopne pumpe. Pouzdan protok i pritisak.',
  'pribor-i-potrosni-materijal':
    'Pribor i potrošni materijal za alate — burgije, listovi, diskovi i potrošni delovi. Uvek pri ruci uz alat.',
  pribor:
    'Pribor za alate i radionicu — nastavci, držači, organizacija i potrošni delovi. Dopunite postojeći set.',
  'industrijske-masine':
    'Industrijske mašine i oprema za proizvodnju i radionicu. Pogledajte modele prilagođene profesionalnoj upotrebi.',
  'industrijaske-masine':
    'Industrijske mašine i oprema za proizvodnju i radionicu. Pogledajte modele prilagođene profesionalnoj upotrebi.',
  'merni-instrumenti':
    'Merni instrumenti za precizan rad — metri, libele, laseri i merni pribor. Tačnost u radionici i na terenu.',
  'pistolj-za-farbanje':
    'Pištolji za farbanje i pribor za nanošenje boje. Rešenja za radionicu, karoseriju i majstorski rad.',
  'viljuskari-i-paletari':
    'Viljuškari i paletari za skladište i manipulisanje teretom. Oprema za efikasan unutrašnji transport.',
  'kablovi-i-provodnici':
    'Kablovi i provodnici za elektroinstalacije. Izaberite presek i tip prema nameni — na stanju za brzu isporuku.',
  'razvodni-ormani-i-table':
    'Razvodni ormani i table za instalacije. Kompletna oprema za uredan i bezbedan razvod struje.',
  'motorni-program-ostalo':
    'Motorni program i prateća oprema. Pogledajte dostupne modele i pribor za rad na otvorenom.',
  'pumpa-za-busilice':
    'Pumpe i pribor za bušilice. Dopunite set nastavcima i opremom za efikasniji rad.',
  ponuda:
    'Aktuelna ponuda — noviteti, traženi modeli i proizvodi na stanju. Brza dostava širom Srbije.',
  nesortirano:
    'Ostali proizvodi iz asortimana. Pregledajte dostupne artikle ili nas kontaktirajte za pomoć pri izboru.',
};

const SKIP_SLUGS = new Set(['poljo']);

/** Parent-aware leaf templates — name once, clear benefit, no clone of hub filler. */
function leafDescription(name, parentSlug) {
  const n = name.trim();
  switch (parentSlug) {
    case 'elektricni-alat':
      return `${n} u ponudi električnih alata. Uporedite snagu i brendove — naručite online uz brzu dostavu širom Srbije.`;
    case 'akumulatorski-alat':
      return `${n} na akumulator za rad bez kabla. Izaberite napon, kapacitet i brend — modeli na stanju sa garancijom.`;
    case 'rucni-alat-i-pribor':
      return `${n} iz asortimana ručnog alata i pribora. Kvalitet za precizan rad u radionici i na terenu.`;
    case 'aparati-za-varenje':
      return `${n} za varenje i montažu. Pogledajte karakteristike i opremu — podrška pri izboru tehnologije.`;
    case 'htz-oprema':
      return `${n} za zaštitu na radu. Izaberite veličinu i nivo zaštite — bezbednost prema standardima.`;
    case 'kompresori-i-pneumatski-alati':
      return `${n} za kompresore i pneumatiku. Uporedite performanse i namenu — brza isporuka širom Srbije.`;
    case 'agregati':
      return `${n} za pouzdano napajanje. Pogledajte snagu, tip goriva i opremu — dostava i savet pri kupovini.`;
    case 'kosacice-i-trimeri-dobra':
    case 'kosacice-i-trimeri':
      return `${n} za uređenje travnjaka i dvorišta. Benzinski, električni i aku modeli na stanju.`;
    case 'poljoprivredni-alati-i-oprema':
      return `${n} za poljoprivredu i okućnicu. Pouzdana oprema za sezonski i svakodnevni rad.`;
    case 'oprema-za-dvoriste':
      return `${n} za dvorište i baštu. Praktična rešenja za održavanje i uređenje okoline.`;
    case 'elektromaterijal-i-oprema':
      return `${n} za elektroinstalacije. Izaberite dimenzije i tip — brza dostava i stručna podrška.`;
    case 'rasveta':
      return `${n} u ponudi rasvete. LED i klasična rešenja za enterijer, eksterijer i objekat.`;
    case 'solarna-elektrana':
      return `${n} za solarne sisteme. Komponente za uštedu energije — paneli, inverteri i pribor.`;
    case 'pumpe-za-vodu':
      return `${n} za vodosnabdevanje i zalivanje. Izaberite snagu i protok prema vašim potrebama.`;
    case 'pribor':
    case 'pribor-i-potrosni-materijal':
      return `${n} — potrošni materijal i pribor za alate. Dopunite set delovima na stanju.`;
    case 'industrijske-masine':
    case 'industrijaske-masine':
      return `${n} za profesionalnu i industrijsku upotrebu. Pogledajte dostupne modele i specifikacije.`;
    default:
      return `${n} u asortimanu Končar Elektro. Provereni brendovi, garancija i brza dostava širom Srbije.`;
  }
}

function strip(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchAll() {
  const all = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const url = new URL(`${BASE}/wc/v3/products/categories`);
    url.searchParams.set('per_page', '100');
    url.searchParams.set('page', String(page));
    url.searchParams.set('_fields', 'id,name,slug,description,parent');
    const res = await fetch(url, { headers: { Authorization: auth } });
    if (!res.ok) throw new Error(`List HTTP ${res.status}`);
    totalPages = Number(res.headers.get('x-wp-totalpages') || 1);
    all.push(...(await res.json()));
    page += 1;
  }
  return all;
}

async function putDescription(id, description) {
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const res = await fetch(`${BASE}/wc/v3/products/categories/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: auth,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });
      if (res.ok) return;
      const t = await res.text();
      lastErr = new Error(`PUT ${id} HTTP ${res.status}: ${t.slice(0, 200)}`);
      if (res.status >= 500) {
        await new Promise((r) => setTimeout(r, attempt * 1500));
        continue;
      }
      throw lastErr;
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, attempt * 1500));
    }
  }
  throw lastErr;
}

function desiredDescription(cat, byId) {
  if (SKIP_SLUGS.has(cat.slug)) return null;
  if (HUB_DESCRIPTIONS[cat.slug]) return HUB_DESCRIPTIONS[cat.slug];

  const parent = cat.parent ? byId.get(cat.parent) : null;
  const parentSlug = parent?.slug ?? null;
  return leafDescription(cat.name, parentSlug);
}

async function main() {
  console.log('Target:', BASE);
  console.log(dryRun ? 'Mode: DRY RUN\n' : 'Mode: WRITE\n');

  const all = await fetchAll();
  const byId = new Map(all.map((c) => [c.id, c]));

  let changed = 0;
  let same = 0;
  let skipped = 0;
  const samples = [];

  for (const cat of all) {
    const next = desiredDescription(cat, byId);
    if (!next) {
      skipped += 1;
      continue;
    }
    const current = strip(cat.description);
    if (current === next) {
      same += 1;
      continue;
    }
    if (samples.length < 12) {
      samples.push({ slug: cat.slug, from: current.slice(0, 70), to: next.slice(0, 90) });
    }
    console.log(`${dryRun ? 'WOULD' : 'UPDATE'} #${cat.id} ${cat.slug}`);
    if (!dryRun) await putDescription(cat.id, next);
    changed += 1;
  }

  console.log('\nSamples:');
  for (const s of samples) {
    console.log(`- ${s.slug}`);
    console.log(`  WAS: ${s.from}`);
    console.log(`  NOW: ${s.to}`);
  }
  console.log(`\nDone. changed=${changed} unchanged=${same} skipped=${skipped}`);

  writeFileSync(
    resolve(root, 'scripts/_hub-descriptions.generated.json'),
    JSON.stringify(HUB_DESCRIPTIONS, null, 2),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
