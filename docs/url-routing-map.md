# URL routing map — Končar Elektro

**Datum:** 26.06.2026.  
**Izvor istine:** [permalink-structure.md](./permalink-structure.md), crawl [crawl/seo-baseline.csv](./crawl/seo-baseline.csv)  
**Implementacija:** `koncar-elektro-store/src/App.tsx`, `src/lib/catalogUrls.ts`

---

## Princip

**Kanonske putanje = identične starom WooCommerce sajtu.**  
Nema promene URL-ova pri lansiranju (strategija S1/S4 iz `PLAN_TRACKER.md`).

Privremene dev putanje (`/kategorija/…`, `/proizvod/…`) ostaju kao **client-side redirect** u React aplikaciji za staging linkove.

---

## Mapa ruta

| Tip stranice | Kanonska putanja (stari sajt) | React komponenta | Napomena |
|--------------|-------------------------------|------------------|----------|
| Početna | `/` | `Index` | |
| Prodavnica (alati hub) | `/proizvodi/` | `CategoryPage` (alati) | Postojeća WP stranica, ne `/product-category/` |
| Kategorija proizvoda | `/product-category/[...slug]/` | `ProductCategoryRoute` → `ProductsPage` / `CategoryPage` | Catch-all, 1–N segmenata |
| Proizvod | `/prodavnica/[...kategorija]/[slug]/` | `ProductPage` | Poslednji segment = slug proizvoda |
| Akcija | `/akcija/` | `SalePage` | Potvrđeno u crawl-u |
| O nama | `/o-nama/` | `AboutPage` | |
| Kontakt | `/kontakt/` | `ContactPage` | |
| FAQ | `/pitanja` | `FaqPage` | Nema zasebne stranice na starom sajtu — nova ruta |
| Korpa | `/korpa/` | `CartPage` | WooCommerce cart (WP page) |
| Checkout | `/placanje-odjava/` | `CheckoutPage` | WP: „Plaćanje / Odjava”; `/placanje/` → 301 |
| Potvrda | `/placanje-odjava/order-received/` | `OrderConfirmationPage` | WooCommerce thank-you (noindex) |
| Brend | `/brend/[slug]/` | *(nedelja 3+)* | Stub / filter listing |
| Tag | `/product-tag/[slug]/` | *(nedelja 3+)* | |
| Proizvođač | `/proizvodjac/[slug]/` | *(kasnije)* | Postoji na starom sajtu |
| Blog | `/[postname]/` | *(kasnije)* | |

---

## Primeri kanonskih URL-ova

```
/proizvodi/
/product-category/elektricni-alat/
/product-category/akumulatorski-alat/akumulatorske-busilice-odvijaci/
/product-category/elektromaterijal-i-oprema/
/product-category/rasveta/spoljna-rasveta/led-reflektori/
/prodavnica/elektricni-alat/cepac-za-drva-hl730-7t-scheppach/
/prodavnica/akumulatorski-alat/akumulatorske-busilice-odvijaci/busilica-aku-li-ion-18v-58g227-graphite/
/akcija/
/o-nama/
/kontakt/
```

---

## Interni slug ↔ WooCommerce slug

Neki slug-ovi u mock podacima razlikuju se od WP taksonomije:

| Interni (app) | WooCommerce URL |
|---------------|-----------------|
| `aku-alat` | `akumulatorski-alat` |
| `kosacice-i-trimeri` | `kosacice-i-trimeri-dobra` |
| `elektromaterijal` | `elektromaterijal-i-oprema` |

Mapiranje: `src/lib/wcSlugs.ts`

---

## Dev-era redirect (staging)

| Stara dev putanja | Kanonska |
|-------------------|----------|
| `/kategorija/alati` | `/proizvodi` |
| `/kategorija/alati/:parent/:listing` | `/product-category/:wcParent/:listing` |
| `/kategorija/elektromaterijal/...` | `/product-category/elektromaterijal-i-oprema/...` |
| `/proizvod/:slug` | `/prodavnica/.../:slug` (lookup po slug-u) |

Implementacija: `src/pages/LegacyRedirects.tsx`  
Vercel 301 za top-level: `vercel.json`

---

## Trailing slash

Stari sajt koristi trailing slash (`/kontakt/`). React Router trenutno radi bez slash-a. Pre go-live: uskladiti canonical tagove i eventualno Vercel `trailingSlash: true`.

---

## Sledeći koraci (nedelja 3+)

1. WP REST API — pravi slug-ovi i hijerarhija kategorija iz baze  
2. Rute `/brend/`, `/product-tag/`, `/proizvodjac/`  
3. Dinamički `generateMetadata` / JSON-LD po šablonu iz `meta-parity-plan.md`
