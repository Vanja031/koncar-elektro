/**
 * SEO parity audit: fetch HTML from local Next dev and compare vs seo-baseline.csv.
 * Covers GSC top pages + stratified sample (products, categories, taxonomies).
 *
 * Usage (dev server running): npm run audit:seo-parity-local
 * Env:
 *   SITE_BASE=http://localhost:3000
 *   GSC_TOP_N=30
 *   SAMPLE_STEP=50
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.resolve(__dirname, '../../docs/crawl/seo-baseline.csv');
const GSC_PATH = path.resolve(__dirname, '../../docs/gsc-export-2026-06-22/Pages.csv');
const OUT_CSV = path.resolve(__dirname, '../../docs/crawl/seo-parity-local.csv');
const OUT_MD = path.resolve(__dirname, '../../docs/crawl/seo-parity-local.md');

const SITE_BASE = (process.env.SITE_BASE ?? 'http://localhost:3000').replace(/\/$/, '');
const GSC_TOP_N = Number(process.env.GSC_TOP_N ?? 30);
const SAMPLE_STEP = Math.max(1, Number(process.env.SAMPLE_STEP ?? 50));

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
        } else inQuotes = false;
      } else cur += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

function loadBaseline() {
  const raw = fs.readFileSync(CSV_PATH, 'utf8').replace(/^\uFEFF/, '');
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const header = parseCsvRow(lines[0]);
  const byPath = new Map();
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvRow(lines[i]);
    const row = Object.fromEntries(header.map((h, idx) => [h, cols[idx] ?? '']));
    if (!row.url) continue;
    rows.push(row);
    try {
      const p = new URL(row.url).pathname.replace(/\/$/, '') || '/';
      byPath.set(p, row);
    } catch {
      /* skip */
    }
  }
  return { rows, byPath };
}

function loadGscTopUrls(n) {
  if (!fs.existsSync(GSC_PATH)) return [];
  const raw = fs.readFileSync(GSC_PATH, 'utf8').replace(/^\uFEFF/, '');
  const lines = raw.split(/\r?\n/).filter(Boolean).slice(1);
  return lines
    .slice(0, n)
    .map((line) => {
      const url = line.split(',')[0]?.trim();
      if (!url?.startsWith('http')) return null;
      try {
        return new URL(url).pathname;
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function normPath(p) {
  return p.replace(/\/$/, '') || '/';
}

function expectedCanonical(pathname) {
  const key = normPath(pathname);
  return `https://koncarelektro.rs${key === '/' ? '/' : `${key}/`}`;
}

function extractMeta(html) {
  const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? '';
  const metaDesc =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] ??
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i)?.[1] ??
    '';
  const canonical =
    html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] ??
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)?.[1] ??
    '';
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, '').trim() ?? '';

  const jsonLdBlocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const jsonLdTypes = new Set();
  for (const m of jsonLdBlocks) {
    try {
      const parsed = JSON.parse(m[1]);
      const nodes = Array.isArray(parsed) ? parsed : parsed['@graph'] ?? [parsed];
      for (const node of nodes) {
        const t = node['@type'];
        if (typeof t === 'string') jsonLdTypes.add(t);
        else if (Array.isArray(t)) t.forEach((x) => jsonLdTypes.add(x));
      }
    } catch {
      /* ignore malformed */
    }
  }

  return { title, metaDesc, canonical, h1, jsonLdTypes: [...jsonLdTypes].sort() };
}

function titleMatches(baselineTitle, localTitle) {
  if (!baselineTitle || !localTitle) return !baselineTitle;
  if (baselineTitle === localTitle) return true;
  const a = baselineTitle.toLowerCase().replace(/\s+/g, ' ').trim();
  const b = localTitle.toLowerCase().replace(/\s+/g, ' ').trim();
  return a === b || b.includes(a.slice(0, 40)) || a.includes(b.slice(0, 40));
}

function auditRow(pathname, baseline, fetchResult) {
  const { status, html, err, redirectedFrom, finalPath } = fetchResult;
  const key = normPath(pathname);
  const auditPath = normPath(finalPath || pathname);
  const meta = html ? extractMeta(html) : { title: '', metaDesc: '', canonical: '', h1: '', jsonLdTypes: [] };
  const issues = [];

  if (err) issues.push(`FETCH_ERR:${err}`);
  else if (status === '404') issues.push('HTTP_404');
  else if (status !== '200') issues.push(`HTTP_${status}`);

  if (redirectedFrom) {
    issues.push('REDIRECT_OK');
  }

  const expCanon = expectedCanonical(auditPath);
  if (meta.canonical && meta.canonical !== expCanon && !redirectedFrom) issues.push('CANONICAL_DIFF');
  if (!meta.canonical && status === '200') issues.push('NO_CANONICAL');
  if (!meta.title && status === '200') issues.push('NO_TITLE');

  const titleBaseline = baseline?.title;
  if (titleBaseline && meta.title && !titleMatches(titleBaseline, meta.title) && !redirectedFrom) {
    issues.push('TITLE_DIFF');
  }
  if (baseline?.meta_description && !meta.metaDesc && !redirectedFrom) issues.push('NO_META_DESC');
  if (baseline?.h1 && !meta.h1 && !redirectedFrom) issues.push('NO_H1');

  const isProduct = auditPath.startsWith('/prodavnica/');
  const isCategory = auditPath.startsWith('/product-category/');
  if (!redirectedFrom && isProduct && status === '200' && !meta.jsonLdTypes.includes('Product')) {
    issues.push('NO_PRODUCT_JSONLD');
  }
  if (
    !redirectedFrom &&
    (isProduct || isCategory) &&
    status === '200' &&
    !meta.jsonLdTypes.includes('BreadcrumbList')
  ) {
    issues.push('NO_BREADCRUMB_JSONLD');
  }

  const filteredIssues = issues.filter((i) => i !== 'REDIRECT_OK' || issues.length === 1);
  const issueStr =
    issues.includes('REDIRECT_OK') && issues.length === 1
      ? 'OK'
      : filteredIssues.filter((i) => i !== 'REDIRECT_OK').join('|') || 'OK';

  return {
    path: key,
    final_path: auditPath,
    source: fetchResult.source,
    status,
    issues: issueStr,
    baseline_title: (baseline?.title ?? '').slice(0, 100),
    local_title: meta.title.slice(0, 100),
    local_canonical: meta.canonical,
    expected_canonical: expCanon,
    local_h1: meta.h1.slice(0, 80),
    baseline_h1: (baseline?.h1 ?? '').slice(0, 80),
    jsonld_types: meta.jsonLdTypes.join('+'),
  };
}

