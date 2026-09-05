/**
 * DRY-RUN readiness report for syncing catalog CONTENT (name, description,
 * categories, attributes, tags) from STAGING (testing.cleannikki.com) onto
 * LIVE (koncarelektro.rs) — WITHOUT ever touching images, price, stock, sku,
 * or slug on live.
 *
 * This script is READ-ONLY on both sides (GET only). It never writes. It
 * exists to answer: "are we ready to migrate the catalog?" — i.e. how many
 * products match, and how many staging categories/attributes have no
 * counterpart on live yet (those need manual creation/mapping before any
 * write pass is attempted).
 *
 * Matching staging -> live product: SKU -> slug -> normalized name (same
 * 3-tier strategy already validated in sync-product-images-from-live.mjs).
 *
 * Usage:
 *   node scripts/sync-catalog-staging-to-live.mjs
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

if (!STAGING_BASE || !STAGING_CK || !STAGING_CS) {
  console.error('Missing staging config: NEXT_PUBLIC_WP_API_URL / WC_CONSUMER_KEY / WC_CONSUMER_SECRET');
  process.exit(1);
}
if (!LIVE_BASE || !LIVE_CK || !LIVE_CS) {
  console.error('Missing live config: LIVE_WP_API_URL / LIVE_WC_CONSUMER_KEY / LIVE_WC_CONSUMER_SECRET');
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

// Manual overrides for attribute taxonomies that were renamed between
// staging and live (same concept, different slug).
const ATTRIBUTE_SLUG_OVERRIDES = {
  pa_brend: 'pa_proizvodjac', // staging "Brend" == live "Proizvodjač"
};

async function main() {
  console.log(`Staging (source): ${STAGING_BASE}`);
  console.log(`Live (target):    ${LIVE_BASE}`);
  console.log('Mode: DRY RUN — read-only on both sides, nothing is written.\n');

  console.log('Fetching taxonomy reference data...');
  const [liveCategories, liveAttributes, stagingAttributes] = await Promise.all([
    fetchAllPages(LIVE_BASE, LIVE_CK, LIVE_CS, '/wc/v3/products/categories?_fields=id,slug,name', 'LIVE categories'),
    fetchAllPages(LIVE_BASE, LIVE_CK, LIVE_CS, '/wc/v3/products/attributes', 'LIVE attributes'),
    fetchAllPages(STAGING_BASE, STAGING_CK, STAGING_CS, '/wc/v3/products/attributes', 'STAGING attributes'),
  ]);

  const liveCategoryBySlug = new Map(liveCategories.map((c) => [c.slug, c]));
  const liveAttributeBySlug = new Map(liveAttributes.map((a) => [a.slug, a]));

  console.log(`\nLive categories: ${liveCategories.length}`);
  console.log(`Live attribute taxonomies: ${liveAttributes.length}`);
  console.log(`Staging attribute taxonomies: ${stagingAttributes.length}`);

  const unmappedAttrSlugs = stagingAttributes
    .map((a) => a.slug)
    .filter((slug) => !liveAttributeBySlug.has(ATTRIBUTE_SLUG_OVERRIDES[slug] || slug));
  console.log(`\nStaging attribute taxonomies with NO live counterpart: ${unmappedAttrSlugs.length}/${stagingAttributes.length}`);
  console.log(unmappedAttrSlugs.map((s) => `  - ${s}`).join('\n'));

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

  const report = {
    matched: [],
    unmatched: [],
    categorySlugGapsSeen: new Set(),
    attributeSlugGapsSeen: new Set(),
  };

  let matchBySku = 0, matchBySlug = 0, matchByName = 0;
  let nameDiffers = 0, descDiffers = 0, hasUnmappedCategory = 0, hasUnmappedAttribute = 0;

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
      if (nameMatch === 'AMBIGUOUS') {
        report.unmatched.push({ id: sp.id, slug: sp.slug, name: sp.name, reason: 'ambiguous-name' });
        continue;
      } else if (nameMatch) {
        match = nameMatch;
        matchType = 'name';
      }
    }

    if (!match) {
      report.unmatched.push({ id: sp.id, slug: sp.slug, name: sp.name, reason: 'no-match' });
      continue;
    }

    if (matchType === 'sku') matchBySku++;
    else if (matchType === 'slug') matchBySlug++;
    else matchByName++;

    const nameChanged = normalizeText(sp.name) !== normalizeText(match.name);
    const descChanged =
      normalizeText(sp.description) !== normalizeText(match.description) ||
      normalizeText(sp.short_description) !== normalizeText(match.short_description);
    if (nameChanged) nameDiffers++;
    if (descChanged) descDiffers++;

    const categoryResolution = (sp.categories || []).map((c) => {
      const live = liveCategoryBySlug.get(c.slug);
      if (!live) report.categorySlugGapsSeen.add(c.slug);
      return { stagingSlug: c.slug, stagingName: c.name, liveId: live?.id ?? null };
    });
    const unmappedCategories = categoryResolution.filter((c) => c.liveId === null);
    if (unmappedCategories.length > 0) hasUnmappedCategory++;

    const attributeResolution = (sp.attributes || []).map((a) => {
      const targetSlug = ATTRIBUTE_SLUG_OVERRIDES[a.slug] || a.slug;
      const live = liveAttributeBySlug.get(targetSlug);
      if (!live) report.attributeSlugGapsSeen.add(a.slug);
      return { stagingSlug: a.slug, stagingName: a.name, liveAttributeId: live?.id ?? null };
    });
    const unmappedAttributes = attributeResolution.filter((a) => a.liveAttributeId === null);
    if (unmappedAttributes.length > 0) hasUnmappedAttribute++;

    report.matched.push({
      stagingId: sp.id,
      liveId: match.id,
      slug: sp.slug,
      matchType,
      nameChanged,
      descChanged,
      unmappedCategories: unmappedCategories.map((c) => c.stagingSlug),
      unmappedAttributes: unmappedAttributes.map((a) => a.stagingSlug),
    });
  }

  console.log('\n=== MATCH SUMMARY ===');
  console.log(`Staging products total:  ${stagingProducts.length}`);
  console.log(`Matched to live:         ${report.matched.length}  (sku: ${matchBySku}, slug: ${matchBySlug}, name: ${matchByName})`);
  console.log(`Unmatched (no live counterpart): ${report.unmatched.length}`);

  console.log('\n=== CONTENT DIFF SUMMARY (of matched products) ===');
  console.log(`Name differs:             ${nameDiffers}`);
  console.log(`Description differs:      ${descDiffers}`);
  console.log(`Has ≥1 unmapped category: ${hasUnmappedCategory}`);
  console.log(`Has ≥1 unmapped attribute:${hasUnmappedAttribute}`);

  console.log('\n=== UNIQUE CATEGORY SLUGS WITH NO LIVE COUNTERPART ===');
  console.log(`Count: ${report.categorySlugGapsSeen.size}`);
  [...report.categorySlugGapsSeen].sort().forEach((s) => console.log(`  - ${s}`));

  console.log('\n=== UNIQUE ATTRIBUTE SLUGS WITH NO LIVE COUNTERPART ===');
  console.log(`Count: ${report.attributeSlugGapsSeen.size}`);
  [...report.attributeSlugGapsSeen].sort().forEach((s) => console.log(`  - ${s}`));

  const outDir = resolve(__dirname, 'output');
  mkdirSync(outDir, { recursive: true });
  const serializable = {
    ...report,
    categorySlugGapsSeen: [...report.categorySlugGapsSeen].sort(),
    attributeSlugGapsSeen: [...report.attributeSlugGapsSeen].sort(),
    summary: {
      stagingTotal: stagingProducts.length,
      liveTotal: liveProducts.length,
      matched: report.matched.length,
      matchBySku,
      matchBySlug,
      matchByName,
      unmatched: report.unmatched.length,
      nameDiffers,
      descDiffers,
      hasUnmappedCategory,
      hasUnmappedAttribute,
    },
  };
  writeFileSync(resolve(outDir, 'catalog-sync-dry-run-report.json'), JSON.stringify(serializable, null, 2));
  console.log(`\nFull report written to scripts/output/catalog-sync-dry-run-report.json`);
  console.log('\nThis was READ-ONLY. Nothing was written to staging or live.');
}

main().catch((err) => {
  console.error('\nFATAL:', err);
  process.exit(1);
});
