/**
 * DRY-RUN (read-only, no writes) — previews exactly what would be CREATED on
 * LIVE to close the taxonomy gap found by sync-catalog-staging-to-live.mjs:
 *   - missing product categories (with full parent chain, since WC categories
 *     are hierarchical and parents must be created before children)
 *   - missing attribute taxonomies + all their terms
 *
 * Nothing is written. Output is a plan for review before any --write pass.
 *
 * Usage: node scripts/dryrun-create-missing-taxonomies.mjs
 */
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
function loadEnv() {
  try {
    const content = readFileSync(resolve(__dirname, '../.env'), 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^\s*([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch {
    console.warn('No .env file found');
  }
}
loadEnv();

const STAGING_BASE = (process.env.NEXT_PUBLIC_WP_API_URL || '').replace(/\/$/, '');
const STAGING_CK = process.env.WC_CONSUMER_KEY || '';
const STAGING_CS = process.env.WC_CONSUMER_SECRET || '';
const LIVE_BASE = (process.env.LIVE_WP_API_URL || '').replace(/\/$/, '');
const LIVE_CK = process.env.LIVE_WC_CONSUMER_KEY || '';
const LIVE_CS = process.env.LIVE_WC_CONSUMER_SECRET || '';

function authHeader(ck, cs) {
  return `Basic ${Buffer.from(`${ck}:${cs}`).toString('base64')}`;
}

async function fetchAllPages(base, ck, cs, path, label) {
  const all = [];
  let page = 1, totalPages = 1;
  do {
    const sep = path.includes('?') ? '&' : '?';
    const url = `${base}${path}${sep}per_page=100&page=${page}`;
    const res = await fetch(url, { headers: { Authorization: authHeader(ck, cs) } });
    if (!res.ok) throw new Error(`${label} HTTP ${res.status}`);
    const batch = await res.json();
    all.push(...batch);
    totalPages = Number(res.headers.get('X-WP-TotalPages') || 1);
    page += 1;
  } while (page <= totalPages);
  console.log(`  ${label}: ${all.length} total`);
  return all;
}

// Same override used in the main catalog sync — same concept, different slug.
const ATTRIBUTE_SLUG_OVERRIDES = { pa_brend: 'pa_proizvodjac' };

async function main() {
  console.log('DRY RUN — read-only, nothing created.\n');

  console.log('Fetching categories (staging + live)...');
  const [stagingCats, liveCats] = await Promise.all([
    fetchAllPages(STAGING_BASE, STAGING_CK, STAGING_CS, '/wc/v3/products/categories?_fields=id,name,slug,parent,count', 'STAGING categories'),
    fetchAllPages(LIVE_BASE, LIVE_CK, LIVE_CS, '/wc/v3/products/categories?_fields=id,name,slug,parent', 'LIVE categories'),
  ]);
  const stagingCatById = new Map(stagingCats.map((c) => [c.id, c]));
  const liveCatBySlug = new Map(liveCats.map((c) => [c.slug, c]));

  function parentChainSlugs(cat) {
    const chain = [];
    let cur = cat;
    while (cur && cur.parent) {
      const parent = stagingCatById.get(cur.parent);
      if (!parent) break;
      chain.unshift(parent.slug);
      cur = parent;
    }
    return chain;
  }

  const missingCats = stagingCats.filter((c) => !liveCatBySlug.has(c.slug) && c.count > 0);
  console.log(`\n=== MISSING CATEGORIES (products > 0) ===`);
  console.log(`Count: ${missingCats.length}`);
  const catPlan = missingCats.map((c) => {
    const chain = parentChainSlugs(c);
    const parentGapInLive = chain.filter((slug) => !liveCatBySlug.has(slug));
    return {
      slug: c.slug,
      name: c.name,
      productCount: c.count,
      parentChain: chain,
      parentAlsoMissingOnLive: parentGapInLive,
    };
  });
  for (const c of catPlan) {
    console.log(`  - ${c.slug} ("${c.name}", ${c.productCount} proizvoda) — parent chain: [${c.parentChain.join(' > ') || 'root'}]${c.parentAlsoMissingOnLive.length ? '  ⚠ parent also missing: ' + c.parentAlsoMissingOnLive.join(', ') : ''}`);
  }

  console.log('\nFetching attribute taxonomies (staging + live)...');
  const [stagingAttrs, liveAttrs] = await Promise.all([
    fetchAllPages(STAGING_BASE, STAGING_CK, STAGING_CS, '/wc/v3/products/attributes', 'STAGING attributes'),
    fetchAllPages(LIVE_BASE, LIVE_CK, LIVE_CS, '/wc/v3/products/attributes', 'LIVE attributes'),
  ]);
  const liveAttrBySlug = new Map(liveAttrs.map((a) => [a.slug, a]));
  const missingAttrs = stagingAttrs.filter((a) => !liveAttrBySlug.has(ATTRIBUTE_SLUG_OVERRIDES[a.slug] || a.slug));

  console.log(`\n=== MISSING ATTRIBUTE TAXONOMIES ===`);
  console.log(`Count: ${missingAttrs.length}`);

  const attrPlan = [];
  for (const a of missingAttrs) {
    const terms = await fetchAllPages(STAGING_BASE, STAGING_CK, STAGING_CS, `/wc/v3/products/attributes/${a.id}/terms?_fields=id,name,slug,count`, `  terms for ${a.slug}`);
    const termsWithProducts = terms.filter((t) => t.count > 0);
    attrPlan.push({
      slug: a.slug,
      name: a.name,
      termCount: termsWithProducts.length,
      terms: termsWithProducts.map((t) => ({ name: t.name, slug: t.slug, productCount: t.count })),
    });
  }

  for (const a of attrPlan) {
    console.log(`  - ${a.slug} ("${a.name}") — ${a.termCount} termina sa proizvodima`);
  }

  const outDir = resolve(__dirname, 'output');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    resolve(outDir, 'taxonomy-creation-plan.json'),
    JSON.stringify({ categoriesToCreate: catPlan, attributesToCreate: attrPlan }, null, 2),
  );

  const totalTerms = attrPlan.reduce((sum, a) => sum + a.termCount, 0);
  console.log(`\n=== TOTALS ===`);
  console.log(`Categories to create: ${catPlan.length}`);
  console.log(`Attributes to create: ${attrPlan.length} (${totalTerms} terms total)`);
  console.log(`\nFull plan written to scripts/output/taxonomy-creation-plan.json`);
  console.log('Nothing was created. This is a preview for review before any --write pass.');
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
