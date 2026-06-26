import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Carousel } from '@/components/home/Carousel';
import { CatalogProductCard } from '@/components/catalog/CatalogProductCard';
import type { CatalogProduct } from '@/data/catalogListing';

type Props = {
  title: string;
  products: CatalogProduct[];
  viewAllHref?: string;
};

export const ParentHubBestSellers = ({ title, products, viewAllHref }: Props) => {
  if (products.length === 0) return null;

  return (
    <section className="container py-8 border-t border-border">
      <div className="flex items-center justify-between mb-4 gap-4">
        <h2 className="section-heading text-lg md:text-xl">{title}</h2>
        {viewAllHref && (
          <Link to={viewAllHref} className="section-link shrink-0">
            Pogledajte sve <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      <Carousel slideClassName="!basis-[85%] sm:!basis-[45%] md:!basis-[32%] lg:!basis-[24%]">
        {products.map((product) => (
          <CatalogProductCard key={product.id} product={product} />
        ))}
      </Carousel>
    </section>
  );
};
