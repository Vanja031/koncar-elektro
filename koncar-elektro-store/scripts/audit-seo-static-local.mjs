/**
 * Read-only meta parity check for static pages on local Next dev server.
 * Compares title + canonical from HTML vs seo-baseline.csv.
 *
 * Usage (dev server must run): npm run audit:seo-static-local
 * Env: SITE_BASE=http://localhost:3000
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.resolve(__dirname, '../../docs/crawl/seo-baseline.csv');
const OUT_PATH = path.resolve(__dirname, '../../docs/crawl/seo-static-parity-local.csv');
const SITE_BASE = (process.env.SITE_BASE ?? 'http://localhost:3000').replace(/\/$/, '');

const STATIC_PATHS = [
  '/',
  '/kontakt/',
  '/o-nama/',
  '/akcija/',
  '/proizvodi/',
  '/najprodavanije/',
  '/pretraga/',
  '/pitanja/',
  '/novosti/',
  '/lista-zelja/',
  '/uporedite/',
  '/podaci-o-firmi/',
  '/kolacici-cookies/',
  '/narucivanje/',
  '/uslovi-koriscenja/',
  '/uslovi-kupovine/',
  '/politika-privatnosti/',
  '/nacin-placanja/',
  '/nacini-isporuke/',
  '/reklamacije/',
  '/pravo-na-odustajanje/',
  '/korpa/',
  '/placanje-odjava/',
];

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

function loadBaselineMap() {
  const raw = fs.readFileSync(CSV_PATH, 'utf8').replace(/^\uFEFF/, '');
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const header = parseCsvRow(lines[0]);
  const map = new Map();
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvRow(lines[i]);
    const row = Object.fromEntries(header.map((h, idx) => [h, cols[idx] ?? '']));
    if (!row.url) continue;
    try {
      const p = new URL(row.url).pathname.replace(/\/$/, '') || '/';
      map.set(p, row);
    } catch {
      /* skip */
    }
  }
  return map;
}

function extractMeta(html) {
  const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? '';
  const canonical =
    html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] ??
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)?.[1] ??
    '';
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, '').trim() ?? '';
  return { title, canonical, h1 };
}

function normPath(p) {
  return p.replace(/\/$/, '') || '/';
}

const baseline = loadBaselineMap();
const rows = [];

for (const pathname of STATIC_PATHS) {
  const key = normPath(pathname);
  const base = baseline.get(key);
  const url = `${SITE_BASE}${pathname}`;
  let status = 'ERR';
  let title = '';
  let canonical = '';
  let h1 = '';
  let err = '';

  try {
    const res = await fetch(url, { redirect: 'follow' });
    status = String(res.status);
    const html = await res.text();
    ({ title, canonical, h1 } = extractMeta(html));
  } catch (e) {
    err = e instanceof Error ? e.message : String(e);
  }

  const issues = [];
  if (status !== '200') issues.push(`HTTP_${status}`);
  if (base?.title && title && base.title !== title) issues.push('TITLE_DIFF');
  if (!title) issues.push('NO_TITLE');
  const expectedCanonical = `https://koncarelektro.rs${key === '/' ? '/' : `${key}/`}`;
  if (canonical && canonical !== expectedCanonical) issues.push('CANONICAL_DIFF');
  if (!canonical) issues.push('NO_CANONICAL');
  if (base?.h1 && !h1) issues.push('NO_H1');
  if (err) issues.push(`FETCH_ERR:${err}`);

  rows.push({
    path: key,
    status,
    issues: issues.join('|') || 'OK',
    baseline_title: base?.title?.slice(0, 80) ?? '',
    local_title: title.slice(0, 80),
    local_canonical: canonical,
    expected_canonical: expectedCanonical,
    local_h1: h1.slice(0, 60),
    baseline_h1: base?.h1?.slice(0, 60) ?? '',
  });
}

const header = [
  'path',
  'status',
  'issues',
  'baseline_title',
  'local_title',
  'local_canonical',
  'expected_canonical',
  'local_h1',
  'baseline_h1',
];
const csv = [
  header.join(','),
  ...rows.map((r) =>
    header.map((h) => `"${String(r[h]).replace(/"/g, '""')}"`).join(','),
  ),
].join('\n');

fs.writeFileSync(OUT_PATH, csv);
console.log('Wrote', OUT_PATH);
for (const r of rows) {
  console.log(r.issues === 'OK' ? '✓' : '!', r.path, r.issues);
}
