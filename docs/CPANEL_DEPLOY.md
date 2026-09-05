# Deploy na klijentov cPanel (bez Vercela)

**Cilj:** Next.js app iz `koncar-elektro-store/` radi na `koncarelektro.rs`, hostovano na
klijentovom cPanel nalogu (isti hosting kao WordPress). Ništa ne ostaje na Superity
Vercel nalogu. WordPress (`/wp-admin`, `/wp-json`, `/wp-content`, `/wp-includes`) i
dalje radi normalno na istom domenu — samo se front-end (sve ostale putanje) preusmerava
na Next.js.

Radimo u 2 faze: **Faza A** — test na subdomenu (ništa ne dodiruje live sajt).
**Faza B** — cutover glavnog domena (posle tvoje potvrde da Faza A radi).

---

## Faza A — test na subdomenu

### A1. Node.js verzija — ✅ potvrđeno

Ponuđeno: 22.23.2 (recommended), 20.20.2, 18.20.8, 19.9.0, 24.19.0... → koristimo **22.23.2 (recommended)**.

### A2. Test subdomen — ✅ potvrđeno: `app.koncarelektro.rs`

1. cPanel → **Subdomains** → kreiraj `app.koncarelektro.rs` (ako već ne postoji).
2. Document root koji cPanel predloži je OK — Node.js App će ga kontrolisati kad ga povežemo u A5.

### A3. (nije potreban lokalni build — build se radi direktno na serveru u A6, preko Terminal-a)

### A4. Kloniranje koda preko Terminal-a (imamo pristup — brže od upload-a)

Repo je javan na GitHub-u, pa nema potrebe za kredencijalima. U cPanel **Terminal**:

```bash
cd ~
git clone https://github.com/Vanja031/koncar-elektro.git
```

Ovo pravi `~/koncar-elektro/koncar-elektro-store` sa svim kodom (uključujući `server.cjs`).

### A5. Kreiranje Node App-a u cPanel-u

U **Setup Node.js App → Create Application**:

| Polje | Vrednost |
|---|---|
| Node.js version | **22.23.2 (recommended)** |
| Application mode | Production |
| Application root | `koncar-elektro/koncar-elektro-store` |
| Application URL | `app.koncarelektro.rs` |
| Application startup file | `server.cjs` |

Klikni **Create**.

### A6. Instalacija paketa + build + env varijable

Nakon kreiranja, cPanel prikazuje komandu tipa:
```
source /home/USERNAME/nodevenv/koncar-elektro/koncar-elektro-store/22/bin/activate && cd /home/USERNAME/koncar-elektro/koncar-elektro-store
```
Kopiraj TU TAČNU komandu (sa svoje cPanel stranice) i pokreni je u **Terminal**-u — ona aktivira ispravnu Node/npm verziju u PATH-u.

Zatim, u istom Terminal-u:

```bash
npm ci
npm run build
```

(`npm run build` mora da se pokrene NAKON što su env varijable iz koraka 2 ispod postavljene — Next.js "peče" `NEXT_PUBLIC_*` vrednosti u build, ne mogu se menjati posle bez rebuild-a.)

Redosled dakle: prvo postavi env varijable u UI-u (sledeći korak), restartuj app da ih App pokupi, ZATIM `npm run build` u Terminal-u.

Na stranici te aplikacije u cPanel-u (**Setup Node.js App**):

1. U sekciji **Environment variables**, dodaj (kopiraj iz `koncar-elektro-store/.env`, samo produkcijske vrednosti):
   - `NODE_ENV=production`
   - `NEXT_PUBLIC_WP_API_URL=https://koncarelektro.rs/wp-json`
   - `NEXT_PUBLIC_WC_STORE_API_URL=https://koncarelektro.rs/wp-json/wc/store/v1`
   - `WP_REWRITE_ORIGIN=https://koncarelektro.rs`
   - `WC_CONSUMER_KEY=...` (live, write ključ — server-only, **nikad** sa `NEXT_PUBLIC_` prefiksom)
   - `WC_CONSUMER_SECRET=...`
   - `WC_LIVE_CHECKOUT=true`
   - `WC_CHECKOUT_FORCE_TEST_CUSTOMER=false`
   - `RAIACCEPT_ENV=production` (tek kad imamo produkcijske kredencijale — do tada `sandbox`)
   - `RAIACCEPT_USERNAME` / `RAIACCEPT_PASSWORD`
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-2HJ9BTPBK7`
   - `NEXT_PUBLIC_ANALYTICS_LIVE=false` (na testu; `true` samo na finalnom cutover-u)

   ⚠️ Postavi ove vrednosti PRE `npm run build` — `NEXT_PUBLIC_*` se "peče" u build i ne menja se posle bez rebuild-a.

2. Klikni **Save**, zatim **Restart** na aplikaciji.
3. Vrati se u Terminal i pokreni `npm ci && npm run build` (iz A6 gore).
4. Klikni **Restart** još jednom (da app krene sa svežim `.next/` build-om).

### A7. Test

1. Otvori `https://app.koncarelektro.rs/` — treba da vidiš novi sajt (Next.js).
2. Provuci par proizvoda, korpu, kontakt formu.
3. Provera da WP i dalje radi normalno na glavnom domenu (`koncarelektro.rs/wp-admin` mora ostati netaknuto — ovo ne bi trebalo da si dirao u ovoj fazi).

