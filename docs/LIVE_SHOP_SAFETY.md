# Zaštita live shopa — koncarelektro.rs

**Obavezno pravilo projekta:** Sve što radimo u fazi migracije **ne sme uticati** na rad postojeće prodavnice na [koncarelektro.rs](https://koncarelektro.rs).

Live sajt ostaje **jedini izvor istine** za kupce, narudžbine i SEO do eksplicitnog go-live-a (Nedelja 8).

---

## Dva odvojena sistema

| | Live shop | Novi sajt (u razvoju) |
|---|-----------|------------------------|
| **URL** | koncarelektro.rs | Vercel / localhost |
| **Frontend** | WooCommerce tema (Electro) | React (`koncar-elektro-store/`) |
| **Kupci** | Kupuju ovde | Još nema javnog saobraćaja |
| **Korpa / checkout** | WC na live sajtu | Lokalni mock / staging |
| **Podaci** | WP baza (master) | Samo **čitanje** preko API-ja |

Novi sajt **ne zamenjuje** live dok ne prebacimo DNS i ne potvrdimo QA (nedelja 7–8).

---

## Šta je bezbedno (ne dira shop)

| Akcija | Zašto je OK |
|--------|-------------|
| **Čitanje** REST / Store API-ja (`GET`) | Samo čita podatke, ne menja bazu |
| **WC REST ključ sa dozvolom Read** | Ne može menjati proizvode, cene, narudžbine |
| **CORS plugin** (samo HTTP headeri) | Ne menja izgled, korpu ni checkout live sajta |
| **Razvoj na Vercel / localhost** | Potpuno odvojen frontend |
| **Vite proxy u dev-u** | Lokalno, live sajt ne vidi |

---

## Šta je zabranjeno bez eksplicitnog dogovora

| Akcija | Rizik |
|--------|-------|
| Menjanje **permalink** strukture | SEO + broken linkovi |
| Menjanje **teme** ili deaktivacija WooCommerce | Shop prestaje da radi |
| **Write** API ključevi u browseru / javnom kodu | Neovlašćene izmene |
| `POST`/`PUT`/`DELETE` na proizvode, cene, zalihe | Menja live katalog |
| Masovni import/sync **u** live bazu | Rizik od duplikata / pogrešnih podataka |
| Izmene `.htaccess` bez backup-a | 500 greške na celom sajtu |
| Deaktivacija LiteSpeed / cache plugina bez razumevanja | Performanse, ponekad pad sajta |
| DNS promene pre go-live plana | Preusmeravanje kupaca na nedovršen sajt |

---

## Pravila za naš dev tim

1. **Samo READ** prema live WP-u dok ne uđemo u fazu testnog checkouta (nedelja 5–6), i tada samo kontrolisano.
2. **WC REST v3 ključevi** — isključivo **Read** permission; Write ključ tek za staging ili uz backup.
3. **Nikad** ne commitovati `.env` sa ključevima (u `.gitignore`).
4. **Sync skripte** — prvo dry-run, nikad automatski write na produkciju.
5. **Plugini na live WP** — instalirati samo ono što ne menja ponašanje shopa; pre aktivacije pročitati [CORS checklist](#cors—bezbedno-uključivanje) ispod.
6. **Go-live** je jedina faza gde se DNS / domen prebacuje na novi frontend.

---

## CORS — bezbedno uključivanje

CORS plugin **ne utiče** na to kako posetioci koriste koncarelektro.rs. Samo dozvoljava **drugim domenima** (Vercel, localhost) da iz browsera čitaju `/wp-json/...`.

### Pre aktivacije

- [ ] Otvori koncarelektro.rs u incognito — proveri naslovnu, proizvod, **Dodaj u korpu**
- [ ] Plugin je **instaliran ali ne mora biti aktivan** dok ne testiramo

### Aktivacija (5 minuta)

1. **Plugins** → aktiviraj CORS plugin
2. Odmah ponovi test na live sajtu (naslovna → proizvod → korpa)
3. Ako **bilo šta** ne radi: **Plugins → Deactivate** odmah — shop se vraća u prethodno stanje

### Ako sve radi na live-u

- Test CORS samo sa Vercel URL-a (F12 console `fetch` test)
- Live shop i dalje radi nezavisno

---

## API ključevi

- Kreirani ključ: **Read** permission ✅
- Ključ se koristi za naše skripte i dev — **ne utiče** na kupce
- Ako treba opozvati: WooCommerce → REST API → Revoke

---

## Kontakt u slučaju problema

Ako posle bilo koje izmene u WP adminu shop ne radi normalno:

1. Deaktiviraj poslednji instalirani plugin
2. LiteSpeed → Purge All
3. Javi timu pre daljih izmena

---

*Povezano: [wp-headless-setup.md](./wp-headless-setup.md) · [PLAN_TRACKER.md](./PLAN_TRACKER.md)*
