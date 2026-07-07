import { SiteHeader } from '@/components/home/SiteHeader';
import { HeroSection } from '@/components/home/HeroSection';
import { ProductSections } from '@/components/home/ProductSections';
import { AboutSection, SiteFooter, FloatingChat } from '@/components/home/SiteFooter';

const Index = () => (
  <div className="min-h-screen bg-white">
    <SiteHeader />
    <main>
      <HeroSection />
      <ProductSections />
      <AboutSection />
    </main>
    <SiteFooter />
    <FloatingChat />
  </div>
);

export default Index;
