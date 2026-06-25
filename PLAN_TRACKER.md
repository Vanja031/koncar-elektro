# Plan implementacije — Končar Elektro

**Projekat:** Migracija WooCommerce prodavnice na React / Next.js + WordPress Headless  
**Domen:** [koncarelektro.rs](https://koncarelektro.rs)  
**Klijent:** Končar Elektro  
**Ponuda:** SUP-2025-931  
**Trajanje:** 2 meseca (8 nedelja)  
**Datum plana:** 17.06.2026.  
**Poslednje ažuriranje trackera:** 25.06.2026.

> **STARI SAJT (live, WooCommerce):** [koncarelektro.rs](https://koncarelektro.rs) — ovo je sajt sa kojeg čuvamo SEO, URL-ove i podatke  
> **NOVI SAJT (u razvoju, nije okačen):** `koncar-elektro/koncar-elektro-store/` — React + Vite, lokalno, nije deployovan

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
| **Aktivna nedelja** | Nedelja 2 |
| **Sledeći korak** | 2.1 dizajn sistem → 2.2–2.6 ekrani (kategorija, proizvod, korpa, checkout, kontakt) → 2.7 routing mapa 1:1 |
| **Postojeći kod** | Inicijalni React dizajn u `koncar-elektro-store/` (Vite + React + shadcn/ui) — landing u `koncarelektro-landing.html` |
| **Ciljna arhitektura** | Next.js 14 (App Router) + WordPress Headless — migracija sa trenutnog Vite setupa |

### Brzi pregled napretka

| Faza | Nedelje | Završeno | U toku | Preostalo |
|------|---------|----------|--------|-----------|
| Mesec 1 — Priprema, SEO audit, jezgro | 1–4 | 1 | 1 | 2 nedelje |
| Mesec 2 — Funkcionalnosti, SEO parity, launch | 5–8 | 0 | 0 | 4 nedelje |
| **Ukupno** | **8** | **1** | **1** | **6** |

---

## Polazne tačke projekta

| # | Tačka | Status | Datum | Napomena |
|---|-------|--------|-------|----------|
| P1 | Inicijalni React dizajn stranice postoji — faza dizajna se skraćuje na finalizaciju | `[x]` | — | `koncar-elektro-store/`, `koncarelektro-landing.html` |
| P2 | Migracija sa postojeće WooCommerce prodavnice — podaci, kategorije, atributi, slug-ovi iz aktuelne baze | `[ ]` | | |
| P3 | Klijent obezbeđuje WP admin pristup + hosting/DNS + Google Search Console + GA | `[x]` | 22.06.2026. | Pristup primljen |
| P4 | Očuvanje SEO-a i svih putanja je prioritet #1 — URL adrese ostaju identične | `[ ]` | | Ugrađeno u svaku fazu |

---

## Strategija očuvanja SEO-a i putanja

Ove stavke su **kontinuirane** kroz ceo projekat — ne ostavljaju se za kraj.

| # | Strategija | Status | Datum | Napomena |
|---|-----------|--------|-------|----------|
| S1 | URL paritet 1:1 — Next.js routing prati sve postojeće putanje (proizvod, kategorija, statičke, blog) | `[ ]` | | Cilj: nula promenjenih adresa |
| S2 | Snimak pre migracije — crawl svih URL-ova, meta tagova, H1, canonical, structured data, sitemap | `[x]` | 22.06.2026. | `old-site/crawl/seo-baseline.csv` — referentna tačka za poređenje |
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
| 1.7 | Pun crawl postojeće prodavnice — izvoz svih URL-ova (proizvodi, kategorije, stranice, blog) | `[x]` | 22.06.2026. | 5.650 unique URL-ova; output: `old-site/crawl/seo-baseline.csv` |
| 1.8 | Snimak trenutnog SEO stanja: meta tagovi, H1, canonical, structured data | `[x]` | 22.06.2026. | title, meta desc, H1, canonical za svih 5.650 URL-ova; 3.770 URL-ova sa SEO issues — vidi `seo-baseline-errors.csv` |
| 1.9 | Snimak XML sitemap-a, robots.txt, postojećih redirect-a | `[x]` | 22.06.2026. | `old-site/robots.txt` sačuvan; sitemap radi u browseru (vidi `old-site/sitemap-status.md`); sitnica: http→https u Yoast |
| 1.10 | Baseline organskog saobraćaja i rangiranja (GSC + GA) za kasnije poređenje | `[x]` | 22.06.2026. | GSC export: `koncarelektro.rs-Performance-on-Search-2026-06-22/` (Queries, Pages, Chart, Devices, Countries); GA4: `Traffic_acquisition_...csv` — organic: 7.666 ses/28d, 646k RSD prihod |
| 1.11 | Analiza WooCommerce permalink strukture (npr. `/proizvod/`, `/kategorija-proizvoda/`) | `[x]` | 22.06.2026. | Dokumentovano u `old-site/permalink-structure.md` — proizvodi: `/prodavnica/%product_cat%/[slug]/`, kategorije: `/product-category/`, brendovi: `/brend/` |

**Milestone (kraj Nedelje 1):** URL inventar + SEO baseline izveštaj predati klijentu na uvid.

| Milestone | Status | Datum | Napomena |
|-----------|--------|-------|----------|
| URL inventar + SEO baseline (interno) | `[x]` | 25.06.2026. | Crawl + baseline u `old-site/crawl/` |
| Slanje izveštaja klijentu | `[—]` | | Odloženo — ne šalje se još |

---

## Nedelja 2 — Dizajn, arhitektura i URL mapiranje

| # | Zadatak | Status | Datum | Napomena |
|---|---------|--------|-------|----------|
| 2.1 | Finalizacija postojećeg React dizajna — dizajn sistem (boje, tipografija, komponente) | `[~]` | | Delimično postoji u `koncar-elektro-store/` |
| 2.2 | Dizajn preostalih ekrana: kategorija | `[ ]` | | |
| 2.3 | Dizajn preostalih ekrana: proizvod | `[ ]` | | |
| 2.4 | Dizajn preostalih ekrana: korpa | `[ ]` | | |
| 2.5 | Dizajn preostalih ekrana: checkout | `[ ]` | | |
| 2.6 | Dizajn preostalih ekrana: kontakt | `[ ]` | | |
| 2.7 | Definisanje Next.js routing mape koja 1:1 prati postojeće putanje | `[ ]` | | |
| 2.8 | Plan očuvanja meta podataka i canonical-a (meta parity plan) | `[ ]` | | |
| 2.9 | Postavka staging okruženja | `[ ]` | | |
| 2.10 | Postavka repozitorijuma | `[ ]` | | |
| 2.11 | Postavka CI/CD skeleta | `[ ]` | | |

**Milestone (kraj Nedelje 2):** Odobrenje finalnog dizajna i URL routing mape pre početka razvoja.

| Milestone | Status | Datum | Napomena |
|-----------|--------|-------|----------|
| Odobren finalni dizajn | `[ ]` | | |
| Odobrena URL routing mapa | `[ ]` | | |

---

## Nedelja 3 — WP Headless backend i REST API

| # | Zadatak | Status | Datum | Napomena |
|---|---------|--------|-------|----------|
| 3.1 | Konfiguracija WordPress-a kao headless backend | `[ ]` | | |
| 3.2 | REST API setup | `[ ]` | | |
| 3.3 | CPT/ACF konfiguracija gde je potrebno | `[ ]` | | |
| 3.4 | WooCommerce Store API konfiguracija | `[ ]` | | |
| 3.5 | Mapiranje atributa iz postojeće baze | `[ ]` | | |
| 3.6 | Mapiranje kategorija iz postojeće baze | `[ ]` | | |
| 3.7 | Mapiranje taksonomija iz postojeće baze | `[ ]` | | |
| 3.8 | Endpoint-i za proizvode | `[ ]` | | |
| 3.9 | Endpoint-i za kategorije | `[ ]` | | |
| 3.10 | Endpoint-i za filtere | `[ ]` | | |
| 3.11 | Endpoint-i za pretragu | `[ ]` | | |
| 3.12 | Očuvanje slug-ova proizvoda — ključno za 1:1 URL parity | `[ ]` | | |
| 3.13 | Očuvanje slug-ova kategorija — ključno za 1:1 URL parity | `[ ]` | | |

---

## Nedelja 4 — Razvoj jezgra frontenda

| # | Zadatak | Status | Datum | Napomena |
|---|---------|--------|-------|----------|
| 4.1 | Postavka Next.js 14 (App Router, SSR/SSG) | `[ ]` | | Trenutno: Vite + React — potrebna migracija |
| 4.2 | Globalni layout | `[ ]` | | |
| 4.3 | Header | `[ ]` | | |
| 4.4 | Footer | `[ ]` | | |
| 4.5 | Navigacija | `[ ]` | | |
| 4.6 | Početna stranica | `[~]` | | Postoji `Index.tsx` — potrebna adaptacija za Next.js |
| 4.7 | Dinamičke rute za kategorije po postojećim slug-ovima | `[ ]` | | |
| 4.8 | Dinamičke rute za proizvode po postojećim slug-ovima | `[ ]` | | |
| 4.9 | Povezivanje sa REST API-jem | `[ ]` | | |
| 4.10 | ISR za 5.000+ proizvoda | `[ ]` | | |
| 4.11 | Per-page meta tagovi: title | `[ ]` | | Mapirani iz postojećih |
| 4.12 | Per-page meta tagovi: description | `[ ]` | | |
| 4.13 | Per-page meta tagovi: canonical | `[ ]` | | |
| 4.14 | Per-page meta tagovi: OG (Open Graph) | `[ ]` | | |

**Deliverable (kraj Meseca 1):**

| Deliverable | Status | Datum | Napomena |
|-------------|--------|-------|----------|
| Odobren dizajn | `[ ]` | | |
| URL routing mapa (1:1) | `[ ]` | | |
| Funkcionalan REST API sa pravim podacima | `[ ]` | | |
| Jezgro sajta na stagingu (početna, kategorije, proizvodi) | `[ ]` | | |

---

# MESEC 2 — Funkcionalnosti, SEO parity i lansiranje

**Nedelje 5–8**  
**Deliverable meseca 2:** Sajt je živ, sve funkcionalnosti rade, SEO i sve putanje očuvani 1:1, izvorni kod predat i tim obučen za WordPress admin panel.

---

## Nedelja 5 — E-commerce funkcionalnosti

| # | Zadatak | Status | Datum | Napomena |
|---|---------|--------|-------|----------|
| 5.1 | Napredni filteri — brend | `[ ]` | | |
| 5.2 | Napredni filteri — cena | `[ ]` | | |
| 5.3 | Napredni filteri — atributi | `[ ]` | | |
| 5.4 | Napredni filteri — performanse | `[ ]` | | |
| 5.5 | Live pretraga | `[ ]` | | |
| 5.6 | Korpa | `[ ]` | | |
| 5.7 | Kompletan checkout flow | `[ ]` | | |
| 5.8 | Sticky kontakti | `[ ]` | | |
| 5.9 | Callback forma | `[ ]` | | |
| 5.10 | WhatsApp / Viber dugme | `[ ]` | | |

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
| Kraj Nedelje 2 | Finalni dizajn + URL routing mapa | `[ ]` | | |
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
| 22.06.2026. | — | Crawl završen (1.7+1.8): 5.650 URL-ova, 3.770 sa SEO issues; `old-site/crawl/seo-baseline.csv` + `seo-baseline-errors.csv` | Referentni snimak sačuvan |
| 25.06.2026. | — | Nedelja 1 zatvorena: papiri sa bankom pokrenuti (1.6); interni SEO baseline kompletan | Prelazak na Nedelju 2 |
| 25.06.2026. | — | Slanje SEO izveštaja klijentu odloženo po odluci tima | Milestone klijentskog odobrenja preskočen za sada |

---

## Sledeći koraci (action items)

### Sada — Nedelja 2, dizajn i arhitektura

**Prioritet 1 — Dizajn sistem (2.1)**
- Finalizuj boje, tipografiju i shared komponente u `koncar-elektro-store/`
- Uskladi postojeći `Index.tsx` sa dizajn sistemom

**Prioritet 2 — Ekrani (2.2–2.6)**
1. Kategorija — listing, filteri, paginacija
2. Proizvod — galerija, atributi, CTA
3. Korpa
4. Checkout
5. Kontakt

**Prioritet 3 — Arhitektura (2.7–2.8)**
- Definiši Next.js routing mapu 1:1 na osnovu `old-site/permalink-structure.md`
- Napiši meta parity plan (title, description, canonical po tipu stranice)

**Prioritet 4 — Infrastruktura (2.9–2.11)**
- Staging okruženje
- Repo setup
- CI/CD skeleton

**Milestone kraj Nedelje 2:** odobren finalni dizajn + URL routing mapa

---

*Izvor: `Plan_Implementacije_KoncarElektro.pdf` · Superity · SUP-2025-931*
