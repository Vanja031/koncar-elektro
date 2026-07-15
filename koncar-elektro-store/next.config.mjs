import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  async rewrites() {
    return [
      {
        source: '/wp-json/:path*',
        destination: 'https://koncarelektro.rs/wp-json/:path*',
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
