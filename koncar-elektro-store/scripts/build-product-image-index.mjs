/**
 * Product path → image URLs for the shop sitemap.
 * Reads the public WooCommerce Store API. On any failure, keeps the last
 * good src/data/product-image-index.json so `npm run build` still succeeds.
 *
 * Run: node scripts/build-product-image-index.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.resolve(__dirname, '../src/data/product-image-index.json');
const API_URL = (
  process.env.WC_STORE_API_URL ?? 'https://cms.koncarelektro.rs/wp-json/wc/store/v1/products'
).replace(/\/$/, '');
const PER_PAGE = 100;
const MAX_IMAGES = 8;
const PAGE_TIMEOUT_MS = 30000;

function pathnameFromPermalink(permalink) {
  try {
    const raw = new URL(permalink).pathname;
    const decoded = decodeURIComponent(raw);
    if (decoded === '/') return '/';
    return decoded.endsWith('/') ? decoded : `${decoded}/`;
  } catch {
    return null;
  }
}

function imagesFromProduct(product) {
  const seen = new Set();
  const urls = [];
  for (const image of product.images ?? []) {
    const src = typeof image?.src === 'string' ? image.src.trim() : '';
    if (!src.startsWith('https://') || seen.has(src)) continue;
    seen.add(src);
    urls.push(src);
    if (urls.length >= MAX_IMAGES) break;
  }
  return urls;
}

async function fetchPage(page) {
  const url = `${API_URL}?per_page=${PER_PAGE}&page=${page}&orderby=id&order=asc`;
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'koncar-image-index' },
    signal: AbortSignal.timeout(PAGE_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Store API page ${page} returned ${response.status}`);
  }
  const products = await response.json();
  if (!Array.isArray(products)) {
    throw new Error(`Store API page ${page} was not a list`);
  }
  const totalPages = Number(response.headers.get('x-wp-totalpages') || '1');
  if (!Number.isFinite(totalPages) || totalPages < 1) {
    throw new Error('Store API did not return X-WP-TotalPages');
  }
  return { products, totalPages };
}

async function fetchAll() {
  const first = await fetchPage(1);
  const index = {};
  const collect = (products) => {
    for (const product of products) {
      const pathname = pathnameFromPermalink(product?.permalink);
      if (!pathname?.startsWith('/prodavnica/')) continue;
      const images = imagesFromProduct(product);
      if (images.length > 0) index[pathname] = images;
    }
  };
  collect(first.products);

  const pages = [];
  for (let page = 2; page <= first.totalPages; page += 1) pages.push(page);
  const concurrency = 4;
  for (let i = 0; i < pages.length; i += concurrency) {
    const batch = pages.slice(i, i + concurrency);
    const results = await Promise.all(batch.map((page) => fetchPage(page)));
    for (const result of results) collect(result.products);
  }
  return index;
}

function ensureFile() {
  if (!fs.existsSync(OUT_PATH)) {
    fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
    fs.writeFileSync(OUT_PATH, '{}\n');
  }
}

function writeIndex(index) {
  const ordered = Object.fromEntries(
    Object.keys(index)
      .sort()
      .map((key) => [key, index[key]]),
  );
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  const tmp = `${OUT_PATH}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(ordered)}\n`);
  fs.renameSync(tmp, OUT_PATH);
  return Object.keys(ordered).length;
}

try {
  const index = await fetchAll();
  const count = Object.keys(index).length;
  if (count === 0) {
    console.warn('Product image index: API returned no products; keeping the existing file.');
    ensureFile();
  } else {
    writeIndex(index);
    console.log(`Product image index: ${count} products → ${path.relative(process.cwd(), OUT_PATH)}`);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`Product image index refresh failed (${message}); keeping the existing file.`);
  ensureFile();
}
