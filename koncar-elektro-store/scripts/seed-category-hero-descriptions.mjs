/**
 * Seed WooCommerce category `description` for listing hero copy.
 * Fills empty / name-only descriptions; leaves real copy untouched.
 *
 * Usage: node scripts/seed-category-hero-descriptions.mjs
 * Optional: --dry-run
 */
import { readFileSync, existsSync } from 'node:fs';
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

const BASE =
  process.env.NEXT_PUBLIC_WP_API_URL ||
  process.env.VITE_WP_API_URL ||
  'https://cms.koncarelektro.rs/wp-json';
const CK = process.env.WC_CONSUMER_KEY || process.env.VITE_WC_CONSUMER_KEY || '';
const CS = process.env.WC_CONSUMER_SECRET || process.env.VITE_WC_CONSUMER_SECRET || '';

if (!CK || !CS) {
  console.error('Missing WC_CONSUMER_KEY / WC_CONSUMER_SECRET in .env');
  process.exit(1);
}

const wcAuth = 'Basic ' + Buffer.from(`${CK}:${CS}`).toString('base64');

/** Curated hub copy (same as frontend fallbacks / polish script). */
const HUB_DESCRIPTIONS = {
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
};

function stripHtml(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function needsSeed(category) {
  const plain = stripHtml(category.description);
  if (!plain) return true;
  const name = String(category.name || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  const slugAsName = String(category.slug || '')
    .replace(/-/g, ' ')
    .toLowerCase();
  const desc = plain.toLowerCase();
  return desc === name || desc === slugAsName;
}

function leafDescription(name) {
  return `Ponuda proizvoda iz kategorije ${name}.`;
}

async function wcFetch(path, init = {}) {
  const url = `${BASE.replace(/\/$/, '')}/wc/v3${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: wcAuth,
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    throw new Error(
      `WC ${res.status} ${path}: ${typeof body === 'string' ? body : JSON.stringify(body)}`,
    );
  }
  return body;
}

async function fetchAllCategories() {
  const all = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const res = await fetch(
      `${BASE.replace(/\/$/, '')}/wc/v3/products/categories?per_page=100&page=${page}&_fields=id,name,slug,description,parent`,
      { headers: { Authorization: wcAuth, Accept: 'application/json' } },
    );
    if (!res.ok) throw new Error(`List failed HTTP ${res.status}`);
    totalPages = Number(res.headers.get('x-wp-totalpages') || 1);
    all.push(...(await res.json()));
    page += 1;
  }
  return all;
}

async function main() {
  console.log('Target:', BASE);
  console.log(dryRun ? 'Mode: DRY RUN (no writes)\n' : 'Mode: WRITE\n');

  const categories = await fetchAllCategories();
  let updated = 0;
  let skipped = 0;

  for (const category of categories) {
    if (!needsSeed(category)) {
      skipped += 1;
      continue;
    }

    const description =
      HUB_DESCRIPTIONS[category.slug] ?? leafDescription(category.name);

    console.log(
      `${dryRun ? 'WOULD UPDATE' : 'UPDATE'} #${category.id} ${category.slug}`,
    );
    console.log(`  → ${description.slice(0, 90)}${description.length > 90 ? '…' : ''}`);

    if (!dryRun) {
      await wcFetch(`/products/categories/${category.id}`, {
        method: 'PUT',
        body: JSON.stringify({ description }),
      });
    }
    updated += 1;
  }

  console.log(`\nDone. ${dryRun ? 'Would update' : 'Updated'}: ${updated}, left as-is: ${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
