/**
 * Read-only URL gap inventory: baseline CSV vs Next.js route patterns.
 * No HTTP calls, no WP writes. Output: docs/crawl/seo-url-gap-report.json + .md
 *
 * Usage: node scripts/seo-url-gap-inventory.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CSV_PATH = path.resolve(ROOT, 'docs/crawl/seo-baseline.csv');
const OUT_JSON = path.resolve(ROOT, 'docs/crawl/seo-url-gap-report.json');
const OUT_MD = path.resolve(ROOT, 'docs/crawl/seo-url-gap-report.md');

/** Previously agreed skip — now empty (wishlist/compare/novosti covered in N7). */
const SKIP_PATHS = new Set();

/** Static pages implemented in app/ (trailing slash normalized away). */
const STATIC_ROUTES = new Set([
  '/',
  '/akcija',
  '/kolacici-cookies',
  '/kontakt',
  '/nacin-placanja',
  '/nacini-isporuke',
  '/narucivanje',
  '/o-nama',
  '/podaci-o-firmi',
  '/politika-privatnosti',
  '/pravo-na-odustajanje',
  '/proizvodi',
  '/reklamacije',
  '/uslovi-koriscenja',
  '/uslovi-kupovine',
  '/korpa',
  '/placanje-odjava',
  '/najprodavanije',
  '/pretraga',
  '/pitanja',
  '/prijava',
  '/registracija',
  '/novosti',
  '/lista-zelja',
  '/uporedite',
  '/yith-compare',
]);

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

function pathnameFromUrl(url) {
  try {
    const p = new URL(url).pathname.replace(/\/$/, '') || '/';
    return decodeURIComponent(p);
  } catch {
    return null;
  }
}

function classifyRoute(pathname) {
  if (SKIP_PATHS.has(pathname)) return 'skip_agreed';
  if (STATIC_ROUTES.has(pathname)) return 'static_ok';
  if (pathname.startsWith('/prodavnica/')) return 'product_dynamic';
  if (pathname.startsWith('/product-category/')) return 'category_dynamic';
  if (pathname.startsWith('/proizvodjac/')) return 'taxonomy_proizvodjac';
  if (pathname.startsWith('/snaga/')) return 'taxonomy_snaga';
  if (pathname.startsWith('/uvoznik/')) return 'taxonomy_uvoznik';
  if (pathname.startsWith('/zemlja-porekla/')) return 'taxonomy_zemlja';
  if (pathname.startsWith('/brend/')) return 'taxonomy_brend';
  if (pathname.startsWith('/product-tag/')) return 'taxonomy_tag';
  return 'unknown';
}

function coverageFor(classification) {
  switch (classification) {
    case 'skip_agreed':
      return 'skipped';
    case 'static_ok':
    case 'product_dynamic':
    case 'category_dynamic':
    case 'taxonomy_proizvodjac':
    case 'taxonomy_snaga':
    case 'taxonomy_uvoznik':
    case 'taxonomy_zemlja':
      return 'covered';
    case 'taxonomy_brend':
    case 'taxonomy_tag':
      return 'needs_decision';
    default:
      return 'gap';
  }
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

const rows = loadBaseline();
const byClassification = {};
const byCoverage = {};
const samples = { needs_decision: {}, gap: {}, skip_agreed: {} };

for (const row of rows) {
  const pathname = pathnameFromUrl(row.url);
  if (!pathname) continue;
  const classification = classifyRoute(pathname);
  const coverage = coverageFor(classification);

  byClassification[classification] = (byClassification[classification] ?? 0) + 1;
  byCoverage[coverage] = (byCoverage[coverage] ?? 0) + 1;

  if (coverage === 'needs_decision' || coverage === 'gap' || coverage === 'skipped') {
    const bucket = samples[coverage === 'skipped' ? 'skip_agreed' : coverage];
    if (!bucket[classification]) bucket[classification] = [];
    if (bucket[classification].length < 5) bucket[classification].push(pathname);
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  source: 'docs/crawl/seo-baseline.csv',
  totalUrls: rows.length,
  byClassification,
  byCoverage,
  samples,
  nextSteps: [
    '7.10 static + dynamic route patterns inventoried (this file)',
    '7.6–7.9 crawl localhost/staging vs baseline — pending user decisions on taxonomy URLs',
    'Resolve needs_decision buckets before go-live (implement route or 301)',
  ],
};

fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2));

const md = `# SEO URL gap inventory (read-only)

Generated: ${report.generatedAt}  
Source: \`docs/crawl/seo-baseline.csv\` (${report.totalUrls} URLs)

## Coverage summary

| Coverage | Count | Meaning |
|----------|------:|---------|
${Object.entries(byCoverage)
  .sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `| ${k} | ${v} | |`)
  .join('\n')}

## By route type

| Classification | Count |
|----------------|------:|
${Object.entries(byClassification)
  .sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `| ${k} | ${v} |`)
  .join('\n')}

## Samples — needs decision (taxonomy archives)

${Object.entries(samples.needs_decision)
  .map(([k, paths]) => `### ${k}\n${paths.map((p) => `- \`${p}\``).join('\n')}`)
  .join('\n\n') || '_None_'}

## Samples — agreed skip

${Object.entries(samples.skip_agreed)
  .map(([k, paths]) => `- ${paths.join(', ')}`)
  .join('\n') || '_None_'}

## Samples — unknown gaps

${Object.entries(samples.gap)
  .map(([k, paths]) => `### ${k}\n${paths.map((p) => `- \`${p}\``).join('\n')}`)
  .join('\n\n') || '_None_'}
`;

fs.writeFileSync(OUT_MD, md);

console.log('Wrote', OUT_JSON);
console.log('Wrote', OUT_MD);
console.log('\nCoverage:', byCoverage);
console.log('\nNeeds decision:', byCoverage.needs_decision ?? 0);
