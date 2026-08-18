# Go-live runbook — Končar Elektro

**Domen:** [koncarelektro.rs](https://koncarelektro.rs)  
**Novi frontend:** Vercel (`develop` → Preview, Production kad se DNS prebaci)  
**Preview (proveren 12.08.2026.):** https://koncar-elektro-git-develop-koncar-vanjas-projects-3b3004c6.vercel.app/

Live shop ostaje izvor istine dok se DNS eksplicitno ne prebaci. Vidi [LIVE_SHOP_SAFETY.md](./LIVE_SHOP_SAFETY.md).

---

## Šta je već zatvoreno (pre DNS-a)

| Stavka | Rezultat |
|--------|----------|
| SEO static audit na Preview | 23/23 OK |
| SEO parity sample na Preview | 155/155 OK |
| `robots.txt` | 200; `Sitemap: https://koncarelektro.rs/sitemap.xml` |
| `sitemap.xml` | 200 (baseline ~5.649 URL-ova) |
| Canonical | uvek `https://koncarelektro.rs/.../` (ne Preview host) |
| Sandbox kartica + pouzeće | OK na Preview (07.08.2026.) |
| Društvene mreže (FB / IG / YT) | povezane; TikTok privremeno tiktok.com |
| Prijava / registracija | kod spreman; login zahteva `koncar-auth.php` na WP root |
| Kontakt forma | `contact.php` → kontakt@koncarelektro.com |
| Recenzije proizvoda | WC v3; 1 recenzija po e-mailu |

---

## 1. Pre DNS-a (obavezno)

### Vercel Production env

Prebaciti sa staging WP na **live** WP, pa tek onda DNS.

| Env | Staging (sada) | Production (go-live) |
|-----|----------------|----------------------|
| `NEXT_PUBLIC_WP_API_URL` | `https://testing.cleannikki.com/wp-json` | `https://koncarelektro.rs/wp-json` |
| `NEXT_PUBLIC_WC_STORE_API_URL` | staging Store API | `https://koncarelektro.rs/wp-json/wc/store/v1` |
| `WP_REWRITE_ORIGIN` | staging origin | `https://koncarelektro.rs` |
| `WC_CONSUMER_KEY` / `SECRET` | staging write ključevi | **live** write ključevi (server-only) |
| `WC_LIVE_CHECKOUT` | `true` | `true` |
| `WC_CHECKOUT_FORCE_TEST_CUSTOMER` | `true` | **`false`** |
| `RAIACCEPT_ENV` | `sandbox` | **`production`** |
| `RAIACCEPT_USERNAME` / `PASSWORD` | sandbox | **produkcijski** Merchant portal |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-2HJ9BTPBK7` | isto |
| `NEXT_PUBLIC_ANALYTICS_LIVE` | `false` | **`true`** (samo Production) |
| `NEXT_PUBLIC_GTM_ID` | prazno | kad klijent dostavi Container ID |

Napomena: ako RaiAccept lozinka sadrži `$`, na Vercel-u escape kao `\$`.

### WP / WooCommerce (live)

- [ ] CORS dozvoljava Vercel Production origin (i `koncarelektro.rs` posle DNS-a)
- [ ] Payment metode: RaiAccept + pouzeće (COD) aktivne
- [ ] WC REST v3 ključ sa Write samo na serveru (nikad `NEXT_PUBLIC_`)
- [ ] Backup WP baze pre cutover-a
- [ ] `contact.php` + `koncar-auth.php` u WP root (iz `koncar-elektro-store/wp-php/`) — staging sada, live na cutover

### Ručni QA na Preview (8.1)

Otvoriti Preview na telefonu + desktop (Chrome, Safari/iOS, Edge):

- [ ] Početna, top kategorija, PDP, korpa, checkout forma
- [ ] Lista želja, uporedi, novosti, kontakt, uslovi
- [ ] Cookie banner (Prihvati / Odbij)
- [ ] Mobilni meni + pretraga
- [ ] Prijava / registracija / odjava
- [ ] Kontakt forma (stvarni mejl)
- [ ] Recenzija na PDP (jedna po nalogu)
- [ ] Društvene mreže u headeru/footeru

### Plaćanje (8.2) — čeka produkcijske kredencijale

Sandbox je već OK. Pre DNS-a, na Production env (još uvek na Preview/alias, **ne** na live domenu):

- [ ] Jedna test kartična transakcija (mala suma) → WC `processing` + `set_paid`
- [ ] Jedna pouzeće porudžbina
- [ ] Thank-you / `/placanje-odjava/order-received/`

---

## 2. Dan go-live (8.3)

Redosled je bitan. **Ne dirati DNS dok Production env + payment nisu zeleni.**

1. Merge `develop` → Production branch / promote Preview u Production
2. Potvrdi Production env (tabela gore)
3. Smoke na Production URL-u (još uvek `*.vercel.app`): `/`, PDP, `/sitemap.xml`, `/robots.txt`
4. DNS: `koncarelektro.rs` + `www` → Vercel
5. Sačekaj SSL (Vercel)
6. Odmah posle DNS-a:
   - [ ] `https://koncarelektro.rs/` 200
   - [ ] `https://www.koncarelektro.rs/` → kanonski host
   - [ ] `/sitemap.xml` 200
   - [ ] `/robots.txt` 200 + `Sitemap: https://koncarelektro.rs/sitemap.xml`
7. Uključi analitiku: `NEXT_PUBLIC_ANALYTICS_LIVE=true` (ako već nije na Production)
8. GSC: submit `https://koncarelektro.rs/sitemap.xml` (8.4)

### Rollback (ako nešto pukne)

1. DNS A/CNAME vrati na stari hosting (live WooCommerce tema)
2. Ne briši Vercel projekat — Preview ostaje za dijagnostiku
3. WP/katalog na live-u ne rollback-ovati osim ako je write API nešto pokvario (backup)

---

## 3. Posle DNS-a (prvi dani)

| # | Akcija |
|---|--------|
| 8.4 | GSC → Sitemaps → `https://koncarelektro.rs/sitemap.xml` |
| 8.5 | Sample 200/301: početna, top 10 GSC URL-ova, `/yith-compare/` → `/uporedite/`, `/snaga/{slug}/` → `/pretraga/` |
| 8.6 | GSC Coverage / Page indexing — 24–72h |
| 8.7 | GSC crawl greške + Vercel logs |
| 8.8 | Uporediti rangiranje vs `docs/gsc-export-2026-06-22/` |

---

## 4. 301 mapa (izuzeci — namerno)

Kanonske putanje ostaju 1:1. Redirecti samo gde stari URL više nije listing:

| Iz | Na |
|----|----|
| `/yith-compare/` | `/uporedite/` |
| `/snaga/:slug/` | `/pretraga/?attr=pa_snaga&term=:slug` |
| `/uvoznik/:slug/` | `/pretraga/?attr=pa_uvoznik&term=:slug` |
| `/zemlja-porekla/:slug/` | `/pretraga/?attr=pa_zemlja-porekla&term=:slug` |
| `/placanje/` | `/placanje-odjava/` |
| `/placanje/hvala/` | `/placanje-odjava/order-received/` |
| `/kategorija/...` (dev-era) | WC `/product-category/...` ili `/proizvodi/` |

Implementacija: `vercel.json` (sa i bez trailing slash) + Next `permanentRedirect` fallback.

---

## 5. Šta još čeka klijenta

- GTM Container ID (6.9) — nije bloker; GA4 je spreman
- Produkcijski RaiAccept credentials (8.2)
- DNS pristup / dogovoreno vreme cutover-a (8.3)
- GSC nalog za submit sitemap-a (8.4)
