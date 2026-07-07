/**
 * Audits WC category + product slug paths against app route conventions.
 * Run: npm run audit:wc-slugs (dev server proxy or WC_API_BASE)
 */
const BASE = process.env.WC_API_BASE ?? 'http://localhost:8080/wp-json/wc/store/v1';

const INTERNAL_TO_WC = {
  'aku-alat': 'akumulatorski-alat',
  'kosacice-i-trimeri': 'kosacice-i-trimeri-dobra',
  'rucni-alat': 'rucni-alat-i-pribor',
  kompresori: 'kompresori-i-pneumatski-alati',
  'poljoprivredni-program': 'poljoprivredni-alati-i-oprema',
  'potrosni-materijal': 'pribor',
  elektromaterijal: 'elektromaterijal-i-oprema',
  solarne: 'solarna-elektrana',
};

const toWc = (s) => INTERNAL_TO_WC[s] ?? s;

async function fetchPaginated(path, perPage = 100, maxPages = 10) {
  const all = [];
  for (let page = 1; page <= maxPages; page++) {
    const res = await fetch(`${BASE}${path}?per_page=${perPage}&page=${page}`);
    if (!res.ok) throw new Error(`${path} HTTP ${res.status}`);
    const batch = await res.json();
    if (!batch.length) break;
    all.push(...batch);
    const totalPages = Number(res.headers.get('X-WP-TotalPages') ?? 1);
    if (page >= totalPages) break;
  }
  return all;
}

function categoryPath(cat, byId) {
  const segments = [cat.slug];
  let parentId = cat.parent;
  while (parentId) {
    const parent = byId[parentId];
    if (!parent) break;
    segments.unshift(parent.slug);
    parentId = parent.parent;
  }
  return `/product-category/${segments.join('/')}/`;
}

function prodavnicaPath(product) {
  const match = product.permalink?.match(/\/prodavnica\/(.+)\/[^/]+\/?$/);
  if (match) return `/prodavnica/${match[1].replace(/\/$/, '')}/${product.slug}/`;
  return null;
}

const categories = await fetchPaginated('/products/categories');
const byId = Object.fromEntries(categories.map((c) => [c.id, c]));

const categoryPaths = categories
  .filter((c) => c.count > 0)
  .map((c) => categoryPath(c, byId));

const uniqueCategoryPaths = [...new Set(categoryPaths)].sort();

console.log('\nWC slug audit\n');
console.log(`Categories with products: ${uniqueCategoryPaths.length}`);

const products = await fetchPaginated('/products', 100, 5);
const prodPaths = products.map(prodavnicaPath).filter(Boolean);
const uniqueProdPaths = [...new Set(prodPaths)];

console.log(`Product sample (${products.length}): ${uniqueProdPaths.length} unique prodavnica paths`);

const internalRemapHits = Object.entries(INTERNAL_TO_WC).filter(([, wc]) =>
  categories.some((c) => c.slug === wc),
);
console.log(`\nInternal→WC remap entries verified: ${internalRemapHits.length}/${Object.keys(INTERNAL_TO_WC).length}`);

const unmappedParents = categories
  .filter((c) => c.parent === 0 && c.count > 0)
  .map((c) => c.slug)
  .sort();

console.log('\nTop-level WC categories with products:');
unmappedParents.forEach((s) => console.log(`  • ${s}`));

console.log('\nSample category URLs (first 8):');
uniqueCategoryPaths.slice(0, 8).forEach((p) => console.log(`  ${p}`));

console.log('\nSample product URLs (first 5):');
uniqueProdPaths.slice(0, 5).forEach((p) => console.log(`  ${p}`));

console.log('\nApp routing: /product-category/* → ProductsPage, /prodavnica/* → ProductPage');
console.log('Slug parity: product.slug + category path from WC permalink (no app-side slug rewrite).\n');
