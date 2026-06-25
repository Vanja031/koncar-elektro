# Permalink struktura — koncarelektro.rs (WooCommerce)

**Izvor:** WP Admin → Settings → Permalinks  
**Datum:** 22.06.2026.

---

## Blog / stranice (Posts)

| Tip | Struktura | Primer |
|-----|-----------|--------|
| Post (blog) | `/{postname}/` | `koncarelektro.rs/naziv-clanka/` |

Podešeno: **Naziv članka** (samo slug, bez datuma).

---

## WooCommerce — Kategorije i tagovi

| Tip | Baza | Primer URL-a |
|-----|------|-------------|
| Kategorija proizvoda | `/product-category/` | `koncarelektro.rs/product-category/rucni-alat/` |
| Tag proizvoda | `/product-tag/` | `koncarelektro.rs/product-tag/ingco/` |
| Brend proizvoda | `/brend/` | `koncarelektro.rs/brend/bosch/` |
| Atribut proizvoda | `/{attribute-name}/attribute/` | taksonomija atributa |

---

## WooCommerce — Proizvodi

Podešeno: **Prilagođena baza** `/prodavnica/%product_cat%/`

| Format | Primer |
|--------|--------|
| `/prodavnica/[kategorija]/[slug-proizvoda]/` | `koncarelektro.rs/prodavnica/rucni-alat/naziv-proizvoda/` |
| Sa podkategorijom | `koncarelektro.rs/prodavnica/kosacice-i-trimeri-dobra/elektricne-kosacice/ingco-kosacica-elektricna-lm321/` |

> **Potvrđeno sa live sajta (homepage):**  
> `koncarelektro.rs/prodavnica/kosacice-i-trimeri-dobra/elektricne-kosacice/ingco-kosacica-elektricna-lm321/`  
> `koncarelektro.rs/prodavnica/elektricni-alat/cepac-za-drva-hl730-7t-scheppach/`  
> `koncarelektro.rs/prodavnica/pumpe-za-vodu/potopna-pumpa-za-cistu-vodu-rd-wp41-1-40l-min-60m-raider/`

---

## Zaključak za Next.js routing (zadatak 2.7)

Sledeće rute moraju biti implementirane u Next.js App Router:

```
/prodavnica/[...slug]/          → proizvodi (sa ugneždenim kategorijama)
/product-category/[...slug]/   → kategorije
/product-tag/[slug]/           → tagovi
/brend/[slug]/                 → brendovi
/[slug]/                       → blog postovi i statičke stranice
```

> **Napomena:** `/prodavnica/%product_cat%/` znači da putanja može imati više nivoa
> kategorija (npr. `prodavnica/kat/podkat/slug`). Next.js catch-all ruta `[...slug]` to pokriva.
