/**
 * Custom Node entrypoint for cPanel "Setup Node.js App" (Phusion Passenger).
 *
 * Passenger does NOT run `npm start` / `next start` directly — it expects a
 * single JS file that boots an HTTP server listening on `process.env.PORT`
 * (Passenger injects PORT itself; you never set it manually in cPanel).
 *
 * This file is CommonJS (.cjs) on purpose: package.json has "type": "module",
 * but Passenger's default Node loader expects a script it can `require()`.
 *
 * In cPanel → Setup Node.js App → "Application startup file", set: server.cjs
 *
 * Usage (identical in dev/prod, but only used on the cPanel server — locally
 * keep using `npm run dev` / `npm run build && npm run start`):
 *   node server.cjs
 */
const { createServer } = require('node:http');
const next = require('next');

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      handle(req, res);
    }).listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`> Next.js app ready on port ${port} (dev=${dev})`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Failed to start Next.js app:', err);
    process.exit(1);
  });
