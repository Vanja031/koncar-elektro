import type { Metadata } from 'next';
import { Roboto, Roboto_Condensed } from 'next/font/google';
import { Providers } from './providers';
import { metadataForStaticPath } from '@/lib/seo/metadata';
import { CANONICAL_SITE_URL } from '@/lib/seo/site';
import { buildOrganizationJsonLd, buildWebsiteJsonLd, jsonLdScriptProps } from '@/lib/seo/jsonld';
import './globals.css';

const roboto = Roboto({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
});

const robotoCondensed = Roboto_Condensed({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-roboto-condensed',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_SITE_URL),
  ...metadataForStaticPath('/'),
  icons: {
    icon: '/favicon.jpg',
    apple: '/favicon.jpg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr" className={`${roboto.variable} ${robotoCondensed.variable}`}>
      <head>
        <script {...jsonLdScriptProps([buildOrganizationJsonLd(), buildWebsiteJsonLd()])} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
