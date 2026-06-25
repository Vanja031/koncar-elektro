/**
 * SEO Baseline Crawler — koncarelektro.rs
 *
 * Šta radi:
 *   1. Preuzima sve URL-ove iz 12 Yoast sitemap fajlova
 *   2. Za svaki URL: title, meta description, H1, canonical, OG title
 *   3. Beleži HTTP status kod
 *   4. Čuva rezultate u seo-baseline.csv (referentni snimak za parity proveru u N7)
 *
 * Pokretanje:
 *   node seo-crawler.js
 *
 * Output:
 *   ./seo-baseline.csv
 *   ./seo-baseline-errors.csv  (URL-ovi koji su pali ili imaju SEO probleme)
 *
 * Trajanje: ~30–90 min za 5000+ URL-ova (zavisi od servera)
 */

import * as fs from "fs";
import * as https from "https";
import * as http from "http";
import { parse as parseUrl } from "url";

// ─── Konfiguracija ────────────────────────────────────────────────────────────

const SITEMAPS = [
  "https://koncarelektro.rs/page-sitemap.xml",
  "https://koncarelektro.rs/product-sitemap.xml",
  "https://koncarelektro.rs/product-sitemap2.xml",
  "https://koncarelektro.rs/product-sitemap3.xml",
  "https://koncarelektro.rs/product-sitemap4.xml",
  "https://koncarelektro.rs/product-sitemap5.xml",
  "https://koncarelektro.rs/product-sitemap6.xml",
  "https://koncarelektro.rs/product_cat-sitemap.xml",
  "https://koncarelektro.rs/pa_proizvodjac-sitemap.xml",
  "https://koncarelektro.rs/pa_snaga-sitemap.xml",
  "https://koncarelektro.rs/pa_uvoznik-sitemap.xml",
  "https://koncarelektro.rs/pa_zemlja-porekla-sitemap.xml",
];

const CONCURRENCY = 5;       // Broj paralelnih zahteva (ne povećavaj previše)
const DELAY_MS = 300;        // Pauza između zahteva (ms) — da ne preoptereti server
const TIMEOUT_MS = 15000;    // Timeout po zahtevu
const OUTPUT_FILE = "./seo-baseline.csv";
const ERROR_FILE = "./seo-baseline-errors.csv";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0 Safari/537.36";

// ─── Pomoćne funkcije ─────────────────────────────────────────────────────────

function fetchText(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) return reject(new Error("Too many redirects"));

    const parsed = parseUrl(url);
    const lib = parsed.protocol === "https:" ? https : http;
    const req = lib.get(
      { ...parsed, headers: { "User-Agent": USER_AGENT } },
      (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
          const location = res.headers["location"];
          if (!location) return reject(new Error("Redirect without location"));
          const newUrl = location.startsWith("http")
            ? location
            : `${parsed.protocol}//${parsed.host}${location}`;
          res.resume();
          return resolve(fetchText(newUrl, redirectCount + 1).then(r => ({ ...r, finalUrl: newUrl })));
        }
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (d) => (body += d));
        res.on("end", () =>
          resolve({ status: res.statusCode, body, finalUrl: url })
        );
      }
    );
    req.setTimeout(TIMEOUT_MS, () => {
      req.destroy();
      reject(new Error("Timeout"));
    });
    req.on("error", reject);
  });
}

function extractSitemapUrls(xml) {
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
  return matches.map((m) => m[1].trim());
}

