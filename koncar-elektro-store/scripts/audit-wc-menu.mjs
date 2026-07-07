/**
 * Verifies mega-menu parent slug mappings against live WC Store API.
 * Run: npm run audit:wc-menu (dev server or CORS must allow reads)
 */
const BASE = process.env.WC_API_BASE ?? 'http://localhost:8080/wp-json/wc/store/v1';

const MEGA = {
  'elektricni-alati': 'elektricni-alat',
  'aku-alati': 'aku-alat',
  'rucni-alati': 'rucni-alat',
  'pneumatski-alati': 'kompresori',
  'merna-oprema': 'merna-oprema',
  'radna-oprema': 'htz-oprema',
  'masine-oprema': 'agregati',
  'potrosni-materijal': 'potrosni-materijal',
  'bastenski-alati': 'kosacice-i-trimeri',
  elektromaterijal: 'elektromaterijal',
  rasveta: 'rasveta',
  solarne: 'solarne',
};

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

const WC_CHILD_SLUGS = {
  'merna-oprema': ['laseri', 'daljinomeri', 'detektori'],
};

const toWc = (s) => INTERNAL_TO_WC[s] ?? s;

async function fetchAllCategories() {
  const all = [];
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(`${BASE}/products/categories?per_page=100&page=${page}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const batch = await res.json();
    if (!batch.length) break;
    all.push(...batch);
  }
  return all;
}

const all = await fetchAllCategories();
const bySlug = Object.fromEntries(all.map((c) => [c.slug, c]));

let issues = 0;

console.log('\nMega menu parent audit\n');

for (const [id, internal] of Object.entries(MEGA)) {
  const childSlugs = WC_CHILD_SLUGS[id];
  if (childSlugs) {
    const missing = childSlugs.filter((s) => !bySlug[s]);
    if (missing.length) {
      console.log('WARN', id, 'wcChildSlugs missing:', missing.join(', '));
      issues++;
    } else {
      console.log('OK  ', id, '→ wcChildSlugs', childSlugs.length);
    }
    continue;
  }

  const wc = toWc(internal);
  const parent = bySlug[wc];
  if (!parent) {
    console.log('MISS', id, '→', wc);
    issues++;
    continue;
  }
  const children = all.filter((c) => c.parent === parent.id);
  console.log('OK  ', id, '→', wc, `(${children.length} children, ${parent.count} products)`);
}

console.log(issues ? `\n${issues} issue(s) found.\n` : '\nAll mapped parents OK.\n');
process.exit(issues ? 1 : 0);