Kad ovo radi, javi mi — prelazimo na Fazu B.

---

## Faza B — Cutover glavnog domena (`koncarelektro.rs`)

**Preduslov:** Faza A testirana i potvrđena. Fresh backup baze + fajlova (kao i pre).

Ovo je osetljiviji korak jer glavni domen trenutno servira WordPress direktno iz
`public_html/`. Rešenje: **Node.js App na istom URL-u** (`koncarelektro.rs`, root path),
uz ručnu dopunu `.htaccess`-a da WP putanje (`/wp-admin`, `/wp-json`, `/wp-content`,
`/wp-includes`, `/xmlrpc.php`) i dalje idu na PHP/WordPress, a sve ostalo na Next.js.

### B1. Ponovi A3–A6, ali sa Application URL = `koncarelektro.rs` (root, bez subdomena)

Kad kreiraš Node App sa Application URL = glavni domen, cPanel će automatski upisati
Passenger rewrite pravila u `public_html/.htaccess` — **ovo će privremeno "sakriti" WordPress**
dok ne dodamo izuzetke (sledeći korak). Zato ovo radimo van radnog vremena / uz najavu klijentu.

### B2. Izuzeci u `.htaccess` — WP putanje ostaju na PHP-u

Odmah nakon B1, otvaramo `public_html/.htaccess` i DODAJEMO (ne brišemo postojeće
Passenger linije) pravila da sledeće putanje **ne** idu kroz Node/Passenger nego
direktno na WordPress PHP:

- `/wp-admin/*`
- `/wp-json/*`
- `/wp-content/*`
- `/wp-includes/*`
- `/xmlrpc.php`
- `/wp-login.php`
- `/contact.php`, `/koncar-auth.php` (postojeći custom PHP endpoint-i)

Ja pripremim tačan `.htaccess` sadržaj kad dođemo do ovog koraka (zavisi od toga
šta cPanel automatski generiše na tvom nalogu — format varira malo po verziji).

### B3. Test odmah posle B2

- [ ] `https://koncarelektro.rs/` → novi Next.js sajt
- [ ] `https://koncarelektro.rs/wp-admin/` → WP admin login (i dalje radi!)
- [ ] `https://koncarelektro.rs/wp-json/wc/v3/products` → JSON odgovor (i dalje radi!)
- [ ] Slika proizvoda (`/wp-content/uploads/...`) → učitava se
- [ ] Checkout / plaćanje (RaiAccept produkcija, ako su kredencijali stigli)
- [ ] `/sitemap.xml`, `/robots.txt`

### Rollback (ako nešto pukne u Fazi B)

1. U **Setup Node.js App**, obriši/zaustavi aplikaciju vezanu za `koncarelektro.rs` (root).
2. Vrati originalni `public_html/.htaccess` (napravi kopiju PRE B2! — `cp .htaccess .htaccess.backup-before-node`).
3. Sajt se odmah vraća na stari WordPress izgled — ništa u bazi nije dirano u ovoj fazi.

---

## Checklist pre nego što krenemo sa Fazom A

- [ ] Fresh backup baze (imaš već ✅)
- [ ] Confirmed produkcijski WC write ključevi (`LIVE_WC_CONSUMER_KEY/SECRET` — imamo ✅)
- [ ] RaiAccept produkcijski kredencijali (čeka se od klijenta — može i kasnije, sandbox radi za test)
- [ ] Node.js verzija u cPanel-u (A1 — javi mi rezultat)
- [ ] Ime test subdomena koji želiš (A2 — predlog: `app.koncarelektro.rs`)
