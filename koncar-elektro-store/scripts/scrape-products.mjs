/**
 * Scrape 3-5 products per category from koncarelektro.rs
 * Run: node scripts/scrape-products.mjs
 */

const CATEGORIES = [
  // Main + subcategories (product-category slugs)
  'ponuda',
  'aparati-za-varenje',
  'aparati-za-varenje/inverterski-aparati',
  'aparati-za-varenje/tig-aparati',
  'aparati-za-varenje/mig-mag-aparati',
  'aparati-za-varenje/plazma-aparati-za-secenje',
  'elektricni-alat',
  'elektricni-alat/busilice',
  'elektricni-alat/cekic-busilice-i-stemarice',
  'elektricni-alat/brusilice',
  'elektricni-alat/testere-i-cirkulari',
  'elektricni-alat/usisivaci',
  'elektricni-alat/peraci',
  'rucni-alat',
  'rucni-alat/klesta',
  'rucni-alat/setovi-alata-i-kljuceva',
  'rucni-alat/odvijaci-i-zavrtaci',
  'rucni-alat-i-pribor/torbe-i-nosaci-alata',
  'akumulatorski-alat',
  'akumulatorski-alat/akumulatorske-busilice-odvijaci',
  'akumulatorski-alat/akumulatorske-brusilice',
  'akumulatorski-alat/akumulatorski-setovi',
  'agregati',
  'agregati/benzinski-agregati',
  'agregati/inverterski-agregati',
  'kompresori-i-pneumatski-alati',
  'kompresori-i-pneumatski-alati/pneumatski-alati-i-pribor',
  'kosacice-i-trimeri',
  'kosacice-i-trimeri/benzinski-trimeri',
  'kosacice-i-trimeri/benzinske-kosacice',
  'kosacice-i-trimeri/elektricne-kosacice',
  'poljoprivredni-alati-i-oprema',
  'pumpe-za-vodu',
  'pumpe-za-vodu/hidrofori',
  'htz-oprema',
  'htz-oprema/radne-rukavice',
  'oprema-za-dvoriste',
  'elektromaterijal-i-oprema',
  'elektromaterijal-i-oprema/elektro-oprema',
  'elektromaterijal-i-oprema/instalaciona-oprema',
  'elektromaterijal-i-oprema/automatika-i-kontrola',
  'razvodni-ormani-i-table/plasticni-razvodne-table',
  'razvodni-ormani-i-table/metalni-razvodni-ormani',
  'kablovi-i-provodnici/pp-l',
  'kablovi-i-provodnici/n2xh',
  'rasveta/sijalice',
  'rasveta/unutrasnja-rasveta/led-paneli',
  'rasveta/unutrasnja-rasveta/lusteri',
  'rasveta',
  'rasveta/spoljna-rasveta',
  'rasveta/led-reflektori',
  'elektromaterijal-i-oprema/merni-instrumenti',
];

const PER_CATEGORY = 4;
const BASE = 'https://koncarelektro.rs/product-category';

const KNOWN_BRANDS = [
  'SUPER INGCO', 'INGCO', 'MAKITA', 'BOSCH', 'Bosch', 'METABO', 'Metabo',
  'HYUNDAI', 'HUGONG', 'Scheppach', 'CEDRUS', 'DOLOMITE', 'KASEI', 'RAIDER',
  'GRAPHITE', 'FERM', 'DeWALT', 'EINHELL', 'Villager', 'HIKOKI', 'MILWAUKEE',
  'ELMARK', 'WILO', 'ESAB', 'HONDA', 'ABAC',
];

function parsePrice(text) {
  const nums = text.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.');
  const val = parseFloat(nums);
  return Number.isFinite(val) ? Math.round(val) : 0;
}

function extractBrand(name) {
  for (const b of KNOWN_BRANDS.sort((a, b) => b.length - a.length)) {
    if (name.toUpperCase().includes(b.toUpperCase())) return b.replace('SUPER INGCO', 'INGCO');
  }
  const words = name.split(/\s+/);
  return words[0] ?? 'Ostalo';
}

function parseProducts(html, categorySlug) {
  const products = [];
  const liRegex = /<li class="product type-product[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
  let m;
  while ((m = liRegex.exec(html)) !== null && products.length < PER_CATEGORY) {
    const block = m[0];
    const titleMatch = block.match(/<h2 class="woocommerce-loop-product__title">\s*<a[^>]*>([^<]+)<\/a>/i)
      ?? block.match(/woocommerce-loop-product__title[^>]*>([^<]+)</i);
    if (!titleMatch) continue;

    const name = titleMatch[1].trim();
    const imgMatch = block.match(/src="([^"]+wp-content\/uploads[^"]+)"/i);
    const image = imgMatch?.[1]?.replace(/-\d+x\d+\./, '.') ?? '';

    const priceBlock = block.match(/<span class="price">([\s\S]*?)<\/span>\s*<div class="add-to-cart-wrap"/i)?.[1]
      ?? block.match(/<span class="price">([\s\S]*?)<\/span>/i)?.[1]
      ?? '';
    const amounts = [...priceBlock.matchAll(/<bdi>([\d.,]+)/gi)].map((x) => x[1]);
    const hasDel = priceBlock.includes('<del');
    const price = parsePrice(amounts[0] ?? '0');
    const oldPrice = hasDel && amounts[1] ? parsePrice(amounts[1]) : undefined;

    const catMatch = block.match(/loop-product-categories[^>]*>([\s\S]*?)<\/span>/i);
    const subCat = catMatch?.[1]?.match(/rel="tag">([^<]+)</g)?.map((x) => x.replace(/.*>/, '').replace(/<.*/, '')) ?? [];
    const leafCat = subCat.find((c) => c !== 'Ponuda' && c !== 'Akcija' && !c.includes('Ads')) ?? categorySlug.split('/').pop()?.replace(/-/g, ' ') ?? '';

    const skuMatch = block.match(/Šifra:\s*(\d+|n\/a)/i);

    products.push({
      name,
      brand: extractBrand(name),
      category: leafCat,
      categorySlug,
      description: name,
      price,
      oldPrice: oldPrice && oldPrice > price ? oldPrice : undefined,
      image,
      sku: skuMatch?.[1] !== 'n/a' ? skuMatch?.[1] : undefined,
      inStock: !block.includes('outofstock'),
    });
  }
  return products;
}

async function fetchCategory(slug) {
  const url = `${BASE}/${slug}/`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; KoncarStoreBot/1.0)' },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    if (!html.includes('type-product')) return [];
    return parseProducts(html, slug);
  } catch {
    return [];
  }
}

async function main() {
  const fs = await import('fs');
  const all = [];
  const seen = new Set();

  for (const slug of CATEGORIES) {
    const items = await fetchCategory(slug);
    for (const p of items) {
      const key = p.name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      all.push({ ...p, id: all.length + 1 });
    }
    process.stderr.write(`${slug}: ${items.length}\n`);
    await new Promise((r) => setTimeout(r, 300));
  }

  fs.writeFileSync(new URL('./scraped-clean.json', import.meta.url), JSON.stringify(all, null, 2), 'utf8');
  process.stderr.write(`\nTotal unique: ${all.length}\n`);
}

main();
