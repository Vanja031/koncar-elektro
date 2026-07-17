'use client';

import { SiteHeader } from '@/components/home/SiteHeader';
import { HeroSection } from '@/components/home/HeroSection';
import { ProductSections } from '@/components/home/ProductSections';
import { AboutSection, SiteFooter } from '@/components/home/SiteFooter';
import { FloatingContactWidget } from '@/components/layout/FloatingContactWidget';

const Index = () => (
  <div className="min-h-screen bg-white">
    <SiteHeader />
    <main>
      <HeroSection />
      <ProductSections />
      <AboutSection />
    </main>
    <SiteFooter />
    <FloatingContactWidget />
  </div>
);

export default Index;
