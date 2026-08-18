# Plan implementacije — Končar Elektro

**Projekat:** Migracija WooCommerce prodavnice na React / Next.js + WordPress Headless  
**Domen:** [koncarelektro.rs](https://koncarelektro.rs)  
**Klijent:** Končar Elektro  
**Ponuda:** SUP-2025-931  
**Trajanje:** 2 meseca (8 nedelja)  
**Datum plana:** 17.06.2026.  
**Poslednje ažuriranje trackera:** 18.08.2026. (Nedelja 8 — nalozi, kontakt, recenzije, društvene mreže)

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
| **Aktivna nedelja** | Nedelja 8 — go-live priprema |
| **Sledeći korak** | Ručna provera 8.1 + 8.2 (u toku); DNS tek kad su oba zeleni |
| **Postojeći kod** | Next.js 14 App Router u `koncar-elektro-store/` — migracija sa Vite završena 07.07.2026. |
| **Ciljna arhitektura** | Next.js 14 (App Router) + WordPress Headless |

### Brzi pregled napretka

| Faza | Nedelje | Završeno | U toku | Preostalo |
|------|---------|----------|--------|-----------|
| Mesec 1 — Priprema, SEO audit, jezgro | 1–4 | 4 | 0 | 0 nedelja |
| Mesec 2 — Funkcionalnosti, SEO parity, launch | 5–8 | 2 | 1 | 1 nedelja |
| **Ukupno** | **8** | **6** | **1** | **1** |

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
| S3 | Parity provera pre lansiranja — svaki stari URL i meta podaci upoređeni sa novom verzijom | `[x]` | 12.08.2026. | Lokalno + Vercel Preview: static 23/23, sample 155/155 OK |
| S4 | 301 redirect-i samo po izuzetku — podrazumevano nijedan redirect | `[x]` | 12.08.2026. | Izuzeci u `vercel.json` + `permanentRedirect`: yith-compare, attribute archives, `/placanje` |
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

\* **3.8 otvoreno za kasnije (ne blokira 3.12):** varijabilni proizvodi (izbor varijante). Recenzije zatvorene 18.08.2026. (WC v3 BFF); korpa/checkout N5; `/proizvodjac/` N7.

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
| Recenzije / brend stranice / korpa | `[x]` | 18.08.2026. | Recenzije: WC v3 (prikaz + submit, 1 po e-mailu); `/proizvodjac/` N7; korpa N5 |

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

**Dodatni fix-evi posle formalnog zatvaranja Nedelje 5 (20.07.–30.07.2026.):**

| Tema | Status | Datum | Napomena |
|------|--------|-------|----------|
| Shipping kalkulacija | `[x]` | 20.07.2026. | Popravke u `shipping.ts`, `CartSummary`, `CheckoutSummary`, `ProductPurchaseCard`; dodat `shipping.test.ts` |
| Staging environment | `[x]` | 23.07.2026. | Staging WP host (`testing.cleannikki.com`) povezan; uvezen `proizvodi-woocommerce-staging.csv` (pun katalog za staging) |
| CORS fix za API config | `[x]` | 23.07.2026. | `wpApiBase` uvek same-origin `/wp-json` rewrite (i dev i prod/Vercel) — izbegnut CORS problem sa WC Store API koji ne emituje `Access-Control-Allow-Origin` |
| Filteri — UX raspored | `[x]` | 23.07.2026. | Brend filter izdvojen i prikazan prvi/podrazumevano otvoren; ostali atributi ispod, podrazumevano zatvoreni (`ProductFilters.tsx`) |
| Filteri — uklonjeni mock podaci | `[x]` | 24.07.2026. | `CategoryPage`/`ProductsPage` sada 100% na live WC podacima; fix u `useCategoryPageLive`, `useListingAttributeGroups`, `buildNavigationMenu`, `wcSlugs` |
| Filteri — skrivanje nekorisnih atributa | `[x]` | 30.07.2026. | Dodati u `HIDDEN_FILTER_ATTRIBUTE_SLUGS`: dimenzije, broj hodova, frekvencija, nivo vibracija, rezervoar ulja, dužina kabla/creva, IP zaštita — previše šuma za filter UI |

---

## Nedelja 6 — Plaćanje i tehnički SEO sloj

| # | Zadatak | Status | Datum | Napomena |
|---|---------|--------|-------|----------|
| 6.1 | Integracija kartičnog plaćanja sa bankom | `[x]` | 05.08.2026. | RaiAccept Code integration (REST API) — redirect flow, automatska realizacija. BFF: `/api/payments/raiaccept/{start,status,webhook}`; WC order pending → RaiAccept session; reconcile po WC order id. Compliance: logoi banke/3DS, stranice uslovi/plaćanje/odustajanje/reklamacije/dostava |
| 6.2 | Test transakcije na stagingu | `[x]` | 07.08.2026. | Lokalni + Vercel Preview (`develop`): RaiAccept sandbox kartica OK (WC `processing` + `set_paid`); pouzeće OK. Napomena: `$` u RaiAccept lozinci escape na Vercel (`\$` ili kredencijali bez `$`); Preview env mora imati WP/COD/BACS + RaiAccept |
| 6.3 | Schema markup — Product | `[x]` | 05.08.2026. | `buildProductJsonLd` — cena/valuta/dostupnost/rating; ubačeno u `app/prodavnica/[...segments]/page.tsx` |
| 6.4 | Schema markup — BreadcrumbList | `[x]` | 05.08.2026. | PDP (iz `product.breadcrumbs`) + kategorija stranice; `buildBreadcrumbJsonLd` u `src/lib/seo/jsonld.ts` |
| 6.5 | Schema markup — Organization | `[x]` | 05.08.2026. | + `WebSite` (sitelinks search box) globalno u `app/layout.tsx`, iz `companyInfo` |
| 6.6 | XML sitemap generator | `[x]` | 05.08.2026. | `app/sitemap.ts` — generiše se iz `seo-baseline-index.json` (5.649 URL-ova, isti skup kao Nedelja 1 crawl) |
| 6.7 | robots.txt | `[x]` | 05.08.2026. | `app/robots.ts` — zamenio statički `public/robots.txt`; dodat `Sitemap:` + disallow za korpa/checkout/login/api, zadržana pravila po botu |
| 6.8 | GA4 ecommerce | `[~]` | 05.08.2026. | Measurement ID dobijen (`G-2HJ9BTPBK7`) i uveden u staging `.env`; `view_item`/`add_to_cart`/`begin_checkout`/`purchase` ožičeni. Namerno još neaktivno — `NEXT_PUBLIC_ANALYTICS_LIVE=false` dok radimo na proizvodima; pali se tek na go-live (samo Vercel Production), + kod odbija da radi van `koncarelektro.rs` domena kao dodatna kočnica |
| 6.9 | GTM (Google Tag Manager) | `[ ]` | | Klijent odložio — dodaje se kasnije; loader već postoji u kodu (`NEXT_PUBLIC_GTM_ID`), samo čeka Container ID |
| 6.10 | GDPR / cookie consent usklađen sa propisima | `[x]` | 05.08.2026. | Redizajniran banner (mini naslov, prirodniji tekst, dugmad Prihvati/Odbij u donjem desnom uglu kartice, u stilu sajta) + `ConsentContext` (localStorage); analitika tek posle pristanka; dodata `/politika-privatnosti` stranica (nedostajala je — URL parity gap iz starog sajta) |
| 6.11 | Mapiranje 301 redirect-a samo za neizbežne izmene putanja (cilj: 0) | `[x]` | 12.08.2026. | Namerni izuzeci: `/yith-compare`, `/snaga|/uvoznik|/zemlja-porekla` → `/pretraga`, `/placanje` → `/placanje-odjava`; trailing-slash varijante u `vercel.json` |

**Milestone (kraj Nedelje 6):** Uspešna test transakcija kartičnog plaćanja na stagingu.

| Milestone | Status | Datum | Napomena |
|-----------|--------|-------|----------|
| Uspešna test transakcija na stagingu | `[x]` | 07.08.2026. | Kartica + pouzeće potvrđeni na Vercel Preview |

---

## Nedelja 7 — Migracija sadržaja i SEO parity QA

| # | Zadatak | Status | Datum | Napomena |
|---|---------|--------|-------|----------|
| 7.1 | Finalna sinhronizacija 5.000–6.000 proizvoda iz postojeće baze | `[x]` | 12.08.2026. | Preskočeno kao sync — staging katalog je unapređen u odnosu na live; ostaje izvor istine do go-live |
| 7.2 | Mapiranje atributa proizvoda | `[x]` | 12.08.2026. | Već pokriveno (N3/N5 mapper + filteri); dodatni sync nije potreban dok staging vodi |
| 7.3 | Kategorijski baneri | `[x]` | 12.08.2026. | WP-editable: WC kategorije (naziv/opis/slika); slugovi preko `NEXT_PUBLIC_HOME_BANNER_CATEGORY_SLUGS` |
| 7.4 | Statičke stranice | `[x]` | 12.08.2026. | Dodato `/podaci-o-firmi`, `/kolacici-cookies`, `/narucivanje`, `/uslovi-koriscenja`; `/uslovi-kupovine` alias; + `/lista-zelja`, `/uporedite` (localStorage), attribute redirects, `/proizvodjac/[slug]` |
| 7.5 | Blog (ako postoji) | `[x]` | 12.08.2026. | `/novosti` lista iz `wp/v2/posts` + empty state; single post (`/[postname]/`) van opsega |
| 7.6 | SEO parity provera — meta tagovi vs. snimak iz Nedelje 1 | `[x]` | 12.08.2026. | Statičke 23/23 OK (`audit:seo-static-local`); sample 155 URL GSC+stratified OK (`audit:seo-parity-local`) |
| 7.7 | SEO parity provera — H1 vs. snimak iz Nedelje 1 | `[x]` | 12.08.2026. | ISR fallback za PDP/listing kad nema client live API; H1 iz ListingHero/ProductBuyBox u SSR |
| 7.8 | SEO parity provera — canonical vs. snimak iz Nedelje 1 | `[x]` | 12.08.2026. | Canonical `https://koncarelektro.rs/.../` na svim proverenim URL-ovima; taksonomije redirect → `/pretraga` |
| 7.9 | SEO parity provera — structured data vs. snimak iz Nedelje 1 | `[x]` | 12.08.2026. | Product+Breadcrumb JSON-LD na PDP; BreadcrumbList na kategorijama; Organization/WebSite globalno |
| 7.10 | URL diff izveštaj — potvrda da svaki stari URL ima identičan novi | `[x]` | 12.08.2026. | `seo-url-gap-report.md`: 5650/5650 covered; lokalni sample audit 155/155 |
| 7.11 | Optimizacija performansi | `[x]` | 12.08.2026. | `next/font` (eliminisan Google Fonts @import); LCP `fetchpriority=high` + `loading=eager`; lazy ispod folda; **kompresija statičkih slika** — 26 asset-a PNG→WebP (~23 MB uštede, skripta `compress:static-assets`) |
| 7.12 | Optimizacija Core Web Vitals | `[x]` | 12.08.2026. | Analytics `strategy="afterInteractive"`; hero/kategorije/baneri sada WebP; payment ikone PNG optimize in-place |

**Milestone (kraj Nedelje 7):** Potvrđen 1:1 SEO i URL parity na stagingu pre lansiranja.

| Milestone | Status | Datum | Napomena |
|-----------|--------|-------|----------|
| Potvrđen 1:1 SEO parity na stagingu | `[x]` | 12.08.2026. | Preview: static 23/23 + parity 155/155 OK |
| Potvrđen 1:1 URL parity na stagingu | `[x]` | 12.08.2026. | Inventar 5650/5650; Preview HTTP 200 + namerni 301 |

---

## Nedelja 8 — Lansiranje i post-launch SEO

| # | Zadatak | Status | Datum | Napomena |
|---|---------|--------|-------|----------|
| 8.1 | Finalno testiranje na svim uređajima i browserima | `[~]` | 12.08.2026. | Preview smoke + runbook `docs/GO_LIVE.md`; ostaje ručni QA telefon/desktop |
| 8.2 | Test plaćanja sa realnim transakcijama | `[!]` | | Čeka produkcijske RaiAccept credentials; sandbox već OK |
| 8.3 | Go-live: prebacivanje DNS / deploy | `[ ]` | | Runbook spreman; **ne dirati DNS** dok 8.2 nije zelen |
| 8.4 | Slanje nove sitemap u Search Console | `[ ]` | | `https://koncarelektro.rs/sitemap.xml` — tek posle DNS-a |
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
| Kraj Nedelje 6 | Uspešna test transakcija kartičnog plaćanja | `[x]` | 07.08.2026. | Sandbox + Preview OK; GTM (6.9) i 301 (6.11) ostaju otvoreni / ne blokiraju |
| Kraj Nedelje 7 | Potvrđen 1:1 SEO i URL parity na stagingu | `[x]` | 12.08.2026. | Preview: static 23/23 + sample 155/155 |
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
| 20.07.2026. | — | Popravke shipping kalkulacije (cart/checkout summary, purchase card) + test | Tačniji obračun dostave pre nastavka na Nedelju 6 |
| 23.07.2026. | — | Staging environment povezan (testing.cleannikki.com) + pun CSV katalog uvezen; CORS fix — API uvek ide preko same-origin `/wp-json` rewrite | Staging sada radi sa realnim podacima bez CORS problema |
| 23.07.2026. | — | Filteri redizajnirani: brend izdvojen i otvoren podrazumevano, ostali atributi ispod zatvoreni | Bolji UX na listing/kategorija stranicama |
| 24.07.2026. | — | Uklonjeni svi mock podaci iz CategoryPage/ProductsPage — potpuno na live WC podacima | Filteri i navigacija sada 100% konzistentni sa produkcijom |
| 30.07.2026. | — | Dodatni atributi skriveni iz filter UI (dimenzije, frekvencija, IP zaštita, itd.) — previše šuma za korisnika | Čistiji filter panel; formalni ulazak u Nedelju 6 |
| 05.08.2026. | — | Nedelja 6 — SEO tehnički sloj: JSON-LD Product/BreadcrumbList/Organization/WebSite, XML sitemap (`app/sitemap.ts`, 5.649 URL), robots.txt (`app/robots.ts`, zamenio statički fajl) | 6.3–6.7 zatvoreni |
| 05.08.2026. | — | GDPR cookie consent banner + `/politika-privatnosti` stranica (nedostajala je na novom sajtu — URL parity gap zatvoren) | 6.10 zatvoren |
| 05.08.2026. | — | GA4/GTM infrastruktura ožičena iza consent-a (`view_item`, `add_to_cart`, `begin_checkout`, `purchase`) — neaktivna dok klijent ne dostavi Measurement ID / Container ID | 6.8–6.9 spremni za aktivaciju, ne blokiraju ostatak Nedelje 6 |
| 05.08.2026. | — | `npm run build` prošao (18/18 stranica); staging okruženje nije bilo problem — API sloj već razdvojen preko env promenljive | Potvrđeno da rad na WP stagingu ne remeti Nedelju 6 |
| 05.08.2026. | — | Klijent dostavio GA4 Measurement ID (`G-2HJ9BTPBK7`); GTM odložen za kasnije. ID uveden u staging `.env` sa `NEXT_PUBLIC_ANALYTICS_LIVE=false` — namerno ugašeno da test/staging saobraćaj ne uđe u pravi GA4 nalog dok se sređuju proizvodi | 6.8 tehnički gotov, čeka samo go-live da se "upali" |
| 05.08.2026. | — | Cookie consent banner redizajniran po zahtevu klijenta: mini naslov "Poštujemo vašu privatnost", prirodniji tekst, dugmad Prihvati/Odbij premeštena u donji desni ugao kartice, veća/šira kartica na desktopu | 6.10 vizuelno usaglašen sa dizajnom sajta — klijent potvrdio da je dizajn odličan |
| 05.08.2026. | — | Kartično plaćanje (6.1): RaiAccept REST API (Code integration) — redirect + automatska realizacija; BFF start/status/webhook; WC order pending + meta `_raiaccept_order_id`; compliance stranice + Raiffeisen/3DS logoi | 6.1 zatvoren; 6.2 čeka Sandbox API Credentials od klijenta |
| 05.08.2026. | — | WC REST v3 ključevi prebačeni na server-only `WC_CONSUMER_KEY`/`SECRET` (bez `NEXT_PUBLIC_`) | Bezbednosni fix — write kredencijali više ne ulaze u browser bundle |
| 07.08.2026. | — | Reconcile: `set_paid: true` na uspešan RaiAccept `PAID` → WC prikazuje Paid on + Processing | Jasniji status plaćene kartične porudžbine u adminu |
| 07.08.2026. | — | Sandbox test lokalno OK; Vercel Preview: kartica blokirana zbog `$` u RaiAccept lozinci (env expansion) + COD/BACS disabled na WP dok env/payment metode nisu usklađene | Dijagnostika: Cognito `NotAuthorizedException` / `payment_method_disabled` |
| 07.08.2026. | — | Vercel Preview: kartica + pouzeće potvrđeni; 6.2 + milestone Nedelje 6 zatvoreni | Nedelja 6 zatvorena; prelazak na Nedelju 7 |
| 12.08.2026. | — | N7 start: 7.1/7.2 zatvoreni (staging katalog vodi, sync sa live nije potreban); 7.5 blog van opsega | Fokus na banere + statičke |
| 12.08.2026. | — | 7.3: homepage baneri iz WC kategorija (fallback na statičke assete); 7.4: statičke stranice usklađene sa baseline URL-ovima | Sledeće: 7.6–7.10 SEO/URL parity |
| 12.08.2026. | — | N7 feature pass: `/proizvodjac/[slug]`, attribute archives → `/pretraga`, wishlist/compare (+ `/yith-compare` 301), `/novosti` | 7.4/7.5 ažurirani; sledeće 7.6–7.10 |
| 12.08.2026. | — | N7 SEO parity: audit skripte + fix SSR/ISR; 5650 URL inventar + lokalni sample 155/155 OK | Milestone staging QA pre go-live; sledeće 7.11–7.12 |
| 12.08.2026. | — | N7 performanse (7.11–7.12): `next/font`; LCP prioriteti; **26 statičkih slika PNG→WebP (~23 MB uštede)**; `npm run compress:static-assets` | Nedelja 7 zatvorena; sledeće: Vercel Preview smoke → Nedelja 8 go-live |
| 12.08.2026. | — | Preview smoke: static 23/23 + parity 155/155 OK na `koncar-elektro-git-develop-…vercel.app`; robots/sitemap 200 | N7 staging milestone zatvoren |
| 12.08.2026. | — | N8 start: `docs/GO_LIVE.md`; 301 trailing-slash fix (`/placanje/` 404 → 301); `permanentRedirect` umesto 307 | Sledeće: ručni QA 8.1 + produkcijski RaiAccept 8.2 |
| 18.08.2026. | — | Društvene mreže: FB/IG/YT profili; TikTok → tiktok.com dok klijent ne dostavi profil | Header/footer + JSON-LD `sameAs` |
| 18.08.2026. | — | Prijava + registracija: WC v3 register; login/reset preko `wp-php/koncar-auth.php` (upload u WP root na stagingu); sesija httpOnly cookie | Header Odjava; checkout prefill + `customer_id` na porudžbini |
| 18.08.2026. | — | Kontakt forma: `wp-php/contact.php` → `wp_mail` na kontakt@koncarelektro.com | Demo toast uklonjen |
| 18.08.2026. | — | Recenzije proizvoda: WC v3 lista + submit (hold/odobrenje); 1 recenzija po e-mailu; empty state bez lažne 4.0 ocene | PDP recenzije žive |

---

## Sledeći koraci (action items)

### Sada — Nedelja 8 (nalozi / kontakt / recenzije 18.08.2026.)

**Prioritet — ti proveravaš**
- 8.1 — ručni QA na telefonu/desktopu (checklist u `docs/GO_LIVE.md`)
- 8.2 — produkcijski RaiAccept credentials + jedna realna test transakcija

**Pre DNS-a (env)**
- Production env: WP live URL, `WC_CHECKOUT_FORCE_TEST_CUSTOMER=false`, `NEXT_PUBLIC_ANALYTICS_LIVE=true` tek na Production
- Staging WP root: upload `koncar-elektro-store/wp-php/contact.php` + `koncar-auth.php` (ako još nisu) — login i kontakt forma zavise od toga; registracija i recenzije rade preko WC REST

**Ne sada**
- 8.3 DNS — tek kad su 8.1 + 8.2 zeleni
- 8.4 GSC sitemap — tek posle DNS-a

**Završeno — N8 gap fill (18.08.2026.)**
- Društvene mreže: [Facebook](https://www.facebook.com/koncar.shop.rs/), [Instagram](https://www.instagram.com/koncar_elektro/), [YouTube](https://www.youtube.com/@koncarelektroALATI); TikTok privremeno `tiktok.com`
- Prijava `/prijava`, registracija `/registracija`, reset lozinke — WP kupci; checkout veže nalog
- Kontakt forma → `kontakt@koncarelektro.com` (`contact.php` + `/api/contact`)
- Recenzije na PDP: prikaz, slanje (čeka odobrenje), jedna po e-mailu, empty state bez lažne ocene

**Završeno — Preview smoke (12.08.2026.)**
- `audit:seo-static-local` 23/23 OK
- `audit:seo-parity-local` 155/155 OK
- `robots.txt` + `sitemap.xml` 200 na Preview

**Završeno — N7 performanse (12.08.2026.)**
- 7.11–7.12 — `next/font`, LCP prioriteti, lazy loading, 26 slika PNG→WebP (~23 MB), `npm run compress:static-assets`

**Završeno — N7 SEO parity (12.08.2026.)**
- 7.6–7.10 — lokalni audit: statičke 23/23, sample 155/155 (GSC top + proizvodi/kategorije/taksonomije)
- Skripte: `npm run audit:seo-static-local`, `npm run audit:seo-parity-local`, `npm run audit:seo-url-gap`
- Fix-evi: ISR SSR za PDP/listing, `/proizvodjac/[slug]/page/[n]`, brand slug fallback, NovostiPage `use client`

**Završeno — N7 sadržaj (12.08.2026.)**
- 7.1/7.2 — zatvoreno (staging katalog unapređen; sync sa live nije potreban)
- 7.3 — kategorijski baneri iz WP/WC kategorija (`useHomepageCategoryBanners`)
- 7.4 — statičke + wishlist/compare + `/proizvodjac` + attribute → `/pretraga`
- 7.5 — `/novosti` (WP posts lista + empty state; single post van opsega)

**Ostaje otvoreno iz Nedelje 6 (ne blokira N7)**
- 6.9 — GTM Container ID (klijent odložio)
- 6.11 — 301 mapa zatvorena (namerni izuzeci + trailing slash)
- Na dan go-live-a: `NEXT_PUBLIC_ANALYTICS_LIVE=true` na Vercel Production (6.8); produkcijski RaiAccept credentials + realne transakcije (8.2)

**Završeno — Nedelja 6 test / deploy (07.08.2026.)**
- 6.2 sandbox + Vercel Preview: kartica (RaiAccept) i pouzeće OK
- WC: `processing` + Paid on (`set_paid`); način plaćanja „Kartica (RaiAccept)“
- Env napomena: RaiAccept password sa `$` escape na Vercel; Preview mora imati WP + payment metode + RaiAccept

**Završeno — Kartično plaćanje (05.08.2026.)**
- RaiAccept Code integration: auth → create order → payment session → redirect; webhook + status reconcile
- Checkout: kartica omogućena, checkbox Uslovi kupovine, `/placanje-odjava/rezultat`
- Brendiranje: Raiffeisen + Visa Secure + Mastercard ID Check (odvojeni od kartica)
- Compliance stranice: `/uslovi-kupovine`, `/nacin-placanja`, `/pravo-na-odustajanje`, `/reklamacije`, `/nacini-isporuke`

**Završeno — SEO tehnički sloj + GDPR (05.08.2026.)**
- JSON-LD: Product (cena/dostupnost/rating), BreadcrumbList (PDP + kategorije), Organization + WebSite (6.3–6.5)
- XML sitemap iz baseline indeksa (5.649 URL), robots.txt sa disallow za korpa/checkout/login (6.6–6.7)
- Cookie consent banner — redizajniran (mini naslov, prirodniji tekst, dugmad Prihvati/Odbij u donjem desnom uglu) + nova `/politika-privatnosti` stranica (6.10)
- GA4 infra + ecommerce eventi (view_item/add_to_cart/begin_checkout/purchase); pravi Measurement ID uveden, ali namerno ugašen do go-live-a (6.8)

**Završeno — Nedelja 5 (17.07.2026.)**
- Filteri (brend/cena/atributi) sa draft → Primeni / Poništi + badge-ovi
- Live pretraga, korpa, checkout (COD/BACS, Test Test, zahvala)
- Sticky Viber/WhatsApp/telefon; kontakt toast
- 5.9 callback: nije potreban posebno (kontakt + sticky dovoljni)

**Završeno — naknadni fix-evi (20.07.–30.07.2026., pre formalnog starta N6)**
- Shipping kalkulacija ispravljena + test
- Staging environment sa punim katalogom (CSV import) + CORS fix na API config
- Filteri: brend izdvojen/otvoren podrazumevano, mock podaci uklonjeni (100% live), skriveni nekorisni atributi

---

*Izvor: `Plan_Implementacije_KoncarElektro.pdf` · Superity · SUP-2025-931*
