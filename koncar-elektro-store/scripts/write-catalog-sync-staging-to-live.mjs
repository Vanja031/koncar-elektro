/**
 * PASS 2 — Sync catalog CONTENT (name, description, short_description,
 * categories, attributes, tags) from STAGING onto LIVE.
 *
 * NEVER touches on live: images, price, regular_price, sale_price, stock,
 * manage_stock, sku, slug, status, menu_order. Only the fields listed above
 * are ever sent in the PUT body, and only for products where at least one of
 * them actually differs from live.
 *
 * Matching staging -> live product: SKU -> slug -> normalized name (same
 * strategy validated in sync-catalog-staging-to-live.mjs dry run).
 *
 * Categories/attributes are resolved to LIVE ids by slug (categories) using
 * the taxonomies created in create-missing-taxonomies-on-live.mjs (Pass 1).
 * If any staging category/attribute slug has no live counterpart, that
 * product is SKIPPED and reported (should be 0 after Pass 1).
 *
 * Default mode is DRY RUN (computes diffs, writes nothing).
 * Pass --write to actually PUT to live.
 * Optional --limit=N to cap number of products updated in --write mode (for
 * a small first batch to sanity-check before running the rest).
 *
 * Usage:
 *   node scripts/write-catalog-sync-staging-to-live.mjs                 # dry run, full report
 *   node scripts/write-catalog-sync-staging-to-live.mjs --write --limit=20   # write first 20 changed products
 *   node scripts/write-catalog-sync-staging-to-live.mjs --write             # write all changed products
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
const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const LIMIT = limitArg ? Number(limitArg.split('=')[1]) : Infinity;
const CONCURRENCY = 6;

const STAGING_BASE = (process.env.NEXT_PUBLIC_WP_API_URL || '').replace(/\/$/, '');
const STAGING_CK = process.env.WC_CONSUMER_KEY || '';
const STAGING_CS = process.env.WC_CONSUMER_SECRET || '';
const LIVE_BASE = (process.env.LIVE_WP_API_URL || '').replace(/\/$/, '');
const LIVE_CK = process.env.LIVE_WC_CONSUMER_KEY || '';
const LIVE_CS = process.env.LIVE_WC_CONSUMER_SECRET || '';

if (!STAGING_BASE || !STAGING_CK || !STAGING_CS) {
  console.error('Missing staging config');
  process.exit(1);
}
if (!LIVE_BASE || !LIVE_CK || !LIVE_CS) {
  console.error('Missing live config');
  process.exit(1);
}

function authHeader(ck, cs) {
  return `Basic ${Buffer.from(`${ck}:${cs}`).toString('base64')}`;
}

async function fetchWithRetry(url, options, retries = 4) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.status === 429 || res.status >= 500 || res.status === 503) {
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
  let page = 1;
  let totalPages = 1;
  do {
    const sep = path.includes('?') ? '&' : '?';
    const url = `${base}${path}${sep}per_page=100&page=${page}`;
    const res = await fetchWithRetry(url, { headers: { Authorization: authHeader(ck, cs) } });
    if (!res.ok) throw new Error(`${label} fetch failed: HTTP ${res.status} (${url})`);
    const batch = await res.json();
    if (!Array.isArray(batch)) throw new Error(`${label}: expected array`);
    all.push(...batch);
    totalPages = Number(res.headers.get('X-WP-TotalPages') || 1);
    if (page === 1 || page % 10 === 0 || page === totalPages) {
      console.log(`  ${label}: page ${page}/${totalPages} (${all.length} so far)`);
    }
    page += 1;
  } while (page <= totalPages);
  return all;
}

async function fetchAllProducts(base, ck, cs, label) {
  const fields = 'id,sku,slug,name,description,short_description,categories,attributes,tags,type';
  return fetchAllPages(base, ck, cs, `/wc/v3/products?_fields=${fields}`, label);
}

function normalizeName(name) {
  return (name || '').toLowerCase().replace(/\s+/g, ' ').trim();
}
function normalizeText(html) {
  return (html || '').replace(/\s+/g, ' ').trim();
}

const ATTRIBUTE_SLUG_OVERRIDES = { pa_brend: 'pa_proizvodjac' };

async function updateProduct(id, body) {
  const res = await fetchWithRetry(`${LIVE_BASE}/wc/v3/products/${id}`, {
    method: 'PUT',
    headers: { Authorization: authHeader(LIVE_CK, LIVE_CS), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${JSON.stringify(data).slice(0, 300)}`);
  return data;
}

async function runPool(items, worker, concurrency) {
  let idx = 0;
  let active = 0;
  return new Promise((resolveAll) => {
    function next() {
      if (idx >= items.length && active === 0) return resolveAll();
      while (active < concurrency && idx < items.length) {
        const item = items[idx++];
        active++;
        worker(item)
          .catch((err) => ({ __error: err }))
          .finally(() => {
            active--;
            next();
          });
      }
    }
    next();
  });
}

async function main() {
  console.log(`Mode: ${WRITE ? `WRITE (limit=${LIMIT === Infinity ? 'none' : LIMIT})` : 'DRY RUN (no changes)'}`);
  console.log(`Staging (source): ${STAGING_BASE}`);
  console.log(`Live (target):    ${LIVE_BASE}\n`);

  console.log('Fetching taxonomy reference data...');
  const [liveCategories, liveAttributes] = await Promise.all([
    fetchAllPages(LIVE_BASE, LIVE_CK, LIVE_CS, '/wc/v3/products/categories?_fields=id,slug,name', 'LIVE categories'),
    fetchAllPages(LIVE_BASE, LIVE_CK, LIVE_CS, '/wc/v3/products/attributes', 'LIVE attributes'),
  ]);
  const liveCategoryBySlug = new Map(liveCategories.map((c) => [c.slug, c]));
  const liveAttributeBySlug = new Map(liveAttributes.map((a) => [a.slug, a]));

  console.log('\nFetching full product catalogs (this takes a few minutes)...');
  const [stagingProducts, liveProducts] = await Promise.all([
    fetchAllProducts(STAGING_BASE, STAGING_CK, STAGING_CS, 'STAGING products'),
    fetchAllProducts(LIVE_BASE, LIVE_CK, LIVE_CS, 'LIVE products'),
  ]);
  console.log(`\nStaging products: ${stagingProducts.length}`);
  console.log(`Live products:    ${liveProducts.length}`);

  const liveBySku = new Map();
  const liveBySlug = new Map();
  const liveByName = new Map();
  for (const p of liveProducts) {
    if (p.sku && p.sku.trim() !== '') liveBySku.set(p.sku.trim(), p);
    if (p.slug) liveBySlug.set(p.slug, p);
    const norm = normalizeName(p.name);
    if (norm) {
      if (liveByName.has(norm)) liveByName.set(norm, 'AMBIGUOUS');
      else liveByName.set(norm, p);
    }
  }

  const toUpdate = []; // { liveId, stagingId, body, changes: [] }
  const skippedGap = [];
  const unmatched = [];
  let unchanged = 0;

  for (const sp of stagingProducts) {
    let match = null;
    let matchType = null;
    if (sp.sku && sp.sku.trim() !== '' && liveBySku.has(sp.sku.trim())) {
      match = liveBySku.get(sp.sku.trim());
      matchType = 'sku';
    } else if (sp.slug && liveBySlug.has(sp.slug)) {
      match = liveBySlug.get(sp.slug);
      matchType = 'slug';
    } else {
      const norm = normalizeName(sp.name);
      const nameMatch = norm ? liveByName.get(norm) : null;
      if (nameMatch && nameMatch !== 'AMBIGUOUS') {
        match = nameMatch;
        matchType = 'name';
      }
    }
    if (!match) {
      unmatched.push({ id: sp.id, name: sp.name });
      continue;
    }

    // Resolve categories
    let categoryGap = false;
    const categories = (sp.categories || []).map((c) => {
      const live = liveCategoryBySlug.get(c.slug);
      if (!live) categoryGap = true;
      return live ? { id: live.id } : null;
    });
    if (categoryGap) {
      skippedGap.push({ id: sp.id, liveId: match.id, name: sp.name, reason: 'category-gap' });
      continue;
    }

    // Resolve attributes
    let attributeGap = false;
    const attributes = (sp.attributes || []).map((a) => {
      const targetSlug = ATTRIBUTE_SLUG_OVERRIDES[a.slug] || a.slug;
      const live = liveAttributeBySlug.get(targetSlug);
      if (!live) {
        attributeGap = true;
        return null;
      }
      return {
        id: live.id,
        name: live.name,
        position: a.position ?? 0,
        visible: a.visible ?? true,
        variation: a.variation ?? false,
        options: a.options || [],
      };
    });
    if (attributeGap) {
      skippedGap.push({ id: sp.id, liveId: match.id, name: sp.name, reason: 'attribute-gap' });
      continue;
    }

    const tags = (sp.tags || []).map((t) => ({ name: t.name }));

    const nameChanged = normalizeText(sp.name) !== normalizeText(match.name);
    const descChanged = normalizeText(sp.description) !== normalizeText(match.description);
    const shortDescChanged = normalizeText(sp.short_description) !== normalizeText(match.short_description);

    const liveCatSlugs = (match.categories || []).map((c) => c.slug).sort().join(',');
    const newCatSlugs = (sp.categories || []).map((c) => c.slug).sort().join(',');
    const categoriesChanged = liveCatSlugs !== newCatSlugs;

    const liveAttrSig = (match.attributes || [])
      .map((a) => `${a.slug}:${(a.options || []).slice().sort().join('|')}`)
      .sort()
      .join(';');
    const newAttrSig = (sp.attributes || [])
      .map((a) => `${ATTRIBUTE_SLUG_OVERRIDES[a.slug] || a.slug}:${(a.options || []).slice().sort().join('|')}`)
      .sort()
      .join(';');
    const attributesChanged = liveAttrSig !== newAttrSig;

    const liveTagNames = (match.tags || []).map((t) => t.name).sort().join(',');
    const newTagNames = (sp.tags || []).map((t) => t.name).sort().join(',');
    const tagsChanged = liveTagNames !== newTagNames;

    if (!nameChanged && !descChanged && !shortDescChanged && !categoriesChanged && !attributesChanged && !tagsChanged) {
      unchanged++;
      continue;
    }

    const body = {};
    const changes = [];
    if (nameChanged) { body.name = sp.name; changes.push('name'); }
    if (descChanged) { body.description = sp.description; changes.push('description'); }
    if (shortDescChanged) { body.short_description = sp.short_description; changes.push('short_description'); }
    if (categoriesChanged) { body.categories = categories; changes.push('categories'); }
    if (attributesChanged) { body.attributes = attributes; changes.push('attributes'); }
    if (tagsChanged) { body.tags = tags; changes.push('tags'); }

    toUpdate.push({ liveId: match.id, stagingId: sp.id, matchType, name: sp.name, body, changes });
  }

  console.log('\n=== PLAN ===');
  console.log(`Matched:               ${stagingProducts.length - unmatched.length}`);
  console.log(`Unmatched:             ${unmatched.length}`);
  console.log(`Skipped (taxonomy gap):${skippedGap.length}`);
  console.log(`Already identical:     ${unchanged}`);
  console.log(`To update:             ${toUpdate.length}`);

  const changeFieldCounts = {};
  for (const u of toUpdate) for (const c of u.changes) changeFieldCounts[c] = (changeFieldCounts[c] || 0) + 1;
  console.log('\nChange field breakdown:');
  for (const [field, count] of Object.entries(changeFieldCounts)) console.log(`  ${field}: ${count}`);

  if (skippedGap.length > 0) {
    console.log('\n=== SKIPPED (taxonomy gap) — should be 0 after Pass 1 ===');
    skippedGap.slice(0, 20).forEach((s) => console.log(`  - [${s.reason}] staging#${s.id} live#${s.liveId} ${s.name}`));
    if (skippedGap.length > 20) console.log(`  ... and ${skippedGap.length - 20} more`);
  }

  const outDir = resolve(__dirname, 'output');
  mkdirSync(outDir, { recursive: true });

  if (!WRITE) {
    writeFileSync(
      resolve(outDir, 'write-catalog-sync-plan.json'),
      JSON.stringify({ toUpdate, skippedGap, unmatched, unchangedCount: unchanged }, null, 2),
    );
    console.log('\nDRY RUN — nothing written. Plan saved to scripts/output/write-catalog-sync-plan.json');
    console.log('Re-run with --write (optionally --limit=N) to apply.');
    return;
  }

  const batch = toUpdate.slice(0, LIMIT);
  console.log(`\nWriting ${batch.length} product(s) to LIVE (concurrency=${CONCURRENCY})...`);

  const results = { updated: [], failed: [] };
  let done = 0;
  await runPool(
    batch,
    async (u) => {
      try {
        await updateProduct(u.liveId, u.body);
        results.updated.push({ liveId: u.liveId, stagingId: u.stagingId, changes: u.changes });
      } catch (err) {
        results.failed.push({ liveId: u.liveId, stagingId: u.stagingId, name: u.name, error: String(err.message || err) });
      }
      done++;
      if (done % 100 === 0 || done === batch.length) {
        console.log(`  progress: ${done}/${batch.length} (updated: ${results.updated.length}, failed: ${results.failed.length})`);
      }
    },
    CONCURRENCY,
  );

  writeFileSync(resolve(outDir, 'write-catalog-sync-result.json'), JSON.stringify(results, null, 2));
  console.log('\n=== WRITE SUMMARY ===');
  console.log(`Updated: ${results.updated.length}`);
  console.log(`Failed:  ${results.failed.length}`);
  if (results.failed.length > 0) {
    console.log('\nFirst failures:');
    results.failed.slice(0, 10).forEach((f) => console.log(`  - live#${f.liveId} (${f.name}): ${f.error}`));
  }
  console.log('\nFull result written to scripts/output/write-catalog-sync-result.json');
  if (toUpdate.length > batch.length) {
    console.log(`\nRemaining not yet processed (due to --limit): ${toUpdate.length - batch.length}`);
  }
}

main().catch((err) => {
  console.error('\nFATAL:', err);
  process.exit(1);
});
