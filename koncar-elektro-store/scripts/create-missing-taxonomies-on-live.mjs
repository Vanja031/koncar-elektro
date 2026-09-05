/**
 * Creates the taxonomy gap found by sync-catalog-staging-to-live.mjs directly
 * on LIVE (koncarelektro.rs):
 *   - 6 missing product categories (parents created before children)
 *   - 23 missing attribute taxonomies + their terms (2,947 terms total)
 *
 * This ONLY CREATES new taxonomy entries. It never touches existing live
 * products, prices, stock, images, or existing categories/attributes.
 *
 * Default mode is DRY RUN (prints the plan, creates nothing).
 * Pass --write to actually create on live.
 * Idempotent: re-running skips anything that already exists (matched by slug).
 *
 * Usage:
 *   node scripts/create-missing-taxonomies-on-live.mjs           # dry run
 *   node scripts/create-missing-taxonomies-on-live.mjs --write    # create on live
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

const WRITE = process.argv.includes('--write');

const STAGING_BASE = (process.env.NEXT_PUBLIC_WP_API_URL || '').replace(/\/$/, '');
const STAGING_CK = process.env.WC_CONSUMER_KEY || '';
const STAGING_CS = process.env.WC_CONSUMER_SECRET || '';
const LIVE_BASE = (process.env.LIVE_WP_API_URL || '').replace(/\/$/, '');
const LIVE_CK = process.env.LIVE_WC_CONSUMER_KEY || '';
const LIVE_CS = process.env.LIVE_WC_CONSUMER_SECRET || '';

function authHeader(ck, cs) {
  return `Basic ${Buffer.from(`${ck}:${cs}`).toString('base64')}`;
}

async function fetchWithRetry(url, options, retries = 3) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.status === 429 || res.status === 503 || res.status >= 500) {
        lastErr = new Error(`HTTP ${res.status}`);
      } else {
        return res;
      }
    } catch (err) {
      lastErr = err;
    }
    await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
  }
  throw lastErr;
}

async function fetchAllPages(base, ck, cs, path, label) {
  const all = [];
  let page = 1, totalPages = 1;
  do {
    const sep = path.includes('?') ? '&' : '?';
    const url = `${base}${path}${sep}per_page=100&page=${page}`;
    const res = await fetchWithRetry(url, { headers: { Authorization: authHeader(ck, cs) } });
    if (!res.ok) throw new Error(`${label} HTTP ${res.status}`);
    const batch = await res.json();
    all.push(...batch);
    totalPages = Number(res.headers.get('X-WP-TotalPages') || 1);
    page += 1;
  } while (page <= totalPages);
  console.log(`  ${label}: ${all.length} total`);
  return all;
}

async function postJson(base, ck, cs, path, body) {
  const res = await fetchWithRetry(`${base}${path}`, {
    method: 'POST',
    headers: { Authorization: authHeader(ck, cs), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`POST ${path} failed: HTTP ${res.status} — ${JSON.stringify(data).slice(0, 300)}`);
  return data;
}

const ATTRIBUTE_SLUG_OVERRIDES = { pa_brend: 'pa_proizvodjac' };

// Explicit creation order: roots first, then children (WC categories are hierarchical).
const CATEGORY_CREATION_ORDER = [
  'industrijske-masine',
  'pribor-i-potrosni-materijal',
  'industrijska-oprema', // child of industrijske-masine
  'glodala', // child of pribor-i-potrosni-materijal
  'cepac-za-drva', // child of elektricni-alat (already exists on live)
  'dizalice-elektricni-alat', // child of elektricni-alat (already exists on live)
];

async function main() {
  console.log(`Mode: ${WRITE ? 'WRITE (will create on live)' : 'DRY RUN (no changes)'}`);
  console.log(`Staging (source): ${STAGING_BASE}`);
  console.log(`Live (target):    ${LIVE_BASE}\n`);

  console.log('Fetching categories...');
  const [stagingCats, liveCatsInitial] = await Promise.all([
    fetchAllPages(STAGING_BASE, STAGING_CK, STAGING_CS, '/wc/v3/products/categories?_fields=id,name,slug,parent,count', 'STAGING categories'),
    fetchAllPages(LIVE_BASE, LIVE_CK, LIVE_CS, '/wc/v3/products/categories?_fields=id,name,slug,parent', 'LIVE categories'),
  ]);
  const stagingCatBySlug = new Map(stagingCats.map((c) => [c.slug, c]));
  const liveCatBySlug = new Map(liveCatsInitial.map((c) => [c.slug, c]));

  const catResults = { created: [], skippedExisting: [], failed: [] };

  console.log('\n=== CATEGORIES ===');
  for (const slug of CATEGORY_CREATION_ORDER) {
    const staged = stagingCatBySlug.get(slug);
    if (!staged) {
      console.warn(`  ! ${slug} not found on staging — skipping`);
      continue;
    }
    if (liveCatBySlug.has(slug)) {
      console.log(`  = ${slug} already exists on live (id ${liveCatBySlug.get(slug).id}) — skip`);
      catResults.skippedExisting.push(slug);
      continue;
    }
    const stagingParent = staged.parent ? stagingCatBySlug.get(
      [...stagingCatBySlug.values()].find((c) => c.id === staged.parent)?.slug,
    ) : null;
    const parentSlug = staged.parent
      ? [...stagingCatBySlug.values()].find((c) => c.id === staged.parent)?.slug
      : null;
    const liveParent = parentSlug ? liveCatBySlug.get(parentSlug) : null;
    const parentId = liveParent ? liveParent.id : 0;

    if (parentSlug && !liveParent) {
      console.warn(`  ! ${slug}: parent "${parentSlug}" not yet on live — check creation order`);
      catResults.failed.push({ slug, error: 'parent missing' });
      continue;
    }

    if (!WRITE) {
      console.log(`  + would create "${staged.name}" (${slug}), parent=${parentSlug || 'root'}`);
      liveCatBySlug.set(slug, { id: -1, slug }); // simulate for dry-run child-parent preview only
      continue;
    }

    try {
      const created = await postJson(LIVE_BASE, LIVE_CK, LIVE_CS, '/wc/v3/products/categories', {
        name: staged.name,
        slug: staged.slug,
        parent: parentId,
        description: staged.description || '',
      });
      liveCatBySlug.set(slug, created); // so children can reference it
      catResults.created.push({ slug, liveId: created.id });
      console.log(`  ✓ created "${staged.name}" (${slug}) -> live id ${created.id}, parent=${parentId}`);
    } catch (err) {
      catResults.failed.push({ slug, error: String(err.message || err) });
      console.warn(`  ✗ FAILED ${slug}: ${err.message || err}`);
    }
  }

  console.log('\nFetching attribute taxonomies...');
  const [stagingAttrs, liveAttrsInitial] = await Promise.all([
    fetchAllPages(STAGING_BASE, STAGING_CK, STAGING_CS, '/wc/v3/products/attributes', 'STAGING attributes'),
    fetchAllPages(LIVE_BASE, LIVE_CK, LIVE_CS, '/wc/v3/products/attributes', 'LIVE attributes'),
  ]);
  const liveAttrBySlug = new Map(liveAttrsInitial.map((a) => [a.slug, a]));
  const missingAttrs = stagingAttrs.filter((a) => !liveAttrBySlug.has(ATTRIBUTE_SLUG_OVERRIDES[a.slug] || a.slug));

  console.log(`\n=== ATTRIBUTES (${missingAttrs.length} missing) ===`);
  const attrResults = { created: [], skippedExisting: [], failed: [], termsCreated: 0, termsFailed: [] };

  for (const a of missingAttrs) {
    const baseName = a.slug.replace(/^pa_/, '');
    if (liveAttrBySlug.has(a.slug)) {
      console.log(`  = ${a.slug} already exists on live — skip`);
      attrResults.skippedExisting.push(a.slug);
      continue;
    }

    const terms = (await fetchAllPages(STAGING_BASE, STAGING_CK, STAGING_CS, `/wc/v3/products/attributes/${a.id}/terms?_fields=id,name,slug,count`, `  terms for ${a.slug}`))
      .filter((t) => t.count > 0);

    if (!WRITE) {
      console.log(`  + would create attribute "${a.name}" (${a.slug}) with ${terms.length} terms`);
      continue;
    }

    let liveAttr;
    try {
      liveAttr = await postJson(LIVE_BASE, LIVE_CK, LIVE_CS, '/wc/v3/products/attributes', {
        name: a.name,
        slug: baseName,
        type: 'select',
        order_by: 'menu_order',
        has_archives: false,
      });
      attrResults.created.push({ slug: a.slug, liveId: liveAttr.id });
      console.log(`  ✓ created attribute "${a.name}" (${a.slug}) -> live id ${liveAttr.id}`);
    } catch (err) {
      attrResults.failed.push({ slug: a.slug, error: String(err.message || err) });
      console.warn(`  ✗ FAILED attribute ${a.slug}: ${err.message || err}`);
      continue;
    }

    let termsDone = 0;
    for (const term of terms) {
      try {
        await postJson(LIVE_BASE, LIVE_CK, LIVE_CS, `/wc/v3/products/attributes/${liveAttr.id}/terms`, {
          name: term.name,
        });
        termsDone++;
        attrResults.termsCreated++;
      } catch (err) {
        attrResults.termsFailed.push({ attrSlug: a.slug, term: term.name, error: String(err.message || err) });
      }
      await new Promise((r) => setTimeout(r, 80));
    }
    console.log(`    -> ${termsDone}/${terms.length} terms created`);
  }

  const outDir = resolve(__dirname, 'output');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    resolve(outDir, 'taxonomy-creation-result.json'),
    JSON.stringify({ categories: catResults, attributes: attrResults }, null, 2),
  );

  console.log('\n=== SUMMARY ===');
  console.log(`Categories created: ${catResults.created.length}, skipped(existing): ${catResults.skippedExisting.length}, failed: ${catResults.failed.length}`);
  console.log(`Attributes created: ${attrResults.created.length}, skipped(existing): ${attrResults.skippedExisting.length}, failed: ${attrResults.failed.length}`);
  console.log(`Terms created: ${attrResults.termsCreated}, term failures: ${attrResults.termsFailed.length}`);
  console.log(`\nResult written to scripts/output/taxonomy-creation-result.json`);
  if (!WRITE) console.log('\nDRY RUN — nothing was created. Re-run with --write to apply.');
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
