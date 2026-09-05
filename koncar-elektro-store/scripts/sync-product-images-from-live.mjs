/**
 * Sync product GALLERY IMAGES from LIVE (koncarelektro.rs) into STAGING
 * (testing.cleannikki.com) WITHOUT touching anything else on staging
 * (categories, descriptions, attributes, price, stock, slug, ...).
 *
 * Why: staging is the source of truth for everything except images — images
 * were stripped on staging for faster loading and only exist on the live site.
 *
 * Matching strategy (staging product -> live product):
 *   1. by SKU (exact, non-empty) — most reliable, survives slug/category changes
 *   2. fallback: by slug (exact)
 *   3. fallback: by normalized product name (case/whitespace-insensitive exact match)
 * Products that match none of the above are reported as "unmatched" for manual review
 * (typically genuinely new products added only on staging, with no live counterpart).
 * Products that match but whose live counterpart has 0 images are reported too.
 *
 * Safety:
 *   - Default mode is DRY RUN (no writes). Pass --write to actually PATCH staging.
 *   - Only the `images` field is sent in the PUT request (WC v3 PUT is a partial
 *     update — every other product field on staging is left untouched).
 *   - Idempotent/resumable: staging products that already have images (e.g. from
 *     a previous run) are skipped by default. Pass --force to resync everyone.
 *   - Use --limit=N to test on a small batch first.
 *
 * Usage:
 *   node scripts/sync-product-images-from-live.mjs                # dry run, full catalog
 *   node scripts/sync-product-images-from-live.mjs --limit=25     # dry run, first 25
 *   node scripts/sync-product-images-from-live.mjs --write         # actually update staging
 *   node scripts/sync-product-images-from-live.mjs --write --force # resync even if staging already has images
 */
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env');

