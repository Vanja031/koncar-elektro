import { SiteHeader } from '@/components/home/SiteHeader';
import { HeroSection } from '@/components/home/HeroSection';
import { ProductSections } from '@/components/home/ProductSections';
import { CategoryHighlights, AboutSection, SiteFooter, FloatingChat } from '@/components/home/SiteFooter';

const Index = () => (
  <div className="min-h-screen bg-white">
    <SiteHeader />
    <main>
      <HeroSection />
      <ProductSections />
      <CategoryHighlights />
      <AboutSection />
    </main>
    <SiteFooter />
    <FloatingChat />
  </div>
);

export default Index;
