/**
 * Probe WordPress / WooCommerce API endpoints on koncarelektro.rs.
 * Run: npm run probe:wp-api
 *
 * Optional env (for WC v3): VITE_WC_CONSUMER_KEY, VITE_WC_CONSUMER_SECRET
 */
const BASE = process.env.VITE_WP_API_URL ?? 'https://koncarelektro.rs/wp-json';
const CK = process.env.VITE_WC_CONSUMER_KEY ?? '';
const CS = process.env.VITE_WC_CONSUMER_SECRET ?? '';

const endpoints = [
  { name: 'WP discovery', path: '/', auth: false },
  { name: 'WP pages', path: '/wp/v2/pages?per_page=1', auth: false },
  { name: 'Store products', path: '/wc/store/v1/products?per_page=1', auth: false },
  { name: 'Store categories', path: '/wc/store/v1/products/categories?per_page=1', auth: false },
  { name: 'WC v3 products', path: '/wc/v3/products?per_page=1', auth: true },
  { name: 'WC v3 categories', path: '/wc/v3/products/categories?per_page=1', auth: true },
];

function authHeader() {
  const token = Buffer.from(`${CK}:${CS}`).toString('base64');
  return { Authorization: `Basic ${token}` };
}

async function probe({ name, path, auth }) {
  const url = `${BASE.replace(/\/$/, '')}${path}`;
  const headers = auth && CK && CS ? authHeader() : {};
  try {
    const res = await fetch(url, { headers });
    const status = res.status;
    let sample = '';
    if (res.ok) {
      const json = await res.json();
      sample = Array.isArray(json)
        ? `array[${json.length}] first: ${json[0]?.slug ?? json[0]?.name ?? '—'}`
        : `keys: ${Object.keys(json).slice(0, 5).join(', ')}`;
    }
    const icon = res.ok ? '✅' : auth && status === 401 ? '🔒' : '❌';
    console.log(`${icon} ${name}: ${status} — ${sample || res.statusText}`);
    return res.ok;
  } catch (err) {
    console.log(`❌ ${name}: ${err.message}`);
    return false;
  }
}

console.log(`Probing ${BASE}\n`);
if (!CK) console.log('(WC v3 tests expect 401 without VITE_WC_CONSUMER_KEY/SECRET)\n');

let ok = 0;
for (const ep of endpoints) {
  if (await probe(ep)) ok++;
}
console.log(`\n${ok}/${endpoints.length} endpoints OK`);
process.exit(ok >= 4 ? 0 : 1);
