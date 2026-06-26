/**
 * Generate src/data/koncarProducts.ts from scraped JSON
 * Run: node scripts/build-koncar-products.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'scraped-clean.json'), 'utf8'));

function pseudoRating(id) {
  return (id % 5 === 0 ? 4 : 5);
}

function pseudoReviews(id) {
  return 3 + (id * 7) % 45;
}

function inferSpecs(name, category) {
  const specs = [];
  const v = name.match(/(\d+)\s*V\b/i);
  const w = name.match(/(\d+)\s*W\b/i);
  const nm = name.match(/(\d+)\s*Nm\b/i);
  const ah = name.match(/(\d+[,.]?\d*)\s*Ah/i);
  const mm = name.match(/(\d+)\s*mm/i);
  if (v) specs.push(`${v[1]}V`);
  if (w) specs.push(`${w[1]}W`);
  if (nm) specs.push(`${nm[1]} Nm`);
  if (ah) specs.push(`${ah[1]} Ah`);
  if (mm) specs.push(`${mm[1]} mm`);
  if (specs.length === 0) specs.push(category.split(' ')[0] ?? 'Standard');
  return specs.slice(0, 3);
}

function inferWeight(name, category, price) {
  const n = name.toLowerCase();
  if (n.includes('kolica') || n.includes('356kom')) return 42;
  if (n.includes('kompresor') || n.includes('agregat')) return 28;
  if (n.includes('aparat') && n.includes('varenje')) return 18;
  if (price > 80000) return 22;
  if (price > 40000) return 12;
  if (price > 15000) return 5.5;
  if (price > 5000) return 3.2;
  if (price > 1000) return 1.2;
  return 0.35;
}

const products = raw.map((p) => {
  const oldPrice = p.oldPrice
    ?? (p.categorySlug === 'ponuda' ? Math.round(p.price * 1.055) : undefined);
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    categorySlug: p.categorySlug,
    description: p.description,
    price: p.price,
    ...(oldPrice && oldPrice > p.price ? { oldPrice } : {}),
    rating: pseudoRating(p.id),
    reviews: pseudoReviews(p.id),
    image: p.image || 'https://koncarelektro.rs/wp-content/uploads/product-placeholder.jpg',
    sku: p.sku,
    inStock: p.inStock !== false,
    specs: inferSpecs(p.name, p.category),
    weightKg: p.weightKg ?? inferWeight(p.name, p.category, p.price),
  };
});

// Dodatni akcijski proizvodi iz ključnih kategorija (ako nema dovoljno ponuda)
const saleSlugs = ['elektricni-alat/busilice', 'akumulatorski-alat/akumulatorske-busilice-odvijaci', 'elektricni-alat/brusilice'];
for (const p of products) {
  if (p.oldPrice || products.filter((x) => x.oldPrice).length >= 8) continue;
  if (saleSlugs.some((s) => p.categorySlug === s || p.categorySlug.startsWith(s + '/'))) {
    p.oldPrice = Math.round(p.price * 1.08);
  }
}

const sale = products.filter((p) => p.oldPrice).slice(0, 8);
const saleIds = new Set(sale.map((p) => p.id));
const bestsellers = products.filter((p) => !saleIds.has(p.id)).slice(0, 8);

const esc = (s) => JSON.stringify(s);

const lines = products.map((p) => {
  const parts = [
    `id: ${p.id}`,
    `brand: ${esc(p.brand)}`,
    `name: ${esc(p.name)}`,
    `category: ${esc(p.category)}`,
    `categorySlug: ${esc(p.categorySlug)}`,
    `description: ${esc(p.description)}`,
    `price: ${p.price}`,
  ];
  if (p.oldPrice) parts.push(`oldPrice: ${p.oldPrice}`);
  parts.push(
    `rating: ${p.rating}`,
    `reviews: ${p.reviews}`,
    `image: ${esc(p.image)}`,
    `sku: ${esc(p.sku ?? '')}`,
    `inStock: ${p.inStock}`,
    `specs: [${p.specs.map(esc).join(', ')}]`,
    `weightKg: ${p.weightKg}`,
  );
  return `  { ${parts.join(', ')} },`;
});

const out = `/** Mock proizvodi preuzeti sa koncarelektro.rs — ${products.length} artikala iz glavnih i podkategorija */
import type { Product } from '@/data/homepage';

export type KoncarCatalogProduct = Product & {
  categorySlug: string;
  sku: string;
  inStock: boolean;
  specs: string[];
  weightKg: number;
};

export const koncarProducts: KoncarCatalogProduct[] = [
${lines.join('\n')}
];

export const getProductsByCategorySlug = (slug: string): KoncarCatalogProduct[] =>
  koncarProducts.filter(
    (p) => p.categorySlug === slug || p.categorySlug.startsWith(\`\${slug}/\`),
  );

const toBaseProduct = ({ categorySlug, sku, inStock, specs, ...rest }: KoncarCatalogProduct): Product => rest;

export const getSaleProductsFromKoncar = (): Product[] =>
  koncarProducts.filter((p) => p.oldPrice).slice(0, 8).map(toBaseProduct);

export const getBestSellerProductsFromKoncar = (): Product[] => {
  const saleIds = new Set(getSaleProductsFromKoncar().map((p) => p.id));
  return koncarProducts.filter((p) => !saleIds.has(p.id)).slice(0, 8).map(toBaseProduct);
};
`;

fs.writeFileSync(path.join(__dirname, '../src/data/koncarProducts.ts'), out, 'utf8');
console.log(`Generated ${products.length} products (${sale.length} on sale)`);
