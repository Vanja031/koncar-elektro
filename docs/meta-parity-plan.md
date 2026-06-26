# Meta parity plan — Končar Elektro

**Datum:** 26.06.2026.  
**Referenca:** [crawl/seo-baseline.csv](./crawl/seo-baseline.csv) (5.650 URL-ova, baseline 22.06.2026.)  
**Cilj:** Svaki indeksirani URL zadrži ekvivalentan ili bolji SEO signal posle migracije.

---

## Trenutno stanje starog sajta (sažetak)

| Signal | Stanje na starom sajtu |
|--------|------------------------|
| Title | Prisutan na većini stranica; često predugačak (`TITLE_TOO_LONG`) |
| Meta description | Često **nedostaje** na kategorijama i statičkim stranicama |
| H1 | Nedostaje na početnoj, akciji, kontaktu |
| Canonical | Često `?page_id=…` umesto čistog URL-a (`CANONICAL_MISMATCH`) |
| Structured data | Product schema na proizvodima (Yoast/WooCommerce) |

> Migracija je prilika da **popravimo** poznate probleme, uz zadržavanje URL-ova i ključnih ključnih reči u title/H1.

---

## Šabloni po tipu stranice

### Početna (`/`)

| Polje | Šablon | Stari primer |
|-------|--------|--------------|
| Title | `Končar Elektro - Prodaja alata i mašina renomiranih brendova` | Isti (60 znakova) |
| Meta desc | Končar Elektro - Prodaja alata… Makita, Bosch, Metabo… | 138 znakova |
| H1 | `Končar Elektro` ili hero naslov | **Dodati** — trenutno nema H1 |
| Canonical | `https://koncarelektro.rs/` | |

### Proizvod (`/prodavnica/.../slug/`)

| Polje | Šablon |
|-------|--------|
| Title | `{naziv proizvoda} cena \| Kupovina online - Končar Elektro -trgovina električnog, ručnog alata i pribora` |
| Meta desc | `Pogledajte {naziv} po najboljoj ceni. Brza dostava i kupovina online. Garancija i podrška u Srbiji.` |
| H1 | `{naziv proizvoda}` (kratko, bez sufiksa) |
| Canonical | Pun URL proizvoda sa kategorijom |
| JSON-LD | `Product` + `Offer` (cena, valuta RSD, availability) |

**Izvor podataka (nedelja 3+):** WP REST `products`, polja Yoast.

### Kategorija (`/product-category/.../`)

| Polje | Šablon |
|-------|--------|
| Title | `{naziv kategorije} - Končar Elektro -trgovina električnog, ručnog alata i pribora` |
| Meta desc | Generisati ako nedostaje: `Ponuda {kategorija} — brendovi, brza dostava, garancija. Končar Elektro Leskovac.` |
| H1 | `{naziv kategorije}` |
| Canonical | Pun URL kategorije |
| JSON-LD | `CollectionPage` + `BreadcrumbList` |

### Akcija (`/akcija/`)

| Polje | Šablon |
|-------|--------|
| Title | `Akcija - Končar Elektro -trgovina električnog, ručnog alata i pribora` |
| Meta desc | Dodati: proizvodi na popustu, sortirano po uštedi |
| H1 | `Akcija` — **dodati** |

### Statičke (`/o-nama/`, `/kontakt/`, …)

| Polje | Pravilo |
|-------|---------|
| Title | Zadržati postojeći ili skratiti ispod ~60 znakova |
| Meta desc | Napisati jedinstvene opise (trenutno često prazno) |
| H1 | Jedan jasan H1 po stranici |
| Canonical | Čist path URL, ne `?page_id=` |

### Korpa / checkout (`/korpa`, `/placanje-odjava`)

| Polje | Pravilo |
|-------|---------|
| `robots` | `noindex, follow` (standard za checkout) |
| Title | `Korpa \| Končar Elektro` / `Plaćanje / Odjava \| Končar Elektro` |

---

## Implementacioni plan

| Faza | Zadatak | Status |
|------|---------|--------|
| 2.8 | Ovaj dokument | `[x]` |
| 3.x | `react-helmet-async` ili migracija na Next.js `metadata` | `[ ]` |
| 3.x | Učitavanje title/desc iz WP za proizvode i kategorije | `[ ]` |
| 4.x | JSON-LD komponente (`ProductJsonLd`, `BreadcrumbJsonLd`) | `[ ]` |
| Pre launch | Skripta: uporedi `seo-baseline.csv` ↔ novi crawl | `[ ]` |

---

## Parity checklist (pre go-live)

Za svaki URL iz `seo-baseline.csv`:

- [ ] HTTP 200 (ili namerni 301 samo po izuzetku)
- [ ] Title sadrži ključne reči starog title-a
- [ ] Meta description postoji (ili je namerno poboljšan)
- [ ] Jedan H1
- [ ] Canonical = self URL (HTTPS, bez query stringa)
- [ ] Breadcrumb logika odgovara hijerarhiji kategorija

Alat za poređenje: diff `seo-baseline.csv` vs post-launch crawl → `seo-parity-report.csv`.

---

## Prioritetne stranice (GSC top traffic)

Fokus parity provere na URL-ovima iz [gsc-export-2026-06-22/Pages.csv](./gsc-export-2026-06-22/Pages.csv) — posebno:

- Top kategorije (`/product-category/...`)
- Top proizvodi (`/prodavnica/...`)
- `/`, `/akcija/`, `/kontakt/`, `/o-nama/`
