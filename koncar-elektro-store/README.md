# Končar Elektro Store

Next.js 14 (App Router) frontend za [koncarelektro.rs](https://koncarelektro.rs) — WordPress Headless + WooCommerce Store API.

## Development

```bash
cp .env.example .env.local   # podesi NEXT_PUBLIC_* varijable
npm install
npm run dev                    # http://localhost:3000
```

## Scripts

| Script | Opis |
|--------|------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run audit:wc-slugs` | URL slug audit |
| `npm run audit:seo-baseline` | SEO baseline sample audit |

## Struktura

- `app/` — Next.js App Router rute (1:1 sa starim URL-ovima)
- `src/views/` — stranice (bivši `src/pages/`)
- `src/components/` — UI komponente
- `src/lib/api/` — WooCommerce Store API client

Vite legacy: `npm run dev:vite` (zastarelo, samo za referencu).
