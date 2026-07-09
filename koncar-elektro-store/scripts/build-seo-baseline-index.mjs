/**
 * Build compact SEO baseline index from docs/crawl/seo-baseline.csv
 * Run: npm run build:seo-index
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.resolve(__dirname, '../../docs/crawl/seo-baseline.csv');
const OUT_PATH = path.resolve(__dirname, '../src/data/seo-baseline-index.json');

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

function pathnameFromUrl(url) {
  try {
    const raw = new URL(url).pathname;
    const decoded = decodeURIComponent(raw);
    return decoded.endsWith('/') ? decoded : `${decoded}/`;
  } catch {
    return null;
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

const index = {};
let count = 0;

for (const row of loadBaseline()) {
  const pathname = pathnameFromUrl(row.url);
  if (!pathname) continue;

  const title = row.title?.trim();
  if (!title) continue;

  const entry = { t: title };
  const desc = row.meta_description?.trim();
  if (desc) entry.d = desc;
  const ogTitle = row.og_title?.trim();
  if (ogTitle && ogTitle !== title) entry.ot = ogTitle;
  const ogDesc = row.og_description?.trim();
  if (ogDesc && ogDesc !== desc) entry.od = ogDesc;

  index[pathname] = entry;
  count++;
}

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(index));

console.log(`SEO baseline index: ${count} paths → ${path.relative(process.cwd(), OUT_PATH)}`);
