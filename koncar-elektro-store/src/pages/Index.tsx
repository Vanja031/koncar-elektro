import { useState } from 'react';
import { SiteHeader } from '@/components/home/SiteHeader';
import { HeroSection } from '@/components/home/HeroSection';
import { ProductSections } from '@/components/home/ProductSections';
import { CategoryHighlights, AboutSection, SiteFooter, FloatingChat } from '@/components/home/SiteFooter';

const Index = () => {
  const [cart, setCart] = useState(0);
  const onAdd = () => setCart((c) => c + 1);

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader cartCount={cart} />
      <main>
        <HeroSection />
        <ProductSections onAdd={onAdd} />
        <CategoryHighlights />
        <AboutSection />
      </main>
      <SiteFooter />
      <FloatingChat />
    </div>
  );
};

export default Index;
