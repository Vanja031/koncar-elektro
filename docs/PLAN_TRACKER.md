# Plan implementacije — Končar Elektro

**Projekat:** Migracija WooCommerce prodavnice na React / Next.js + WordPress Headless  
**Domen:** [koncarelektro.rs](https://koncarelektro.rs)  
**Klijent:** Končar Elektro  
**Ponuda:** SUP-2025-931  
**Trajanje:** 2 meseca (8 nedelja)  
**Datum plana:** 17.06.2026.  
**Poslednje ažuriranje trackera:** 17.07.2026. (Nedelja 5 zatvorena)

> **STARI SAJT (live, WooCommerce):** [koncarelektro.rs](https://koncarelektro.rs) — ovo je sajt sa kojeg čuvamo SEO, URL-ove i podatke  
> **NOVI SAJT (u razvoju, nije okačen):** `koncar-elektro/koncar-elektro-store/` — React + Vite, lokalno, nije deployovan

> ⚠️ **ZAŠTITA LIVE SHOPA:** Ni jedna aktivnost migracije ne sme ometati rad postojeće prodavnice do go-live-a. Detalji: [LIVE_SHOP_SAFETY.md](./LIVE_SHOP_SAFETY.md)

---

## Legenda statusa

| Oznaka | Značenje |
|--------|----------|
| `[ ]` | Nije započeto |
| `[~]` | U toku |
| `[x]` | Završeno |
| `[!]` | Blokirano / čeka klijenta |
| `[—]` | N/A ili preskočeno |

Za svaku stavku popunjavaj: **Status**, **Datum završetka**, **Napomena**.

---

## Trenutno stanje projekta

| Stavka | Stanje |
|--------|--------|
| **Aktivna nedelja** | Nedelja 5 zatvorena — prelazak na Nedelju 6 |
| **Sledeći korak** | Nedelja 6: JSON-LD (6.3–6.5); kartica (6.1–6.2) kad stignu smernice banke |
| **Postojeći kod** | Next.js 14 App Router u `koncar-elektro-store/` — migracija sa Vite završena 07.07.2026. |
| **Ciljna arhitektura** | Next.js 14 (App Router) + WordPress Headless |

### Brzi pregled napretka

| Faza | Nedelje | Završeno | U toku | Preostalo |
|------|---------|----------|--------|-----------|
| Mesec 1 — Priprema, SEO audit, jezgro | 1–4 | 4 | 0 | 0 nedelja |
| Mesec 2 — Funkcionalnosti, SEO parity, launch | 5–8 | 1 | 0 | 3 nedelje |
| **Ukupno** | **8** | **5** | **0** | **3** |

---

## Polazne tačke projekta

| # | Tačka | Status | Datum | Napomena |
|---|-------|--------|-------|----------|
| P1 | Inicijalni React dizajn stranice postoji — faza dizajna se skraćuje na finalizaciju | `[x]` | — | `koncar-elektro-store/`, `koncarelektro-landing.html` |
| P2 | Migracija sa postojeće WooCommerce prodavnice — podaci, kategorije, atributi, slug-ovi iz aktuelne baze | `[~]` | 16.07.2026. | Katalog live; checkout BFF spreman (live tek uz `WC_LIVE_CHECKOUT=true`) |
| P3 | Klijent obezbeđuje WP admin pristup + hosting/DNS + Google Search Console + GA | `[x]` | 22.06.2026. | Pristup primljen |
| P4 | Očuvanje SEO-a i svih putanja je prioritet #1 — URL adrese ostaju identične | `[x]` | 02.07.2026. | Routing mapa + WC putanje u staging app (`docs/url-routing-map.md`) |

---

## Strategija očuvanja SEO-a i putanja

Ove stavke su **kontinuirane** kroz ceo projekat — ne ostavljaju se za kraj.

| # | Strategija | Status | Datum | Napomena |
|---|-----------|--------|-------|----------|
| S1 | URL paritet 1:1 — Next.js routing prati sve postojeće putanje (proizvod, kategorija, statičke, blog) | `[x]` | 02.07.2026. | Vite app na WC putanjama; vidi `docs/url-routing-map.md` |
| S2 | Snimak pre migracije — crawl svih URL-ova, meta tagova, H1, canonical, structured data, sitemap | `[x]` | 22.06.2026. | `docs/crawl/seo-baseline.csv` — referentna tačka za poređenje |
| S3 | Parity provera pre lansiranja — svaki stari URL i meta podaci upoređeni sa novom verzijom | `[ ]` | | Pre go-live |
| S4 | 301 redirect-i samo po izuzetku — podrazumevano nijedan redirect | `[ ]` | | |
| S5 | Post-launch monitoring — GSC index coverage, crawl greške, zadržavanje rangiranja | `[ ]` | | Prvi dani posle lansiranja |

---

# MESEC 1 — Priprema, SEO audit i jezgro platforme

**Nedelje 1–4**  
**Deliverable meseca 1:** Odobren dizajn + URL routing mapa (1:1), funkcionalan REST API sa pravim podacima, jezgro sajta na stagingu (početna, kategorije, proizvodi).

---

## Nedelja 1 — Kick-off, pristup i SEO snimak

| # | Zadatak | Status | Datum | Napomena |
|---|---------|--------|-------|----------|
| 1.1 | Kick-off sastanak | `[x]` | 22.06.2026. | |
| 1.2 | Preuzimanje WP admin pristupa za koncarelektro.rs | `[x]` | 22.06.2026. | |
| 1.3 | Preuzimanje pristupa hosting/DNS | `[x]` | 22.06.2026. | |
| 1.4 | Preuzimanje pristupa Google Search Console | `[x]` | 22.06.2026. | |
| 1.5 | Preuzimanje pristupa Google Analytics | `[x]` | 22.06.2026. | |
| 1.6 | Pokretanje papira sa bankom za kartično plaćanje (paralelno sa razvojem) | `[x]` | 25.06.2026. | Papiri pokrenuti |
| 1.7 | Pun crawl postojeće prodavnice — izvoz svih URL-ova (proizvodi, kategorije, stranice, blog) | `[x]` | 22.06.2026. | 5.650 unique URL-ova; output: `docs/crawl/seo-baseline.csv` |
| 1.8 | Snimak trenutnog SEO stanja: meta tagovi, H1, canonical, structured data | `[x]` | 22.06.2026. | title, meta desc, H1, canonical za svih 5.650 URL-ova; 3.770 URL-ova sa SEO issues — vidi `docs/crawl/seo-baseline-errors.csv` |
| 1.9 | Snimak XML sitemap-a, robots.txt, postojećih redirect-a | `[x]` | 22.06.2026. | `docs/snapshots/robots.txt` sačuvan; sitemap radi u browseru (vidi `docs/sitemap-status.md`); sitnica: http→https u Yoast |
| 1.10 | Baseline organskog saobraćaja i rangiranja (GSC + GA) za kasnije poređenje | `[x]` | 22.06.2026. | GSC export: `docs/gsc-export-2026-06-22/` (Queries, Pages, Chart, Devices, Countries); GA4: `docs/ga4/` — organic: 7.666 ses/28d, 646k RSD prihod |
| 1.11 | Analiza WooCommerce permalink strukture (npr. `/proizvod/`, `/kategorija-proizvoda/`) | `[x]` | 22.06.2026. | Dokumentovano u `docs/permalink-structure.md` — proizvodi: `/prodavnica/%product_cat%/[slug]/`, kategorije: `/product-category/`, brendovi: `/brend/` |

**Milestone (kraj Nedelje 1):** URL inventar + SEO baseline izveštaj predati klijentu na uvid.

| Milestone | Status | Datum | Napomena |
|-----------|--------|-------|----------|
| URL inventar + SEO baseline (interno) | `[x]` | 25.06.2026. | Crawl + baseline u `docs/crawl/` |
| Slanje izveštaja klijentu | `[—]` | | Odloženo — ne šalje se još |

---

## Nedelja 2 — Dizajn, arhitektura i URL mapiranje

| # | Zadatak | Status | Datum | Napomena |
|---|---------|--------|-------|----------|
| 2.1 | Finalizacija postojećeg React dizajna — dizajn sistem (boje, tipografija, komponente) | `[x]` | 06.07.2026. | Dizajn sistem + ekrani u `koncar-elektro-store/` |
| 2.2 | Dizajn preostalih ekrana: kategorija | `[x]` | 26.06.2026. | CategoryPage, listing, parent hub |
| 2.3 | Dizajn preostalih ekrana: proizvod | `[x]` | 26.06.2026. | ProductPage kompletan |
| 2.4 | Dizajn preostalih ekrana: korpa | `[x]` | 26.06.2026. | CartPage |
| 2.5 | Dizajn preostalih ekrana: checkout | `[x]` | 26.06.2026. | CheckoutPage + potvrda |
| 2.6 | Dizajn preostalih ekrana: kontakt | `[x]` | 26.06.2026. | ContactPage, O nama, FAQ |
| 2.7 | Definisanje Next.js routing mape koja 1:1 prati postojeće putanje | `[x]` | 26.06.2026. | `docs/url-routing-map.md` + implementacija u App |
| 2.8 | Plan očuvanja meta podataka i canonical-a (meta parity plan) | `[x]` | 26.06.2026. | `docs/meta-parity-plan.md` |
| 2.9 | Postavka staging okruženja | `[x]` | | Vercel staging (klijent) |
| 2.10 | Postavka repozitorijuma | `[x]` | 02.07.2026. | Git + Vercel deploy |
| 2.11 | Postavka CI/CD skeleta | `[x]` | 02.07.2026. | Auto-deploy sa gita na Vercel |

**Milestone (kraj Nedelje 2):** Odobrenje finalnog dizajna i URL routing mape pre početka razvoja.

| Milestone | Status | Datum | Napomena |
|-----------|--------|-------|----------|
| Odobren finalni dizajn | `[x]` | 07.07.2026. | Nedelja 2 zatvorena — svi zadaci 2.1–2.11 kompletni |
| Odobrena URL routing mapa | `[x]` | 07.07.2026. | 1:1 sa starim sajtom; implementirano u app + `docs/url-routing-map.md` |

---

## Nedelja 3 — WP Headless backend i REST API

| # | Zadatak | Status | Datum | Napomena |
|---|---------|--------|-------|----------|
| 3.1 | Konfiguracija WordPress-a kao headless backend | `[x]` | 06.07.2026. | CORS + API ključevi; live shop netaknut |
| 3.2 | REST API setup | `[x]` | 06.07.2026. | Store API + WC v3 + client sloj |
| 3.3 | CPT/ACF konfiguracija gde je potrebno | `[x]` | 06.07.2026. | Nema ACF; brendovi/atributi preko WC — vidi `docs/wp-reference/wp-plugin-audit.md` |
| 3.4 | WooCommerce Store API konfiguracija | `[x]` | 06.07.2026. | Read kompletan; cart POST → nedelja 5 |
| 3.5 | Mapiranje atributa iz postojeće baze | `[x]` | 06.07.2026. | `sync:wc-attributes`, mapper PDP/specs, brend filter |
| 3.6 | Mapiranje kategorija iz postojeće baze | `[x]` | 06.07.2026. | Mega menu + MobileNav iz WC Store API; WC slug-ovi u linkovima |
| 3.7 | Mapiranje taksonomija iz postojeće baze | `[x]` | 06.07.2026. | `pa_proizvodjac` u mapperu/filteru; `/brend/` listing → posle 3.12 |
| 3.8 | Endpoint-i za proizvode | `[x]` | 06.07.2026. | PDP, listing, početna, akcija+paginacija, related; vidi napomenu* |
| 3.9 | Endpoint-i za kategorije | `[x]` | 06.07.2026. | Listing po WC slug-u + paginacija (`X-WP-TotalPages`) |
| 3.10 | Endpoint-i za filtere | `[x]` | 06.07.2026. | Brend (`pa_proizvodjac`, checkbox multi-select), cena, dostupnost (`in_stock`); mobilni drawer sa desne (`MobileFiltersSheet`) |
| 3.11 | Endpoint-i za pretragu | `[x]` | 06.07.2026. | Header + mobilna pretraga → Store API `search` |
| 3.12 | Očuvanje slug-ova proizvoda — ključno za 1:1 URL parity | `[x]` | 07.07.2026. | `audit:wc-slugs` + `audit:seo-baseline` (565 uzoraka); 540 OK, 4 uklonjena, 1 WC path warn |
| 3.13 | Očuvanje slug-ova kategorija — ključno za 1:1 URL parity | `[x]` | 07.07.2026. | 186 WC category paths; sve u sample auditu OK |

\* **3.8 otvoreno za kasnije (ne blokira 3.12):** varijabilni proizvodi (izbor varijante), pun tekst recenzija (Store API nema `/reviews`), korpa iz API-ja (nedelja 5), `/brend/` archive stranice.

**Dodatno urađeno u Nedelji 3 (UX / live podaci, 06.07.2026.):**

| Tema | Status | Napomena |
|------|--------|----------|
| Stranica `/najprodavanije` | `[x]` | `BestSellersPage`, paginacija, link sa početne |
| Početna — carousel najprodavanije | `[x]` | Iste kartice kao akcija (`ProductCard`), badge + bg; kompaktan badge samo na početnoj |
| Početna + akcija — live proizvodi | `[x]` | `useLiveSaleProducts`, `useLiveBestSellers` |
| Hub `/proizvodi` + programi — live kategorije | `[x]` | `useCategoryPageLive`, slike: proizvod → statički asset (`subcategoryImages.ts`) |
| Parent listing (`/product-category/…`) — chipovi | `[x]` | Live podkategorije + slike proizvoda po WC slug-u |
| Sortiranje na listingu | `[x]` | `listingSort.ts` → Store API `orderby` |
| Mobilna pretraga | `[x]` | Full-screen modal, Enter → `/pretraga` |
| Mobilni filteri | `[x]` | Dugme „Filteri“ → panel sa desne, X zatvaranje, badge broja aktivnih |
| Recenzije / brend stranice / korpa | `[—]` | Ostaju za kasnije po dogovoru (N5) |

---

## Nedelja 4 — Razvoj jezgra frontenda

| # | Zadatak | Status | Datum | Napomena |
|---|---------|--------|-------|----------|
| 4.1 | Postavka Next.js 14 (App Router, SSR/SSG) | `[x]` | 07.07.2026. | `app/` rute 1:1, `src/views/`, router-compat, `npm run dev` → Next |
| 4.2 | Globalni layout | `[x]` | 07.07.2026. | `app/layout.tsx` + `Providers` (Query, Cart, Toaster) |
| 4.3 | Header | `[x]` | 07.07.2026. | `SiteHeader` u `ShopLayout`/view komponentama |
| 4.4 | Footer | `[x]` | 07.07.2026. | `SiteFooter` u `ShopLayout`/view komponentama |
| 4.5 | Navigacija | `[x]` | 07.07.2026. | Mega menu + mobilna nav — live WC kategorije preko `useNavigationMenu` |
| 4.6 | Početna stranica | `[x]` | 07.07.2026. | `app/page.tsx` → `Index.tsx` + live sekcije |
| 4.7 | Dinamičke rute za kategorije po postojećim slug-ovima | `[x]` | 07.07.2026. | `app/product-category/[[...slug]]` |
| 4.8 | Dinamičke rute za proizvode po postojećim slug-ovima | `[x]` | 07.07.2026. | `app/prodavnica/[...segments]` |
| 4.9 | Povezivanje sa REST API-jem | `[x]` | 07.07.2026. | `NEXT_PUBLIC_USE_LIVE_API`, rewrite `/wp-json` |
| 4.10 | ISR za 5.000+ proizvoda | `[x]` | 16.07.2026. | `generateStaticParams` pre-renderuje bestseleri+akcija (~40, `src/lib/isr/staticParams.ts`); ostatak ide na `dynamicParams` on-demand + `revalidate` keš — bez dodatnog opterećenja live sajta na build-u |
| 4.11 | Per-page meta tagovi: title | `[x]` | 07.07.2026. | `generateMetadata` + `seo-baseline-index.json` (5.649 URL-ova) |
| 4.12 | Per-page meta tagovi: description | `[x]` | 07.07.2026. | Baseline ili generisani opis gde nedostaje |
| 4.13 | Per-page meta tagovi: canonical | `[x]` | 07.07.2026. | Uvek `https://koncarelektro.rs/...` (bez `?page_id=`) |
| 4.14 | Per-page meta tagovi: OG (Open Graph) | `[x]` | 07.07.2026. | og:title, og:description, og:url, og:image |

**Deliverable (kraj Meseca 1):**

| Deliverable | Status | Datum | Napomena |
|-------------|--------|-------|----------|
| Odobren dizajn | `[x]` | 07.07.2026. | Nedelja 2 zatvorena |
| URL routing mapa (1:1) | `[x]` | 07.07.2026. | `docs/url-routing-map.md` + Vite rute |
| Funkcionalan REST API sa pravim podacima | `[~]` | 16.07.2026. | Read path kompletan (uklj. ISR); write (korpa/checkout) nedelja 5 |
| Jezgro sajta na stagingu (početna, kategorije, proizvodi) | `[x]` | 16.07.2026. | Next.js App Router + ISR na proizvodima/kategorijama/akciji na Vercelu |

---

# MESEC 2 — Funkcionalnosti, SEO parity i lansiranje

**Nedelje 5–8**  
**Deliverable meseca 2:** Sajt je živ, sve funkcionalnosti rade, SEO i sve putanje očuvani 1:1, izvorni kod predat i tim obučen za WordPress admin panel.

---

## Nedelja 5 — E-commerce funkcionalnosti

| # | Zadatak | Status | Datum | Napomena |
|---|---------|--------|-------|----------|
| 5.1 | Napredni filteri — brend | `[x]` | 17.07.2026. | Checkbox + draft/Primeni; badge sa X; redosled liste ne skače |
| 5.2 | Napredni filteri — cena | `[x]` | 17.07.2026. | Od/Do + Primeni (ne na svaki keystroke); badge-ovi |
| 5.3 | Napredni filteri — atributi | `[x]` | 17.07.2026. | Faceti iz Store API (`useListingAttributeGroups`); dostupnost + atributi; draft/Primeni |
| 5.5 | Live pretraga | `[x]` | 06.07.2026. | Header desktop + mobilni modal, `/pretraga` |
| 5.6 | Korpa | `[x]` | 16.07.2026. | Lokalna korpa (snapshot) + sync u WC tek na checkout submit preko BFF |
| 5.7 | Kompletan checkout flow | `[x]` | 17.07.2026. | Live WC order (COD/BACS); Test Test override; zahvala; toast validacija; kartica blokirana |
| 5.8 | Sticky kontakti | `[x]` | 16.07.2026. | Proširivo dugme „Stručna pomoć" → Viber / WhatsApp / telefon |
| 5.9 | Callback forma | `[x]` | 17.07.2026. | Nije potrebna posebno — pokriveno kontakt formom + sticky poziv; zatvoreno po dogovoru |
| 5.10 | WhatsApp / Viber dugme | `[x]` | 16.07.2026. | Deo istog proširivog sticky widgeta (5.8) |

---

## Nedelja 6 — Plaćanje i tehnički SEO sloj

| # | Zadatak | Status | Datum | Napomena |
|---|---------|--------|-------|----------|
| 6.1 | Integracija kartičnog plaćanja sa bankom | `[ ]` | | Zavisi od banke |
| 6.2 | Test transakcije na stagingu | `[ ]` | | |
| 6.3 | Schema markup — Product | `[ ]` | | |
| 6.4 | Schema markup — BreadcrumbList | `[ ]` | | |
| 6.5 | Schema markup — Organization | `[ ]` | | |
| 6.6 | XML sitemap generator | `[ ]` | | |
| 6.7 | robots.txt | `[ ]` | | |
| 6.8 | GA4 ecommerce | `[ ]` | | |
| 6.9 | GTM (Google Tag Manager) | `[ ]` | | |
| 6.10 | GDPR / cookie consent usklađen sa propisima | `[ ]` | | |
| 6.11 | Mapiranje 301 redirect-a samo za neizbežne izmene putanja (cilj: 0) | `[ ]` | | |

**Milestone (kraj Nedelje 6):** Uspešna test transakcija kartičnog plaćanja na stagingu.

| Milestone | Status | Datum | Napomena |
|-----------|--------|-------|----------|
| Uspešna test transakcija na stagingu | `[ ]` | | |

---

## Nedelja 7 — Migracija sadržaja i SEO parity QA

| # | Zadatak | Status | Datum | Napomena |
|---|---------|--------|-------|----------|
| 7.1 | Finalna sinhronizacija 5.000–6.000 proizvoda iz postojeće baze | `[ ]` | | |
| 7.2 | Mapiranje atributa proizvoda | `[ ]` | | |
| 7.3 | Kategorijski baneri | `[ ]` | | |
| 7.4 | Statičke stranice | `[ ]` | | |
| 7.5 | Blog (ako postoji) | `[ ]` | | |
| 7.6 | SEO parity provera — meta tagovi vs. snimak iz Nedelje 1 | `[ ]` | | |
| 7.7 | SEO parity provera — H1 vs. snimak iz Nedelje 1 | `[ ]` | | |
| 7.8 | SEO parity provera — canonical vs. snimak iz Nedelje 1 | `[ ]` | | |
| 7.9 | SEO parity provera — structured data vs. snimak iz Nedelje 1 | `[ ]` | | |
| 7.10 | URL diff izveštaj — potvrda da svaki stari URL ima identičan novi | `[ ]` | | |
| 7.11 | Optimizacija performansi | `[ ]` | | |
| 7.12 | Optimizacija Core Web Vitals | `[ ]` | | |

**Milestone (kraj Nedelje 7):** Potvrđen 1:1 SEO i URL parity na stagingu pre lansiranja.

| Milestone | Status | Datum | Napomena |
|-----------|--------|-------|----------|
| Potvrđen 1:1 SEO parity na stagingu | `[ ]` | | |
| Potvrđen 1:1 URL parity na stagingu | `[ ]` | | |

---

## Nedelja 8 — Lansiranje i post-launch SEO

| # | Zadatak | Status | Datum | Napomena |
|---|---------|--------|-------|----------|
| 8.1 | Finalno testiranje na svim uređajima i browserima | `[ ]` | | |
| 8.2 | Test plaćanja sa realnim transakcijama | `[ ]` | | |
| 8.3 | Go-live: prebacivanje DNS / deploy | `[ ]` | | |
| 8.4 | Slanje nove sitemap u Search Console | `[ ]` | | |
| 8.5 | Provera 200/301 statusa svih ključnih URL-ova posle lansiranja | `[ ]` | | |
| 8.6 | Monitoring index coverage-a (GSC) | `[ ]` | | Prvi dani |
| 8.7 | Monitoring crawl grešaka | `[ ]` | | Prvi dani |
| 8.8 | Monitoring zadržavanja rangiranja | `[ ]` | | Prvi dani |
| 8.9 | Predaja izvornog koda | `[ ]` | | |
| 8.10 | Obuka tima za WP admin | `[ ]` | | |
| 8.11 | Početak 30 dana garancije | `[ ]` | | |

**Milestone (Nedelja 8):** Uplata preostalih 50%, lansiranje i predaja koda.

| Milestone | Status | Datum | Napomena |
|-----------|--------|-------|----------|
| Uplata preostalih 50% | `[ ]` | | |
| Lansiranje (go-live) | `[ ]` | | |
| Predaja koda | `[ ]` | | |

**Deliverable (kraj Meseca 2):**

| Deliverable | Status | Datum | Napomena |
|-------------|--------|-------|----------|
| Sajt je živ i sve funkcionalnosti rade | `[ ]` | | |
| SEO i putanje očuvani 1:1 | `[ ]` | | |
| Izvorni kod predat | `[ ]` | | |
| Tim obučen za WordPress admin panel | `[ ]` | | |

---

## Ključne tačke odobrenja (pregled)

| Kada | Šta | Status | Datum | Odobrio |
|------|-----|--------|-------|---------|
| Kraj Nedelje 1 | URL inventar + SEO baseline (interno) | `[x]` | 25.06.2026. | Slanje klijentu odloženo |
| Kraj Nedelje 2 | Finalni dizajn + URL routing mapa | `[x]` | 07.07.2026. | Nedelja 2 kompletno zatvorena |
| Kraj Nedelje 6 | Uspešna test transakcija kartičnog plaćanja | `[ ]` | | |
| Kraj Nedelje 7 | Potvrđen 1:1 SEO i URL parity na stagingu | `[ ]` | | |
| Nedelja 8 | Uplata 50%, lansiranje, predaja koda | `[ ]` | | |

---

## Napomene i pretpostavke

| Tema | Detalj | Relevantno za |
|------|--------|---------------|
| WP pristup | Pravovremen admin pristup koncarelektro.rs je preduslov za Nedelju 1 | 1.2 |
| Kartično plaćanje | Papiri sa bankom kreću u Nedelji 1; aktivacija zavisi od banke i može pasti i posle launcha bez uticaja na ostatak sajta | 1.6, 6.1 |
| Revizije | Svaka faza uključuje do 2 revizije, u skladu sa ponudom | Sve faze |
| URL izmene | Ako klijent zatraži promenu putanja, pravi se 301 mapa; podrazumevano se sve putanje zadržavaju | S4, 6.11 |
| Staging | Razvoj teče na staging serveru bez uticaja na live sajt do lansiranja | 2.9 |
| **Live shop** | **Zabranjene izmene koje utiču na kupce do go-live-a** — vidi `LIVE_SHOP_SAFETY.md` | Sve faze |

---

## Dnevnik promena

Evidentiraj značajne događaje, odluke i blokade.

| Datum | Ko | Šta | Uticaj |
|-------|----|-----|--------|
| 22.06.2026. | — | Kreiran tracker na osnovu PDF plana (SUP-2025-931) | Početna tačka |
| 22.06.2026. | — | Kick-off sastanak obavljen (1.1) | — |
| 22.06.2026. | — | Primljeni svi pristup od klijenta (WP, hosting, GSC, GA) — P3, 1.2–1.5 zatvoreni | Odblokiran SEO audit |
| 22.06.2026. | — | Potvrđeno: stari sajt = koncarelektro.rs (live WooCommerce); novi sajt = koncar-elektro-store/ (lokalno, nije deployovan) | Kontekst jasan |
| 22.06.2026. | — | robots.txt sačuvan; sitemap_index.xml = 500 greška — potreban fix u WP (Yoast) | Blokira sitemap submission u N8; crawl nije blokiran |
| 22.06.2026. | — | Permalink struktura dokumentovana: posts=`/{slug}/`, kategorije=`/product-category/`, brendovi=`/brend/`, proizvodi=`/prodavnica/%product_cat%/[slug]/` | Ključno za Next.js routing u N2 |
| 22.06.2026. | — | GSC + GA4 baseline sačuvan (1.10) — organic dominira: 82% sesija, 646k RSD/28d; top brand: "koncar elektro"; ⚠️ spam upiti (lunatogel, bandar80) — filtrirati | Referentna tačka za post-launch monitoring |
| 22.06.2026. | — | Crawl završen (1.7+1.8): 5.650 URL-ova, 3.770 sa SEO issues; `docs/crawl/seo-baseline.csv` + `docs/crawl/seo-baseline-errors.csv` | Referentni snimak sačuvan |
| 25.06.2026. | — | Nedelja 1 zatvorena: papiri sa bankom pokrenuti (1.6); interni SEO baseline kompletan | Prelazak na Nedelju 2 |
| 25.06.2026. | — | Slanje SEO izveštaja klijentu odloženo po odluci tima | Milestone klijentskog odobrenja preskočen za sada |
| 02.07.2026. | — | Nedelja 2 zatvorena (dev): repo + CI/CD, URL mapa 1:1 implementirana | Prelazak na nedelju 3 |
| 02.07.2026. | — | URL routing mapa — milestone označen N/A (nema klijentskog odobrenja) | Putanje preuzete sa live sajta |
| 06.07.2026. | — | Nedelja 2 zatvorena: dizajn sistem (2.1) + svi ekrani kompletni | Prelazak na Nedelju 3 — WP headless |
| 06.07.2026. | — | Nedelja 3 start: API probe, `wp-headless-setup.md`, API client, Vite proxy | Store API radi; WC v3 + CORS na klijentu |
| 06.07.2026. | — | Listing sort/filteri, pretraga, live hub/program stranice, početna/akcija | `audit:wc-slugs`; 3.10–3.11 zatvoreno |
| 06.07.2026. | — | 3.4–3.8 zatvoreno (read API); bestseller kartice, akcija paginacija | Sledeće: 3.12/3.13 slug QA |
| 06.07.2026. | — | Listing UX: sort, filteri (brend/cena/dostupnost), mobilni filter drawer, live hub/listing slike | `MobileFiltersSheet`, `subcategoryImages.ts` |
| 06.07.2026. | — | `/najprodavanije`, početna carousel usklađen sa akcijom, kompaktan badge | `BestSellersPage`, `ProductCard` bestseller variant |
| 07.07.2026. | — | Nedelja 4 start: Next.js 14 migracija (4.1) — App Router, sve rute 1:1, build prolazi | Vite zamenjen; `npm run dev:vite` za legacy |
| 16.07.2026. | — | Nedelja 4 zatvorena: ISR za proizvode (4.10) — `generateStaticParams` pre-renderuje bestseleri+akcija (~40), ostatak `dynamicParams` on-demand + revalidate keš; 4.2–4.9 potvrđene kao završene u kodu; lokalni build prošao (55/55 stranica) | Mesec 1 kompletan; prelazak na Nedelju 5 (korpa/checkout) |
| 17.07.2026. | — | Nedelja 5 zatvorena: e-commerce (korpa/checkout/filteri/sticky/toast); 5.9 callback zatvoren po dogovoru (nije potreban) | Prelazak na Nedelju 6 |

---

## Sledeći koraci (action items)

### Sada — Nedelja 6 (Nedelja 5 zatvorena 17.07.2026.)

**Prioritet 1 — SEO tehnički sloj (može odmah)**
- JSON-LD: Product, BreadcrumbList, Organization (6.3–6.5)

**Prioritet 2 — Plaćanje (čeka banku)**
- Kartično plaćanje + test transakcija (6.1–6.2)

**Ostalo u Nedelji 6**
- Sitemap, robots.txt, GA4/GTM, cookie consent (6.6–6.10)

**Završeno — Nedelja 5 (17.07.2026.)**
- Filteri (brend/cena/atributi) sa draft → Primeni / Poništi + badge-ovi
- Live pretraga, korpa, checkout (COD/BACS, Test Test, zahvala)
- Sticky Viber/WhatsApp/telefon; kontakt toast
- 5.9 callback: nije potreban posebno (kontakt + sticky dovoljni)

---

*Izvor: `Plan_Implementacije_KoncarElektro.pdf` · Superity · SUP-2025-931*
