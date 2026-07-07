/**
 * Sample SEO baseline URLs (every Nth row) and verify WC Store API slug parity.
 * Run (dev server must be up): npm run audit:seo-baseline
 *
 * Env:
 *   WC_API_BASE   — default http://localhost:8080/wp-json/wc/store/v1
 *   SAMPLE_STEP   — default 10 (every 10th row)
 *   SAMPLE_LIMIT  — optional max rows to check
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.resolve(__dirname, '../../docs/crawl/seo-baseline.csv');
const OUT_PATH = path.resolve(__dirname, '../../docs/crawl/seo-baseline-audit-sample.csv');
const STORE_API = (process.env.WC_API_BASE ?? 'http://localhost:8080/wp-json/wc/store/v1').replace(
  /\/$/,
  '',
);
const STEP = Math.max(1, Number(process.env.SAMPLE_STEP ?? 10));
const LIMIT = process.env.SAMPLE_LIMIT ? Number(process.env.SAMPLE_LIMIT) : undefined;

/** Minimal RFC-style CSV row parser (handles quoted fields). */
function parseCsvRow(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function loadBaseline() {
  const raw = fs.readFileSync(CSV_PATH, 'utf8').replace(/^\uFEFF/, '');
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const header = parseCsvRow(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvRow(lines[i]);
    const row = Object.fromEntries(header.map((h, idx) => [h, cols[idx] ?? '']));
    if (row.url) rows.push(row);
  }
  return rows;
}

function pathnameFromUrl(url) {
  try {
    const raw = new URL(url).pathname.replace(/\/$/, '') || '/';
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  } catch {
    return null;
  }
}

function productSlugFromProdavnica(pathname) {
  const match = pathname.match(/^\/prodavnica\/(.+)\/([^/]+)$/);
  if (!match) return null;
  return { categoryPath: match[1], slug: match[2] };
}

function categorySegments(pathname) {
  const match = pathname.match(/^\/product-category\/(.+)$/);
  if (!match) return null;
  return match[1].split('/').filter(Boolean);
}

function normalizeProdavnicaPath(pathname) {
  return pathname.replace(/\/$/, '');
}

function prodavnicaPathFromPermalink(permalink) {
  const match = permalink?.match(/\/prodavnica\/(.+)\/[^/]+\/?$/);
  if (!match) return null;
  const slugMatch = permalink.match(/\/([^/]+)\/?$/);
  const slug = slugMatch?.[1];
  return slug ? `/prodavnica/${match[1].replace(/\/$/, '')}/${slug}` : null;
}

function categoryPathFromPermalink(permalink) {
  const match = permalink?.match(/\/product-category\/(.+)\/?$/);
  return match ? `/product-category/${match[1].replace(/\/$/, '')}` : null;
}

async function fetchJson(url, retries = 3) {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status >= 500 && attempt < retries) {
        await sleep(300 * attempt);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) await sleep(300 * attempt);
    }
  }
  throw lastErr;
}

async function fetchPaginated(path, perPage = 100, maxPages = 30) {
  const all = [];
  for (let page = 1; page <= maxPages; page++) {
    const res = await fetch(`${STORE_API}${path}?per_page=${perPage}&page=${page}`);
    if (!res.ok) throw new Error(`${path} HTTP ${res.status}`);
    const batch = await res.json();
    if (!batch.length) break;
    all.push(...batch);
    const totalPages = Number(res.headers.get('X-WP-TotalPages') ?? 1);
    if (page >= totalPages) break;
  }
  return all;
}

/** All WC category paths, e.g. `/product-category/pribor/burgije`. */
async function buildCategoryPathSet() {
  const categories = await fetchPaginated('/products/categories');
  const byId = Object.fromEntries(categories.map((c) => [c.id, c]));
  const paths = new Set();

  for (const cat of categories) {
    const segments = [cat.slug];
    let parentId = cat.parent;
    while (parentId) {
      const parent = byId[parentId];
      if (!parent) break;
      segments.unshift(parent.slug);
      parentId = parent.parent;
    }
    paths.add(`/product-category/${segments.join('/')}`);
  }

  return paths;
}

async function checkProduct(baselineUrl, pathname) {
  const parsed = productSlugFromProdavnica(pathname);
  if (!parsed) {
    return { status: 'skip', reason: 'not_a_prodavnica_product_path' };
  }

  const products = await fetchJson(
    `${STORE_API}/products?slug=${encodeURIComponent(parsed.slug)}&per_page=1`,
  );
  const product = products[0];
  if (!product) {
    return { status: 'removed', reason: 'product_not_in_store_api', slug: parsed.slug };
  }

  const apiPath = prodavnicaPathFromPermalink(product.permalink);
  const expected = normalizeProdavnicaPath(pathname);
  if (apiPath && apiPath !== expected) {
    return {
      status: 'warn',
      reason: 'permalink_path_changed_in_wc',
      slug: parsed.slug,
      expected,
      actual: apiPath,
    };
  }

  return { status: 'ok', slug: parsed.slug };
}