function loadEnv() {
  try {
    const content = readFileSync(envPath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^\s*([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch {
    console.warn('No .env file found next to koncar-elektro-store/');
  }
}
loadEnv();

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const FORCE = args.includes('--force');
const limitArg = args.find((a) => a.startsWith('--limit='));
const LIMIT = limitArg ? Number(limitArg.split('=')[1]) : Infinity;

// --- TARGET: staging (write) ---
const STAGING_BASE = (process.env.NEXT_PUBLIC_WP_API_URL || '').replace(/\/$/, '');
const STAGING_CK = process.env.WC_CONSUMER_KEY || '';
const STAGING_CS = process.env.WC_CONSUMER_SECRET || '';

// --- SOURCE: live (read-only) ---
const LIVE_BASE = (process.env.LIVE_WP_API_URL || '').replace(/\/$/, '');
const LIVE_CK = process.env.LIVE_WC_CONSUMER_KEY || '';
const LIVE_CS = process.env.LIVE_WC_CONSUMER_SECRET || '';

if (!STAGING_BASE || !STAGING_CK || !STAGING_CS) {
  console.error('Missing staging config: NEXT_PUBLIC_WP_API_URL / WC_CONSUMER_KEY / WC_CONSUMER_SECRET');
  process.exit(1);
}
if (!LIVE_BASE || !LIVE_CK || !LIVE_CS) {
  console.error('Missing live config: LIVE_WP_API_URL / LIVE_WC_CONSUMER_KEY / LIVE_WC_CONSUMER_SECRET');
  process.exit(1);
}
if (STAGING_BASE === LIVE_BASE) {
  console.error('STAGING and LIVE base URLs are identical — refusing to run (would be a no-op / self-overwrite).');
  process.exit(1);
}

function authHeader(ck, cs) {
  return `Basic ${Buffer.from(`${ck}:${cs}`).toString('base64')}`;
}

async function fetchWithRetry(url, options, retries = 3) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.status === 429 || res.status >= 500) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res;
    } catch (err) {
      lastErr = err;
      if (i < retries) await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw lastErr;
}

async function fetchAllProducts(base, ck, cs, label) {
  const fields = 'id,sku,slug,name,type,images';
  const all = [];
  let page = 1;
  let totalPages = 1;
  do {
    const url = `${base}/wc/v3/products?per_page=100&page=${page}&orderby=id&order=asc&_fields=${fields}`;
    const res = await fetchWithRetry(url, { headers: { Authorization: authHeader(ck, cs) } });
    if (!res.ok) throw new Error(`${label} fetch failed: HTTP ${res.status} (${url})`);
    const batch = await res.json();
    if (!Array.isArray(batch)) throw new Error(`${label}: expected array, got ${JSON.stringify(batch).slice(0, 200)}`);
    all.push(...batch);
    totalPages = Number(res.headers.get('X-WP-TotalPages') || 1);
    if (page === 1 || page % 10 === 0 || page === totalPages) {
      console.log(`  ${label}: page ${page}/${totalPages} (${all.length} so far)`);
    }
    page += 1;
  } while (page <= totalPages);
  return all;
}

async function updateStagingImages(productId, images) {
  const url = `${STAGING_BASE}/wc/v3/products/${productId}`;
  const res = await fetchWithRetry(url, {
    method: 'PUT',
    headers: {
      Authorization: authHeader(STAGING_CK, STAGING_CS),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ images }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`PUT ${productId} failed: HTTP ${res.status} — ${JSON.stringify(body).slice(0, 300)}`);
  }
  return body;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeName(name) {
  return (name || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  console.log(`Mode: ${WRITE ? 'WRITE (will update staging)' : 'DRY RUN (no changes)'}${FORCE ? ' + FORCE' : ''}${LIMIT !== Infinity ? ` + limit=${LIMIT}` : ''}`);
  console.log(`Staging (target): ${STAGING_BASE}`);
  console.log(`Live (source):    ${LIVE_BASE}\n`);

  console.log('Fetching all LIVE products (source of images)...');
  const liveProducts = await fetchAllProducts(LIVE_BASE, LIVE_CK, LIVE_CS, 'LIVE');
  console.log(`  -> ${liveProducts.length} live products fetched\n`);

  const liveBySku = new Map();
  const liveBySlug = new Map();
  const liveByName = new Map(); // normalized name -> product, or 'AMBIGUOUS' marker if >1 match
  for (const p of liveProducts) {
    if (p.sku && p.sku.trim() !== '') liveBySku.set(p.sku.trim(), p);
    if (p.slug) liveBySlug.set(p.slug, p);
    const norm = normalizeName(p.name);
    if (norm) {
      if (liveByName.has(norm)) liveByName.set(norm, 'AMBIGUOUS');
      else liveByName.set(norm, p);
    }
  }

  console.log('Fetching all STAGING products (target)...');
  const stagingProducts = await fetchAllProducts(STAGING_BASE, STAGING_CK, STAGING_CS, 'STAGING');
  console.log(`  -> ${stagingProducts.length} staging products fetched\n`);

  const toUpdate = [];
  const report = {
    skippedAlreadyHasImages: [],
    noSourceImages: [],
    unmatched: [],
    toUpdate: [],
  };

  for (const sp of stagingProducts) {
    if (!FORCE && Array.isArray(sp.images) && sp.images.length > 0) {
      report.skippedAlreadyHasImages.push({ id: sp.id, slug: sp.slug });
      continue;
    }

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
      if (nameMatch === 'AMBIGUOUS') {
        report.unmatched.push({ id: sp.id, sku: sp.sku, slug: sp.slug, name: sp.name, reason: 'ambiguous-name' });
        continue;
      } else if (nameMatch) {
        match = nameMatch;
        matchType = 'name';
      }
    }

    if (!match) {
      report.unmatched.push({ id: sp.id, sku: sp.sku, slug: sp.slug, name: sp.name, reason: 'no-match' });
      continue;
    }

    if (!Array.isArray(match.images) || match.images.length === 0) {
      report.noSourceImages.push({ id: sp.id, slug: sp.slug, matchType, liveId: match.id });
      continue;
    }

    const images = match.images.map((img, idx) => ({
      src: img.src,
      name: img.name || undefined,
      alt: img.alt || undefined,
      position: idx,
    }));

    toUpdate.push({ stagingId: sp.id, slug: sp.slug, matchType, liveId: match.id, images });
    report.toUpdate.push({ stagingId: sp.id, slug: sp.slug, matchType, liveId: match.id, imageCount: images.length });
  }

  console.log('--- Match summary ---');
  console.log(`Staging products total:        ${stagingProducts.length}`);
  console.log(`Already have images (skipped): ${report.skippedAlreadyHasImages.length}`);
  console.log(`Matched, will update images:   ${report.toUpdate.length}`);
  console.log(`Matched but live has 0 images: ${report.noSourceImages.length}`);
  console.log(`Unmatched (no live counterpart):${report.unmatched.length}`);
  const bySku = report.toUpdate.filter((r) => r.matchType === 'sku').length;
  const bySlug = report.toUpdate.filter((r) => r.matchType === 'slug').length;
  const byName = report.toUpdate.filter((r) => r.matchType === 'name').length;
  console.log(`  (of which matched by SKU: ${bySku}, by slug: ${bySlug}, by name: ${byName})`);

  const outDir = resolve(__dirname, 'output');
  mkdirSync(outDir, { recursive: true });
  const reportPath = resolve(outDir, 'image-sync-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nFull report written to ${reportPath}`);

  if (!WRITE) {
    console.log('\nDry run only — no staging data was changed. Re-run with --write to apply.');
    return;
  }

  const batch = toUpdate.slice(0, LIMIT === Infinity ? toUpdate.length : LIMIT);
  console.log(`\nApplying image updates to staging for ${batch.length} products...`);

  const CONCURRENCY = 4;
  const results = { updated: [], failed: [] };
  let cursor = 0;

  async function worker() {
    while (cursor < batch.length) {
      const item = batch[cursor++];
      try {
        await updateStagingImages(item.stagingId, item.images);
        results.updated.push({ stagingId: item.stagingId, slug: item.slug, imageCount: item.images.length });
        if (results.updated.length % 25 === 0) {
          console.log(`  updated ${results.updated.length}/${batch.length}...`);
        }
      } catch (err) {
        results.failed.push({ stagingId: item.stagingId, slug: item.slug, error: String(err.message || err) });
        console.warn(`  FAILED staging#${item.stagingId} (${item.slug}): ${err.message || err}`);
      }
      await sleep(150);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  console.log(`\n--- Write summary ---`);
  console.log(`Updated: ${results.updated.length}`);
  console.log(`Failed:  ${results.failed.length}`);

  const writeReportPath = resolve(outDir, 'image-sync-write-result.json');
  writeFileSync(writeReportPath, JSON.stringify(results, null, 2));
  console.log(`Write result written to ${writeReportPath}`);
}

main().catch((err) => {
  console.error('\nFATAL:', err);
  process.exit(1);
});
