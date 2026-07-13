import type { ReactNode } from 'react';
import { ShopLayout } from '@/components/layout/ShopLayout';
import { ListingHero } from '@/components/catalog/ListingHero';
import type { BreadcrumbItem } from '@/data/categoryPages';

type Props = {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export const InfoPageShell = ({ breadcrumbs, title, subtitle, children }: Props) => (
  <ShopLayout>
    <ListingHero breadcrumbs={breadcrumbs} title={title} description={subtitle} />
    <div className="container py-8 md:py-12">{children}</div>
  </ShopLayout>
);
