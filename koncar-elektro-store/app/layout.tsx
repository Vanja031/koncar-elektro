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
        <script
          async
          type="text/javascript"
          src="https://static.klaviyo.com/onsite/js/QQtR2e/klaviyo.js?company_id=QQtR2e"
        />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `!function(){if(!window.klaviyo){window._klOnsite=window._klOnsite||[];try{window.klaviyo=new Proxy({},{get:function(n,i){return"push"===i?function(){var n;(n=window._klOnsite).push.apply(n,arguments)}:function(){for(var n=arguments.length,o=new Array(n),w=0;w<n;w++)o[w]=arguments[w];var t="function"==typeof o[o.length-1]?o.pop():void 0,e=new Promise((function(n){window._klOnsite.push([i].concat(o,[function(i){t&&t(i),n(i)}]))}));return e}}})}catch(n){window.klaviyo=window.klaviyo||[],window.klaviyo.push=function(){var n;(n=window._klOnsite).push.apply(n,arguments)}}}}();`,
          }}
        />
      </body>
    </html>
  );
}
