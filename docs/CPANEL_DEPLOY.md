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

### A1. Provera Node.js verzije u cPanel-u

1. cPanel → traži **"Setup Node.js App"** (obično pod "Software").
2. Klikni **Create Application** i pogledaj listu **Node.js version** — treba **18.17+** ili **20.x** (Next.js 14 zahteva minimum 18.17).
3. Javi mi koje verzije su ponuđene ako nema 18.17+ — ima alternativa, ali skoro svaki moderni cPanel ima 18/20/22.

### A2. Kreiranje test subdomena

1. cPanel → **Subdomains** → kreiraj npr. `app.koncarelektro.rs` (ili `newsite.koncarelektro.rs`).
2. Document root koji cPanel predloži je OK (npr. `public_html/app`) — Node.js App će ga sam prepisati/kontrolisati kad ga povežemo.

### A3. Build lokalno (kod nas)

Ja ću pokrenuti (kad budeš spreman):

```bash
cd koncar-elektro-store
npm ci
npm run build
```

Ovo pravi `.next/` produkcioni build. Sve `NEXT_PUBLIC_*` env varijable moraju biti
tačne **PRE** ovog koraka (ubacuju se u build, ne mogu se promeniti posle bez rebuild-a).

### A4. Upload na server

Opcija 1 (preporučeno, ako cPanel ima File Manager sa upload-om zip-a):
1. Zapakujem projekat u `.zip` (bez `node_modules` — instaliraćemo direktno na serveru da izbegnemo probleme sa arhitekturom/OS razlikama).
2. Ti (ili ja preko File Managera) upload-uješ zip u folder npr. `~/app.koncarelektro.rs/` (van `public_html`, ili u dodeljeni app root).
3. Raspakuj zip tamo (File Manager → Extract).

Opcija 2 (ako imaš FTP/SFTP pristup): isto, samo preko FTP klijenta.

### A5. Kreiranje Node App-a u cPanel-u

U **Setup Node.js App → Create Application**:

| Polje | Vrednost |
|---|---|
| Node.js version | 18.x ili 20.x (najnovija dostupna) |
| Application mode | Production |
| Application root | folder gde je raspakovan kod (npr. `app.koncarelektro.rs`) |
| Application URL | `app.koncarelektro.rs` |
| Application startup file | `server.cjs` |

Klikni **Create**.

### A6. Instalacija paketa + env varijable

Na stranici te aplikacije u cPanel-u:

1. Klikni **"Run NPM Install"** dugme (instaliraće `node_modules` na serveru — ovo može potrajati par minuta zbog `sharp` paketa).
2. U sekciji **Environment variables**, dodaj (kopiraj iz `koncar-elektro-store/.env`, samo produkcijske vrednosti):
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

   ⚠️ Ako build (A3) rade **pre** ovoga, `NEXT_PUBLIC_*` vrednosti sa builda ostaju "zapečene" u `.next/` — ako ih promeniš tek ovde, moraćeš da rebuild-uješ. Zato ih šaljem tebi da ih potvrdiš PRE build-a.

3. Klikni **Restart** na aplikaciji.

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