async function fetchPath(pathname) {
  const url = `${SITE_BASE}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
  try {
    const res = await fetch(url, { redirect: 'manual' });
    const status = String(res.status);

    if (status === '301' || status === '302' || status === '307' || status === '308') {
      const location = res.headers.get('location');
      if (location) {
        const target = location.startsWith('http') ? location : `${SITE_BASE}${location}`;
        const follow = await fetch(target, { redirect: 'follow' });
        const html = await follow.text();
        return {
          status: String(follow.status),
          html,
          err: '',
          redirectedFrom: pathname,
          finalPath: new URL(follow.url).pathname,
        };
      }
    }

    const html = await res.text();
    return { status, html, err: '', redirectedFrom: '', finalPath: pathname };
  } catch (e) {
    return { status: 'ERR', html: '', err: e instanceof Error ? e.message : String(e), redirectedFrom: '', finalPath: pathname };
  }
}

const { rows, byPath } = loadBaseline();
const gscPaths = loadGscTopUrls(GSC_TOP_N);

const sampledProducts = rows.filter((r) => r.type === 'product').filter((_, i) => i % SAMPLE_STEP === 0);
const sampledCategories = rows.filter((r) => r.type === 'category').filter((_, i) => i % SAMPLE_STEP === 0);
const sampledTaxonomies = rows
  .filter((r) => {
    const p = pathnameFromUrl(r.url);
    return p?.startsWith('/proizvodjac/') || p?.startsWith('/snaga/') || p?.startsWith('/uvoznik/');
  })
  .filter((_, i) => i % Math.max(5, Math.floor(SAMPLE_STEP / 5)) === 0);

function pathnameFromUrl(url) {
  try {
    return new URL(url).pathname;
  } catch {
    return null;
  }
}

const urlPlan = new Map();
for (const p of gscPaths) urlPlan.set(normPath(p), 'gsc_top');
for (const r of sampledProducts) {
  const p = pathnameFromUrl(r.url);
  if (p) urlPlan.set(normPath(p), 'sample_product');
}
for (const r of sampledCategories) {
  const p = pathnameFromUrl(r.url);
  if (p) urlPlan.set(normPath(p), 'sample_category');
}
for (const r of sampledTaxonomies) {
  const p = pathnameFromUrl(r.url);
  if (p) urlPlan.set(normPath(p), 'sample_taxonomy');
}

console.log(`\nSEO parity local audit`);
console.log(`  Site: ${SITE_BASE}`);
console.log(`  URLs to check: ${urlPlan.size}\n`);

const results = [];
let i = 0;
for (const [pathname, source] of urlPlan) {
  i++;
  const fetchResult = await fetchPath(pathname);
  fetchResult.source = source;
  const baseline = byPath.get(pathname);
  results.push(auditRow(pathname, baseline, fetchResult));
  if (i % 10 === 0) process.stdout.write(`  … ${i}/${urlPlan.size}\n`);
}

const failRows = results.filter((r) => r.issues !== 'OK');
const summary = {
  total: results.length,
  ok: results.filter((r) => r.issues === 'OK').length,
  fail: failRows.length,
  byIssue: {},
};
for (const r of failRows) {
  for (const issue of r.issues.split('|')) {
    summary.byIssue[issue] = (summary.byIssue[issue] || 0) + 1;
  }
}

const header = [
  'path',
  'final_path',
  'source',
  'status',
  'issues',
  'baseline_title',
  'local_title',
  'local_canonical',
  'expected_canonical',
  'local_h1',
  'baseline_h1',
  'jsonld_types',
];
const csv = [
  header.join(','),
  ...results.map((r) =>
    header.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','),
  ),
].join('\n');
fs.writeFileSync(OUT_CSV, csv);

const md = `# SEO parity local audit

Generated: ${new Date().toISOString()}  
Site: \`${SITE_BASE}\`

## Summary

| Metric | Count |
|--------|------:|
| Total checked | ${summary.total} |
| OK | ${summary.ok} |
| Issues | ${summary.fail} |

## Issues by type

| Issue | Count |
|-------|------:|
${Object.entries(summary.byIssue)
  .sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `| ${k} | ${v} |`)
  .join('\n')}

## Failures (first 40)

| Path | Status | Issues |
|------|--------|--------|
${failRows
  .slice(0, 40)
  .map((r) => `| \`${r.path}\` | ${r.status} | ${r.issues} |`)
  .join('\n')}
`;
fs.writeFileSync(OUT_MD, md);

console.log('\nSummary:', summary);
console.log('Wrote', OUT_CSV);
console.log('Wrote', OUT_MD);

for (const r of failRows.slice(0, 15)) {
  console.log('!', r.path, r.status, r.issues);
}

process.exit(failRows.length > 0 ? 1 : 0);
