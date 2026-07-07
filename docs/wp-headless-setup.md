# WordPress Headless — setup (Nedelja 3)

**Datum probe:** 06.07.2026.  
**Live backend:** [koncarelektro.rs](https://koncarelektro.rs) (WooCommerce + WordPress)

> ⚠️ **Live shop mora ostati netaknut.** Sva podešavanja na WP-u su read-only ili aditivna (headeri, API ključevi). Vidi [LIVE_SHOP_SAFETY.md](./LIVE_SHOP_SAFETY.md).

---

## Rezime probe API-ja

| Endpoint | Auth | Status | Namena |
|----------|------|--------|--------|
| `GET /wp-json/` | Ne | ✅ 200 | Discovery, namespaces |
| `GET /wp-json/wp/v2/pages` | Ne | ✅ 200 | Statičke stranice (korpa, kontakt, …) |
| `GET /wp-json/wc/store/v1/products` | Ne | ✅ 200 | **Katalog proizvoda (frontend)** |
| `GET /wp-json/wc/store/v1/products/categories` | Ne | ✅ 200 | **Kategorije (frontend)** |
| `GET /wp-json/wc/v3/products` | Da (API key) | 🔒 401 | Bulk sync, admin, meta polja |
| `GET /wp-json/wc/v3/products/categories` | Da (API key) | 🔒 401 | Puna hijerarhija + meta |

**Zaključak:** Za čitanje kataloga koristimo **WooCommerce Store API** (javno). Za sinhronizaciju 5.000+ proizvoda i pristup svim meta poljima potrebni su **WooCommerce REST API ključevi** (vidi ispod).

---

## Arhitektura

```
┌─────────────────────┐     Store API (read)      ┌──────────────────────┐
│  React / Next.js    │ ──────────────────────────► │  koncarelektro.rs    │
│  koncar-elektro-    │     WC REST v3 (sync)       │  WordPress + WC      │
│  store              │ ──────────────────────────► │  (headless CMS)      │
└─────────────────────┘     Cart / checkout         └──────────────────────┘
```

- **WordPress** ostaje CMS + izvor podataka (proizvodi, kategorije, stranice).
- **Frontend** čita katalog preko Store API-ja; korpa/checkout preko Store API cart endpointa.
- **WC REST v3** za build-time sync, ISR, ili server-side pozive (Next.js) gde treba pun pristup.

---

## 3.1 — Konfiguracija WP kao headless backend

### Šta je već OK na live sajtu

- REST API je uključen (`/wp-json/` vraća namespaces: `wc/v3`, `wc/store`, `wp/v2`, …).
- Store API radi bez autentifikacije za čitanje.
- LiteSpeed cache na API odgovorima (paziti pri dev/testiranju).

### Šta treba uraditi u WP adminu (klijent / hosting)

| # | Akcija | Gde | Zašto |
|---|--------|-----|-------|
| 1 | **Kreirati WC REST API ključ** | WooCommerce → Podešavanja → Napredno → REST API | Read pristup za sync i meta (3.2) |
| 2 | **CORS za frontend domene** | Plugin (npr. *WP CORS*) ili LiteSpeed/nginx | Browser pozivi sa `localhost:8080` i Vercel staging domena — **ne utiče na live shop** (vidi LIVE_SHOP_SAFETY) |
| 3 | **Dozvoliti Store API cart headere** | CORS config | `Cart-Token`, `Nonce` za korpu (3.4) |
| 4 | **Staging strategija** (opciono) | Hosting | Subdomen za test pre go-live; ili read-only sa produkcije |
| 5 | **Yoast meta u REST** | Yoast SEO → Integrations | `_yoast_wpseo_title`, description u API odgovorima (nedelja 4) |

### CORS — trenutno stanje

Plugin je **instaliran i podešen, još nije aktiviran** — ispravno, prvo proveravamo.

Probe sa `Origin: http://localhost:8080` **nije vratio** `Access-Control-Allow-Origin` dok plugin nije aktivan.  
**Dev rešenje:** Vite proxy (`/wp-json` → `koncarelektro.rs`) — već podešeno u `vite.config.ts`.  
**Staging/produkcija:** Aktivirati CORS plugin po checklist-u u [LIVE_SHOP_SAFETY.md](./LIVE_SHOP_SAFETY.md#cors—bezbedno-uključivanje).

**Važno:** Uključivanje CORS-a **ne menja** kako kupci koriste koncarelektro.rs — samo dozvoljava novom React sajtu da čita API iz browsera.

---

## 3.2 — REST API setup

### WooCommerce REST API ključevi

1. WP Admin → **WooCommerce** → **Settings** → **Advanced** → **REST API** → **Add key**
2. Opis: `Koncar Elektro Headless — Read`
3. Korisnik: admin nalog
4. Permissions: **Read** (za katalog); poseban **Read/Write** kasnije za narudžbine ako treba
5. Kopirati **Consumer key** i **Consumer secret** u lokalni `.env` (ne commitovati)

```env
VITE_WC_CONSUMER_KEY=ck_xxxxxxxx
VITE_WC_CONSUMER_SECRET=cs_xxxxxxxx
```

> **Napomena:** Secret u browseru nije idealan. Za produkciju, WC v3 pozive raditi sa servera (Next.js API route / ISR). Za sada ključevi služe za dev probe i build skripte.

### Korisni endpointi

| Endpoint | Primer |
|----------|--------|
| Proizvodi (paginacija) | `GET /wp-json/wc/v3/products?per_page=100&page=1` |
| Proizvod po slug-u | `GET /wp-json/wc/v3/products?slug=...` |
| Kategorije | `GET /wp-json/wc/v3/products/categories?per_page=100` |
| Atributi | `GET /wp-json/wc/v3/products/attributes` |
| Stranice | `GET /wp-json/wp/v2/pages?per_page=100` |

Paginacija: headeri `X-WP-Total`, `X-WP-TotalPages`.

### Probe skripta

```bash
cd koncar-elektro-store
npm run probe:wp-api
```

---

## 3.3 — CPT / ACF (audit potreban)

Pre implementacije potrebna provera u WP adminu:

- [ ] Da li postoje **ACF grupe** na proizvodima (dodatna polja)?
- [ ] Custom taxonomije: `/brend/`, `/proizvodjac/`, `/product-tag/`
- [ ] YITH Compare / Wishlist — da li treba u API-ju?
- [ ] Product attributes (snaga, voltaza, …) — mapirati u filtere (3.5)

**Akcija za klijenta:** screenshot ili export ACF field groups + lista aktivnih pluginova koji utiču na proizvode.

---

## 3.4 — WooCommerce Store API

Javni endpointi (bez auth za čitanje):

| Resurs | Endpoint |
|--------|----------|
| Proizvodi | `/wp-json/wc/store/v1/products` |
| Kategorije | `/wp-json/wc/store/v1/products/categories` |
| Korpa | `/wp-json/wc/store/v1/cart` |
| Dodaj u korpu | `POST /wp-json/wc/store/v1/cart/add-item` |

Cene u Store API-ju su u **minor units** (npr. `34000` + `currency_minor_unit: 2` = **340,00 RSD**).

Cart zahteva **CORS** + `Cart-Token` header (session) — konfigurisati pre povezivanja `CartContext`.

---

## Env varijable (frontend)

Kopirati `koncar-elektro-store/.env.example` → `.env.local`:

```env
VITE_WP_API_URL=https://koncarelektro.rs/wp-json
VITE_WC_STORE_API_URL=https://koncarelektro.rs/wp-json/wc/store/v1
# Opciono — samo za probe/sync skripte, ne za browser u produkciji:
VITE_WC_CONSUMER_KEY=
VITE_WC_CONSUMER_SECRET=
```

U dev modu, app koristi Vite proxy (`/wp-json`) da zaobiđe CORS.

---

## API sloj u kodu

```
koncar-elektro-store/src/lib/api/
├── config.ts          # base URL-ovi
├── client.ts          # fetch wrapper + paginacija
├── errors.ts
├── types/wc-store.ts  # Store API tipovi
├── wc-store/
│   ├── products.ts
│   └── categories.ts
└── mappers/
    └── product.ts     # Store → KoncarCatalogProduct
```

Prvi React Query hook: `src/hooks/api/useStoreProduct.ts` (POC).

---

## Checklist — šta ko radi

### Ti (klijent / WP admin)

- [ ] Kreirati **WC REST API ključ** (Read) i proslediti Consumer key + secret
- [ ] Instalirati/konfigurisati **CORS** za `localhost:8080` + Vercel staging URL
- [ ] Potvrditi listu aktivnih plugina i ACF polja na proizvodima
- [ ] (Opciono) Staging subdomen ako ne želimo direktno sa produkcije

### Mi (dev)

- [x] Probe live API-ja (06.07.2026.)
- [x] Dokumentacija (`wp-headless-setup.md`)
- [x] `.env.example` + API client sloj
- [x] Vite dev proxy
- [ ] Povezati kategorije/proizvode na Store API (3.8–3.9)
- [ ] Cart preko Store API (3.4, nedelja 5)

---

*Povezano: [PLAN_TRACKER.md](./PLAN_TRACKER.md) · [url-routing-map.md](./url-routing-map.md) · [permalink-structure.md](./permalink-structure.md)*
