import type { Metadata } from 'next';
import { Providers } from './providers';
import { metadataForStaticPath } from '@/lib/seo/metadata';
import { CANONICAL_SITE_URL } from '@/lib/seo/site';
import { buildOrganizationJsonLd, buildWebsiteJsonLd, jsonLdScriptProps } from '@/lib/seo/jsonld';
import './globals.css';

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
    <html lang="sr">
      <head>
        <script {...jsonLdScriptProps([buildOrganizationJsonLd(), buildWebsiteJsonLd()])} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
