# WP plugin audit — koncarelektro.rs

**Datum:** 06.07.2026.  
**Izvor:** lista aktivnih plugina iz WP Admin (klijent).

> Live shop se ne menja — ovaj dokument služi samo za mapiranje podataka u headless frontend. Vidi [LIVE_SHOP_SAFETY.md](../LIVE_SHOP_SAFETY.md).

---

## Rezime

| Pitanje | Odgovor |
|---------|---------|
| **ACF (Advanced Custom Fields)?** | ❌ Nije instaliran — nema custom field grupa |
| **Brendovi** | Plugin **MAS Brands** + WC atribut **`Proizvodjac`** (`pa_proizvodjac`) |
| **SEO meta u API-ju** | ✅ **Yoast SEO** + WooCommerce addon — `yoast_head` u WC v3 odgovorima |
| **Compare (uporedi)** | **YITH WooCommerce Compare** — na novom sajtu kasnije (nedelja 5+) |
| **Bulk import** | WP All Import (+ WC addon) — **neaktivan** |
| **Page builder** | WPBakery + Slider Revolution — statičke stranice / hero na live temi |
| **Kontakt forme** | WPForms Lite |
| **Analytics** | Google Analytics for WooCommerce; PixelYourSite **neaktivan** |
| **GDPR** | CookieYes |
| **Cache** | LiteSpeed Cache |
| **Security** | Wordfence + Imunify — ne dirati |

---

## Aktivni plugini — relevantnost za migraciju

### E-commerce jezgro

| Plugin | Uloga | Headless |
|--------|-------|----------|
| **WooCommerce** 10.7.0 | Katalog, korpa, narudžbine | Izvor podataka preko REST / Store API |
| **Electro Extensions** | Tema Electro (widgeti, shortcodes) | Ne prenosi se — logika u Reactu |
| **MAS Brands for WooCommerce** | Brendovi na proizvodima | `/brend/` rute; API `brands` trenutno prazan — brend iz atributa `Proizvodjac` |
| **YITH WooCommerce Compare** | Uporedi proizvode | Opciono u novom UI |
| **YITH Google Product Feed Premium** | Google Shopping feed | Samo live WC, ne utiče na frontend |
| **PDF Invoices & Packing Slips** | PDF računi | Backend narudžbine, ne frontend |

### SEO i marketing

| Plugin | Headless |
|--------|----------|
| **Yoast SEO** + **Yoast SEO: WooCommerce** | `yoast_head` / meta parity (nedelja 4) |
| **Google Analytics for WooCommerce** | GA4 ecommerce (nedelja 6) |
| **PixelYourSite** (neaktivan) | Ignorisati za sada |

### Naš setup

| Plugin | Napomena |
|--------|----------|
| **Enable CORS** | Aktivan, radi na LiteSpeed (upozorenje o Apache je benigno) |

### Tema / sadržaj (live only)

| Plugin | Napomena |
|--------|----------|
| **Redux Framework** | Opcije Electro teme — ne mapiramo u API |
| **WPBakery Page Builder** | Stranice (O nama, kontakt…) — čitati preko `wp/v2/pages` |
| **Slider Revolution** | Hero na live sajtu — novi sajt ima svoj carousel |
| **Classic Editor** | Proizvodi/stranice u klasičnom editoru |
| **Loco Translate** | Prevodi stringova teme |

### Operativa (ne dirati)

| Plugin |
|--------|
| LiteSpeed Cache, Wordfence, Imunify, CookieYes, Regenerate Thumbnails |

### Neaktivni (ignorisati)

| Plugin |
|--------|
| WP All Import, WP All Import WooCommerce Add-On, PixelYourSite |

---

## WooCommerce atributi (filteri) — iz API-ja

Potvrđeno: `GET /wp-json/wc/v3/products/attributes`

| ID | Naziv | Slug |
|----|-------|------|
| 1 | Proizvodjac | `pa_proizvodjac` |
| 2 | Boja | `pa_boja` |
| 3 | Snaga (W) | `pa_snaga` |
| 4 | Energija udarca (J) | `pa_energija-udarca` |
| 5 | Precnik lista (mm) | `pa_precnik-lista` |
| 6 | Tezina | `pa_tezina` |
| 7 | Potenciometar | `pa_potenciometar` |
| 9 | Dimenzija trake (mm) | `pa_dimenzija-trake` |
| 11 | Pritisak (bar) | `pa_pritisak` |
| 12 | Konjska snaga (KS) | `pa_konjska-snaga` |
| 13 | Kapacitet baterija (Ah) | `pa_kapacitet-baterija` |
| 14 | Uvoznik | `pa_uvoznik` |
| 15 | Zemlja porekla | `pa_zemlja-porekla` |

**Brend na proizvodu (primer):** atribut `Proizvodjac` → npr. `"INGCO - SUPER INGCO"`.  
Terms endpoint: `/wc/v3/products/attributes/1/terms` (ABAC, BOSCH, …).

---

## Taksonomije i URL-ovi

| Tip | URL baza | API |
|-----|----------|-----|
| Kategorije | `/product-category/` | Store + WC v3 `products/categories` |
| Tagovi | `/product-tag/` | WC v3 |
| Brend (permalink) | `/brend/` | MAS Brands — `products/brands` prazan; koristiti `pa_proizvodjac` + mapiranje slugova |
| Atribut arhive | `/{attribute}/attribute/` | `pa_*` terms |

---

## Primer proizvoda iz API-ja

`GET /wc/v3/products?slug=noz-za-skidanje-izolacije-hpk82001-200mm-super-ingco`

- **attributes:** Proizvodjac, Uvoznik, Zemlja porekla
- **yoast_head:** prisutan (~6k chars) — za meta parity
- **weight:** često prazno na pojedinačnim artiklima — proveriti masovno pre dostave

---

## Zaključak za zadatke 3.3–3.7

| Zadatak | Status |
|---------|--------|
| 3.3 CPT/ACF | ✅ Zatvoreno — nema ACF; podaci u WC atributima + Yoast |
| 3.5 Mapiranje atributa | Spremno — 14 atributa dokumentovano |
| 3.6 Kategorije | API radi — implementacija u kodu sledi |
| 3.7 Taksonomije | Brend = `pa_proizvodjac` + `/brend/` URL; tagovi standardno |

**Nije potreban dodatni screenshot** osim ako želite ručnu proveru težine (Inventory tab) na reprezentativnom uzorku proizvoda.

---

*Povezano: [wp-headless-setup.md](../wp-headless-setup.md) · [permalink-structure.md](../permalink-structure.md)*
