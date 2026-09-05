/**
 * UNDO for sync-product-images-from-live.mjs.
 *
 * Removes the `images` reference from every STAGING product that currently
 * has any (sets images: []). This reverts the product-level state to how it
 * was before the sync (no product had images).
 *
 * NOTE: this does NOT delete the actual uploaded media files from disk — the
 * WC REST API credentials used here are not authorized to delete attachments
 * via wp/v2/media (tested: 401 rest_cannot_delete). The physical files must be
 * removed via cPanel File Manager / FTP (wp-content/uploads/2026/09/) to
 * actually free disk space. This script only cleans up the DB-side reference
 * so no product points at (soon to be) missing files.
 *
 * Safe to re-run: only touches products that currently have images.length > 0.
 * Handles the staging site's intermittent 503s (disk-full related) with retries.
 *
 * Usage:
 *   node scripts/undo-product-images-sync.mjs             # dry run (lists only)
 *   node scripts/undo-product-images-sync.mjs --write      # actually clears images
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

const BASE = (process.env.NEXT_PUBLIC_WP_API_URL || '').replace(/\/$/, '');
const CK = process.env.WC_CONSUMER_KEY || '';
const CS = process.env.WC_CONSUMER_SECRET || '';
if (!BASE || !CK || !CS) {
  console.error('Missing staging config: NEXT_PUBLIC_WP_API_URL / WC_CONSUMER_KEY / WC_CONSUMER_SECRET');
  process.exit(1);
}
const AUTH = `Basic ${Buffer.from(`${CK}:${CS}`).toString('base64')}`;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url, options, retries = 6) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.status === 503 || res.status === 429 || res.status >= 500) {
        lastErr = new Error(`HTTP ${res.status}`);
      } else {
        return res;
      }
    } catch (err) {
      lastErr = err;
    }
    const wait = Math.min(2000 * (i + 1), 15000);
    console.log(`    retry in ${wait}ms (${lastErr.message})...`);
    await sleep(wait);
  }
  throw lastErr;
}

async function fetchAllWithImages() {
  const all = [];
  let page = 1;
  let totalPages = 1;
  do {
    const url = `${BASE}/wc/v3/products?per_page=100&page=${page}&orderby=id&order=asc&_fields=id,slug,images`;
    const res = await fetchWithRetry(url, { headers: { Authorization: AUTH } });
    if (!res.ok) throw new Error(`fetch failed page ${page}: HTTP ${res.status}`);
    const batch = await res.json();
    all.push(...batch);
    totalPages = Number(res.headers.get('X-WP-TotalPages') || 1);
    if (page % 10 === 0 || page === totalPages) console.log(`  page ${page}/${totalPages} (${all.length} so far)`);
    page += 1;
  } while (page <= totalPages);
  return all;
}

async function clearImages(id) {
  const res = await fetchWithRetry(`${BASE}/wc/v3/products/${id}`, {
    method: 'PUT',
    headers: { Authorization: AUTH, 'Content-Type': 'application/json' },
    body: JSON.stringify({ images: [] }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`PUT ${id} failed: HTTP ${res.status} — ${JSON.stringify(body).slice(0, 200)}`);
  return body;
}

async function main() {
  console.log(`Mode: ${WRITE ? 'WRITE (will clear images on staging)' : 'DRY RUN'}`);
  console.log(`Staging: ${BASE}\n`);

  console.log('Fetching all staging products...');
  const products = await fetchAllWithImages();
  const withImages = products.filter((p) => Array.isArray(p.images) && p.images.length > 0);
  console.log(`\nTotal staging products: ${products.length}`);
  console.log(`Products currently WITH images (to be cleared): ${withImages.length}`);

  const outDir = resolve(__dirname, 'output');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    resolve(outDir, 'undo-products-with-images-before-clear.json'),
    JSON.stringify(withImages.map((p) => ({ id: p.id, slug: p.slug, imageCount: p.images.length })), null, 2),
  );

  if (!WRITE) {
    console.log('\nDry run only — nothing changed. Re-run with --write to clear images.');
    return;
  }

  console.log(`\nClearing images on ${withImages.length} products (sequential, retries on 503)...`);
  const results = { cleared: [], failed: [] };
  for (const [idx, p] of withImages.entries()) {
    try {
      await clearImages(p.id);
      results.cleared.push(p.id);
      if (results.cleared.length % 50 === 0) {
        console.log(`  cleared ${results.cleared.length}/${withImages.length}...`);
      }
    } catch (err) {
      results.failed.push({ id: p.id, slug: p.slug, error: String(err.message || err) });
      console.warn(`  FAILED #${p.id} (${p.slug}): ${err.message || err}`);
    }
    await sleep(100);
  }

  console.log(`\n--- Undo summary ---`);
  console.log(`Cleared: ${results.cleared.length}`);
  console.log(`Failed:  ${results.failed.length}`);
  writeFileSync(resolve(outDir, 'undo-result.json'), JSON.stringify(results, null, 2));
  console.log('Result written to scripts/output/undo-result.json');
  if (results.failed.length > 0) {
    console.log('\nRe-run this script again (--write) to retry the failed ones — it is safe/idempotent.');
  }
}

main().catch((err) => {
  console.error('\nFATAL:', err);
  process.exit(1);
});
