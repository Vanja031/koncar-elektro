# Sitemap status — koncarelektro.rs

**Datum provere:** 22.06.2026.

## Status: RADI ✓ (u browseru)

`koncarelektro.rs/sitemap_index.xml` je dostupan i sadrži **12 sitemap fajlova** (Yoast SEO).

> Robots.txt ima `http://` umesto `https://` za sitemap adresu — treba ispraviti u Yoast podešavanjima,
> ali to ne utiče na funkcionalnost sitemap-a.

## Sadržaj sitemap_index.xml

| Sitemap | Last Modified | Tip |
|---------|---------------|-----|
| `page-sitemap.xml` | 2026-06-16 | Statičke stranice |
| `product-sitemap.xml` | 2026-06-22 | Proizvodi (1/6) |
| `product-sitemap2.xml` | 2024-03-12 | Proizvodi (2/6) |
| `product-sitemap3.xml` | 2025-03-28 | Proizvodi (3/6) |
| `product-sitemap4.xml` | 2025-11-20 | Proizvodi (4/6) |
| `product-sitemap5.xml` | 2026-06-10 | Proizvodi (5/6) |
| `product-sitemap6.xml` | 2026-06-22 | Proizvodi (6/6) |
| `product_cat-sitemap.xml` | 2026-06-22 | Kategorije proizvoda |
| `pa_proizvodjac-sitemap.xml` | 2026-06-22 | Atribut: Proizvođač |
| `pa_snaga-sitemap.xml` | 2026-06-04 | Atribut: Snaga |
| `pa_uvoznik-sitemap.xml` | 2026-06-22 | Atribut: Uvoznik |
| `pa_zemlja-porekla-sitemap.xml` | 2026-06-22 | Atribut: Zemlja porekla |

**6 product sitemapa** → procena ~5.000–6.000 proizvoda (Yoast generiše max 1.000/fajl).

## Napomena o automatskom fetchingu

Server blokira automatske HTTP zahteve (Cloudflare WAF) — sitemapovi su dostupni samo iz browsera.
URL inventar se prikuplja lokalnom Node.js skriptom ([crawl/seo-crawler.js](./crawl/seo-crawler.js)).

## Sitemap http → https (sitnica za popraviti)

U Yoast SEO → Settings → Site features, regeneriši sitemap da adresa postane `https://`.