function extractMeta(html, url) {
  const get = (pattern) => {
    const m = html.match(pattern);
    return m ? m[1].replace(/\s+/g, " ").trim() : "";
  };

  const title = get(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaDesc = get(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i
  ) || get(/<meta[^>]+content=["']([^"']*)[^>]+name=["']description["']/i);
  const h1 = get(/<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, "");
  const canonical = get(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)/i);
  const ogTitle = get(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)/i)
    || get(/<meta[^>]+content=["']([^"']*)[^>]+property=["']og:title["']/i);
  const ogDesc = get(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)/i)
    || get(/<meta[^>]+content=["']([^"']*)[^>]+property=["']og:description["']/i);

  // Tip URL-a
  let type = "page";
  if (url.includes("/prodavnica/") && url.split("/").length > 5) type = "product";
  else if (url.includes("/product-category/")) type = "category";
  else if (url.includes("/brend/")) type = "brand";
  else if (url.includes("/pa_")) type = "attribute";

  return { title, metaDesc, h1, canonical, ogTitle, ogDesc, type };
}

function escapeCsv(val) {
  if (val === null || val === undefined) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsvRow(obj) {
  return Object.values(obj).map(escapeCsv).join(",");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Glavna logika ─────────────────────────────────────────────────────────────

async function main() {
  console.log("=== SEO Baseline Crawler — koncarelektro.rs ===\n");

  // 1. Skupi sve URL-ove iz sitemap-a
  console.log(`Preuzimam ${SITEMAPS.length} sitemap fajlova...`);
  const allUrls = [];

  for (const sitemapUrl of SITEMAPS) {
    try {
      const { body } = await fetchText(sitemapUrl);
      const urls = extractSitemapUrls(body);
      console.log(`  ✓ ${sitemapUrl.split("/").pop()} → ${urls.length} URL-ova`);
      allUrls.push(...urls);
    } catch (e) {
      console.log(`  ✗ ${sitemapUrl.split("/").pop()} → GREŠKA: ${e.message}`);
    }
  }

  const uniqueUrls = [...new Set(allUrls)];
  console.log(`\nUkupno URL-ova: ${uniqueUrls.length} (unique)\n`);

  // 2. Pripremi CSV fajlove
  const csvHeader = [
    "url", "type", "status", "final_url",
    "title", "meta_description", "h1",
    "canonical", "canonical_match",
    "og_title", "og_description",
    "title_length", "meta_desc_length",
    "issues",
  ].join(",");

  fs.writeFileSync(OUTPUT_FILE, csvHeader + "\n", "utf8");
  fs.writeFileSync(ERROR_FILE, csvHeader + "\n", "utf8");

  // 3. Crawluj sve URL-ove
  let done = 0;
  let errors = 0;

  async function processUrl(url) {
    try {
      const { status, body, finalUrl } = await fetchText(url);
      const meta = extractMeta(body, url);

      const issues = [];
      if (!meta.title) issues.push("NO_TITLE");
      else if (meta.title.length > 60) issues.push("TITLE_TOO_LONG");
      else if (meta.title.length < 10) issues.push("TITLE_TOO_SHORT");

      if (!meta.metaDesc) issues.push("NO_META_DESC");
      else if (meta.metaDesc.length > 160) issues.push("META_DESC_TOO_LONG");

      if (!meta.h1) issues.push("NO_H1");

      const canonicalMatch =
        !meta.canonical || meta.canonical === url || meta.canonical === finalUrl
          ? "OK"
          : "MISMATCH";
      if (canonicalMatch === "MISMATCH") issues.push("CANONICAL_MISMATCH");

      const row = {
        url,
        type: meta.type,
        status,
        final_url: finalUrl !== url ? finalUrl : "",
        title: meta.title,
        meta_description: meta.metaDesc,
        h1: meta.h1,
        canonical: meta.canonical,
        canonical_match: canonicalMatch,
        og_title: meta.ogTitle,
        og_description: meta.ogDesc,
        title_length: meta.title.length,
        meta_desc_length: meta.metaDesc.length,
        issues: issues.join("|"),
      };

      const csvRow = toCsvRow(row) + "\n";
      fs.appendFileSync(OUTPUT_FILE, csvRow, "utf8");

      if (issues.length > 0 || status !== 200) {
        fs.appendFileSync(ERROR_FILE, csvRow, "utf8");
        errors++;
      }
    } catch (e) {
      const row = {
        url, type: "", status: "ERROR", final_url: "",
        title: "", meta_description: "", h1: "",
        canonical: "", canonical_match: "",
        og_title: "", og_description: "",
        title_length: 0, meta_desc_length: 0,
        issues: `FETCH_ERROR: ${e.message}`,
      };
      fs.appendFileSync(OUTPUT_FILE, toCsvRow(row) + "\n", "utf8");
      fs.appendFileSync(ERROR_FILE, toCsvRow(row) + "\n", "utf8");
      errors++;
    }

    done++;
    if (done % 50 === 0 || done === uniqueUrls.length) {
      const pct = ((done / uniqueUrls.length) * 100).toFixed(1);
      process.stdout.write(`\r  Napredak: ${done}/${uniqueUrls.length} (${pct}%) — greške: ${errors}  `);
    }
  }

  console.log("Crawlovanje u toku...\n");

  // Concurrency kontrola
  for (let i = 0; i < uniqueUrls.length; i += CONCURRENCY) {
    const batch = uniqueUrls.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(processUrl));
    await sleep(DELAY_MS);
  }

  console.log(`\n\n=== ZAVRŠENO ===`);
  console.log(`  Ukupno URL-ova:   ${uniqueUrls.length}`);
  console.log(`  Sa greškama/issues: ${errors}`);
  console.log(`  Output:           ${OUTPUT_FILE}`);
  console.log(`  Greške:           ${ERROR_FILE}`);
  console.log(`\nSačuvaj seo-baseline.csv — ovo je referentni snimak za SEO parity proveru u Nedelji 7.`);
}

main().catch(console.error);
