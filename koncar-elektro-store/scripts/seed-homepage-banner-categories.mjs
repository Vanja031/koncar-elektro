/**
 * Seed homepage banner WC categories on staging (description + thumbnail).
 * Images are sideloaded into WP from public URLs (upload host or BANNER_IMAGE_BASE_URL).
 *
 * Usage:
 *   node scripts/seed-homepage-banner-categories.mjs
 *   BANNER_IMAGE_BASE_URL=https://your-vercel.app node scripts/seed-homepage-banner-categories.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv() {
  const envPath = resolve(root, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
}

loadEnv();

const BASE =
  process.env.NEXT_PUBLIC_WP_API_URL ||
  process.env.VITE_WP_API_URL ||
  'https://testing.cleannikki.com/wp-json';
const CK = process.env.WC_CONSUMER_KEY || process.env.VITE_WC_CONSUMER_KEY || '';
const CS = process.env.WC_CONSUMER_SECRET || process.env.VITE_WC_CONSUMER_SECRET || '';
const IMAGE_BASE = (process.env.BANNER_IMAGE_BASE_URL || '').replace(/\/$/, '');

if (!CK || !CS) {
  console.error('Missing WC_CONSUMER_KEY / WC_CONSUMER_SECRET in .env');
  process.exit(1);
}

const wcAuth = 'Basic ' + Buffer.from(`${CK}:${CS}`).toString('base64');

const BANNERS = [
  {
    slug: 'elektromaterijal-i-oprema',
    name: 'Elektromaterijal',
    description: 'Kablovi, prekidači, osigurači i sve što vam treba',
    imageFile: resolve(root, 'public/home-banners/elektromaterijal.webp'),
    imageName: 'elektromaterijal.webp',
  },
  {
    slug: 'rasveta',
    name: 'Rasveta',
    description: 'LED rasveta za svaki prostor i potrebu',
    imageFile: resolve(root, 'public/home-banners/rasveta.webp'),
    imageName: 'rasveta.webp',
  },
  {
    slug: 'solarna-elektrana',
    name: 'Solarne elektrane',
    description: 'Kompletna rešenja za vašu energetsku nezavisnost',
    imageFile: resolve(root, 'public/home-banners/solarne.webp'),
    imageName: 'solarne.webp',
  },
];

async function wcFetch(path, init = {}) {
  const url = `${BASE.replace(/\/$/, '')}/wc/v3${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: wcAuth,
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    throw new Error(`WC ${res.status} ${path}: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
  }
  return body;
}

/** Upload PNG to 0x0.st for one-time public sideload URL. */
async function uploadTempPublicUrl(filePath, fileName) {
  const bytes = readFileSync(filePath);
  const form = new FormData();
  form.append('file', new Blob([bytes], { type: 'image/png' }), fileName);

  const res = await fetch('https://0x0.st', { method: 'POST', body: form });
  const url = (await res.text()).trim();
  if (!res.ok || !url.startsWith('http')) {
    throw new Error(`Temp upload failed (${res.status}): ${url}`);
  }
  return url;
}

async function resolveImageSrc(banner) {
  if (IMAGE_BASE) {
    return `${IMAGE_BASE}/home-banners/${banner.imageName}`;
  }
  if (!existsSync(banner.imageFile)) {
    throw new Error(`Image not found: ${banner.imageFile}`);
  }
  console.log('  Uploading temp public URL…');
  return uploadTempPublicUrl(banner.imageFile, banner.imageName);
}

async function getCategoryBySlug(slug) {
  const rows = await wcFetch(`/products/categories?slug=${encodeURIComponent(slug)}&per_page=1`);
  return rows[0] ?? null;
}

async function main() {
  console.log('Target:', BASE);
  console.log('Image base:', IMAGE_BASE || '(temp upload per file)');

  for (const banner of BANNERS) {
    console.log(`\n— ${banner.slug} —`);
    const category = await getCategoryBySlug(banner.slug);
    if (!category) {
      console.error('  Category not found, skipping');
      continue;
    }

    const imageSrc = await resolveImageSrc(banner);
    console.log('  Image source:', imageSrc);

    const updated = await wcFetch(`/products/categories/${category.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: banner.name,
        description: banner.description,
        image: { src: imageSrc },
      }),
    });

    console.log('  OK:', updated.name);
    console.log('  Desc:', updated.description);
    console.log('  Image:', updated.image?.src ?? '(none)');
  }

  console.log('\nDone — verify Store API:');
  for (const banner of BANNERS) {
    const storeUrl = `${BASE.replace(/\/$/, '')}/wc/store/v1/products/categories?per_page=100`;
    const rows = await fetch(storeUrl).then((r) => r.json());
    const cat = rows.find((c) => c.slug === banner.slug);
    console.log(
      `  ${banner.slug}:`,
      cat?.image?.src || '(no image)',
      '|',
      (cat?.description || '').slice(0, 50),
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