async function checkCategory(pathname, categoryPaths) {
  const segments = categorySegments(pathname);
  if (!segments?.length) {
    return { status: 'skip', reason: 'not_a_category_path' };
  }

  const expected = normalizeProdavnicaPath(pathname);
  if (categoryPaths.has(expected)) {
    return { status: 'ok', slug: segments[segments.length - 1] };
  }

  return {
    status: 'fail',
    reason: 'category_path_missing_in_wc',
    slug: segments[segments.length - 1],
    expected,
  };
}

async function checkRow(row, categoryPaths) {
  const pathname = pathnameFromUrl(row.url);
  if (!pathname) return { status: 'skip', reason: 'invalid_url' };

  if (row.type === 'product' || pathname.startsWith('/prodavnica/')) {
    return checkProduct(row.url, pathname);
  }
  if (row.type === 'category' || pathname.startsWith('/product-category/')) {
    return checkCategory(pathname, categoryPaths);
  }

  return { status: 'skip', reason: `type_${row.type || 'unknown'}` };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const allRows = loadBaseline();
const sampled = allRows.filter((_, i) => i % STEP === 0);
const toCheck = LIMIT ? sampled.slice(0, LIMIT) : sampled;

console.log('\nSEO baseline sample audit\n');
console.log(`CSV: ${CSV_PATH}`);
console.log(`Store API: ${STORE_API}`);
console.log(`Total rows: ${allRows.length} → sample every ${STEP}: ${sampled.length} rows\n`);

console.log('Loading WC category tree…');
const categoryPaths = await buildCategoryPathSet();
console.log(`  ${categoryPaths.size} category paths in Store API\n`);

const results = [];
let ok = 0;
let warn = 0;
let fail = 0;
let removed = 0;
let skip = 0;

for (let i = 0; i < toCheck.length; i++) {
  const row = toCheck[i];
  const pathname = pathnameFromUrl(row.url);
  let result;
  try {
    result = await checkRow(row, categoryPaths);
  } catch (err) {
    result = { status: 'fail', reason: 'fetch_error', message: err.message };
  }

  results.push({ row, pathname, result });

  if (result.status === 'ok') ok++;
  else if (result.status === 'warn') warn++;
  else if (result.status === 'removed') removed++;
  else if (result.status === 'fail') fail++;
  else skip++;

  if ((i + 1) % 25 === 0) {
    process.stdout.write(`  … ${i + 1}/${toCheck.length}\n`);
    await sleep(50);
  }
}

const failRows = results.filter((r) => r.result.status === 'fail');
const warnRows = results.filter((r) => r.result.status === 'warn');

console.log('\nSummary');
console.log(`  OK:      ${ok}`);
console.log(`  WARN:    ${warn} (product exists, WC changed category path — old URL still works by slug)`);
console.log(`  REMOVED: ${removed} (in baseline crawl, no longer in WC catalog)`);
console.log(`  FAIL:    ${fail}`);
console.log(`  SKIP:    ${skip} (pages, brend, etc.)`);

if (warnRows.length) {
  console.log('\nWarnings (first 10):');
  warnRows.slice(0, 10).forEach(({ pathname, result }) => {
    console.log(`  • ${pathname}`);
    console.log(`    WC canonical now: ${result.actual}`);
  });
}

if (failRows.length) {
  console.log('\nFailures (first 25):');
  failRows.slice(0, 25).forEach(({ row, pathname, result }) => {
    console.log(`  • [${row.type}] ${pathname}`);
    console.log(`    ${result.reason}${result.expected ? ` — expected ${result.expected}, got ${result.actual}` : ''}${result.message ? ` — ${result.message}` : ''}`);
  });
}

const outHeader = 'url,type,baseline_status,pathname,audit_status,reason,detail\n';
const outBody = results
  .map(({ row, pathname, result }) => {
    const detail = [result.expected, result.actual, result.slug, result.message]
      .filter(Boolean)
      .join(' | ');
    const esc = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
    return [
      esc(row.url),
      esc(row.type),
      esc(row.status),
      esc(pathname),
      esc(result.status),
      esc(result.reason),
      esc(detail),
    ].join(',');
  })
  .join('\n');

fs.writeFileSync(OUT_PATH, outHeader + outBody + '\n', 'utf8');
console.log(`\nReport: ${OUT_PATH}`);

if (fail > 0) {
  console.log('\n❌ Audit failed — missing products/categories in WC API.\n');
  process.exit(1);
}

if (warn > 0) {
  console.log('\n✅ Sample audit passed with warnings (WC reorganized some product paths; app resolves by slug).\n');
} else {
  console.log('\n✅ Sample audit passed — slug parity OK for checked URLs.\n');
}
