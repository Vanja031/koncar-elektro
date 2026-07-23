import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** WP origin for /wp-json proxy — staging or live via .env `WP_REWRITE_ORIGIN`. */
const wpRewriteOrigin = (
  process.env.WP_REWRITE_ORIGIN ||
  process.env.NEXT_PUBLIC_WP_API_URL?.replace(/\/wp-json\/?$/, '') ||
  'https://koncarelektro.rs'
).replace(/\/$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  async rewrites() {
    return [
      {
        source: '/wp-json/:path*',
        destination: `${wpRewriteOrigin}/wp-json/:path*`,
      },
    ];
  },
  images: {
    disableStaticImages: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'koncarelektro.rs',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'testing.cleannikki.com',
        pathname: '/**',
      },
    ],
  },
  webpack(config) {
    // Vite-style URL string imports for existing src/assets usage.
    // generator.filename must live under static/ so Next's publicPath (/_next/)
    // resolves the emitted URL to /_next/static/media/... (otherwise 404).
    config.module.rules.unshift({
      test: /\.(png|jpe?g|gif|webp|svg|ico)$/i,
      include: path.resolve(__dirname, 'src/assets'),
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash:8][ext]',
      },
    });
    return config;
  },
};

export default nextConfig;
