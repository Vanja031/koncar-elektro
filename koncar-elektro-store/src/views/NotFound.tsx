'use client';

import { Link } from '@/lib/router-compat';
import { Flame } from 'lucide-react';
import { ShopLayout } from '@/components/layout/ShopLayout';
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs';

const NotFound = () => (
  <ShopLayout>
    <Breadcrumbs
      items={[
        { label: 'Početna', href: '/' },
        { label: 'Stranica nije pronađena' },
      ]}
      variant="bar"
    />

    <section className="container flex flex-col items-center justify-center text-center px-4 py-16 md:py-24 min-h-[calc(100vh-14rem)]">
      <p className="font-display font-bold text-7xl md:text-8xl text-primary/10 leading-none select-none mb-4 md:mb-5">
        404
      </p>
      <h1 className="section-heading text-2xl md:text-3xl mb-3">
        Stranica nije pronađena
      </h1>
      <p className="text-sm text-muted-foreground max-w-sm mb-8 leading-relaxed">
        Stranica koju tražite ne postoji ili je uklonjena.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
        <Link to="/" className="btn-yellow w-full sm:w-auto px-8 py-2.5 text-sm">
          Na početnu
        </Link>
        <Link
          to="/akcija"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-2.5 text-sm font-semibold border border-destructive/25 text-destructive rounded hover:bg-destructive/5 transition-colors"
        >
          <Flame className="w-4 h-4" />
          Akcija
        </Link>
      </div>
    </section>
  </ShopLayout>
);

export default NotFound;
