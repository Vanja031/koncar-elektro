/**
 * Compress static images in src/assets and public/home-banners.
 * Large PNG/JPG → WebP (keeps originals only when conversion is skipped).
 *
 * Usage: node scripts/compress-static-assets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

/** @type {{ file: string; maxWidth?: number; quality?: number; toWebp?: boolean }[]} */
const TARGETS = [
  // Hero carousel (LCP)
  { file: 'src/assets/c1-1.png', maxWidth: 1920, quality: 85, toWebp: true },
  { file: 'src/assets/c1-2.png', maxWidth: 1920, quality: 85, toWebp: true },
  { file: 'src/assets/c2-1.png', maxWidth: 1920, quality: 85, toWebp: true },
  { file: 'src/assets/c2-2.png', maxWidth: 1920, quality: 85, toWebp: true },
  // Trust / promo blocks
  { file: 'src/assets/agent-avatar.png', maxWidth: 1024, quality: 85, toWebp: true },
  { file: 'src/assets/van.png', maxWidth: 1024, quality: 85, toWebp: true },
  { file: 'src/assets/garancija-badge.png', maxWidth: 1024, quality: 85, toWebp: true },
  { file: 'src/assets/hero-expert.png', maxWidth: 1200, quality: 85, toWebp: true },
  // Catalog hero
  { file: 'src/assets/breadcrumbs.png', maxWidth: 2172, quality: 82, toWebp: true },
  // Homepage category banners
  { file: 'src/assets/rasveta.png', maxWidth: 1200, quality: 85, toWebp: true },
  { file: 'src/assets/elektromaterijal.png', maxWidth: 800, quality: 85, toWebp: true },
  { file: 'src/assets/solarne.png', maxWidth: 800, quality: 85, toWebp: true },
  { file: 'src/assets/prefesionalni-alati.png', maxWidth: 800, quality: 85, toWebp: true },
  // Category / nav thumbnails
  { file: 'src/assets/aku-alat.png', maxWidth: 600, quality: 85, toWebp: true },
  { file: 'src/assets/elektricni-alat.png', maxWidth: 600, quality: 85, toWebp: true },
  { file: 'src/assets/rucni-alat.png', maxWidth: 600, quality: 85, toWebp: true },
  { file: 'src/assets/kompresor.png', maxWidth: 600, quality: 85, toWebp: true },
  { file: 'src/assets/kosacica.png', maxWidth: 600, quality: 85, toWebp: true },
  { file: 'src/assets/htz-oprema.png', maxWidth: 600, quality: 85, toWebp: true },
  { file: 'src/assets/traktor.png', maxWidth: 600, quality: 85, toWebp: true },
  { file: 'src/assets/aparat-za-varenje.png', maxWidth: 600, quality: 85, toWebp: true },
  { file: 'src/assets/oprema-za-dvoriste.png', maxWidth: 600, quality: 85, toWebp: true },
  // Logo
  { file: 'src/assets/koncar.png', maxWidth: 512, quality: 90, toWebp: true },
  // WP seed copies in public/
  { file: 'public/home-banners/rasveta.png', maxWidth: 1200, quality: 85, toWebp: true },
  { file: 'public/home-banners/elektromaterijal.png', maxWidth: 800, quality: 85, toWebp: true },
  { file: 'public/home-banners/solarne.png', maxWidth: 800, quality: 85, toWebp: true },
];

async function optimizePngInPlace(absPath) {
  const before = fs.statSync(absPath).size;
  const tmp = `${absPath}.tmp`;
  await sharp(absPath)
    .png({ compressionLevel: 9, adaptiveFiltering: true, palette: false })
    .toFile(tmp);
  const after = fs.statSync(tmp).size;
  if (after < before) {
    fs.renameSync(tmp, absPath);
    return { before, after, action: 'png-optimize' };
  }
  fs.unlinkSync(tmp);
  return { before, after: before, action: 'skip' };
}

async function convertToWebp(absPath, { maxWidth, quality }) {
  const before = fs.statSync(absPath).size;
  const webpPath = absPath.replace(/\.(png|jpe?g)$/i, '.webp');
  let pipeline = sharp(absPath);
  if (maxWidth) {
    pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
  }
  await pipeline.webp({ quality, effort: 6 }).toFile(webpPath);
  const after = fs.statSync(webpPath).size;
  return { before, after, webpPath, action: 'webp' };
}

async function main() {
  const rows = [];
  let saved = 0;

  for (const target of TARGETS) {
    const abs = path.join(root, target.file);
    if (!fs.existsSync(abs)) {
      console.warn(`skip (missing): ${target.file}`);
      continue;
    }

    if (target.toWebp) {
      const result = await convertToWebp(abs, target);
      rows.push({ file: target.file, ...result });
      if (result.after < result.before) {
        fs.unlinkSync(abs);
        saved += result.before - result.after;
      }
    } else {
      const result = await optimizePngInPlace(abs);
      rows.push({ file: target.file, ...result });
      if (result.after < result.before) saved += result.before - result.after;
    }
  }

  // Light pass on payment / social icons (PNG only, in-place)
  const iconDir = path.join(root, 'src/assets/payments');
  if (fs.existsSync(iconDir)) {
    for (const name of fs.readdirSync(iconDir)) {
      if (!/\.png$/i.test(name)) continue;
      const abs = path.join(iconDir, name);
      const before = fs.statSync(abs).size;
      if (before < 80 * 1024) {
        const result = await optimizePngInPlace(abs);
        rows.push({ file: `src/assets/payments/${name}`, ...result });
        if (result.after < result.before) saved += result.before - result.after;
      }
    }
  }

  console.log('\nCompressed static assets:\n');
  for (const row of rows) {
    const beforeKb = Math.round(row.before / 1024);
    const afterKb = Math.round(row.after / 1024);
    const pct = row.before ? Math.round((1 - row.after / row.before) * 100) : 0;
    const out = row.webpPath ? path.relative(root, row.webpPath) : row.file;
    console.log(
      `${row.file.padEnd(42)} ${String(beforeKb).padStart(5)} KB → ${String(afterKb).padStart(5)} KB (${pct}%)  [${row.action}] → ${out}`,
    );
  }

  console.log(`\nTotal saved: ~${Math.round(saved / 1024)} KB (${(saved / 1024 / 1024).toFixed(1)} MB)\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
