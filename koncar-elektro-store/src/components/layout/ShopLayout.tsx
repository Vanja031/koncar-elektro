import { type ReactNode } from 'react';
import { SiteHeader } from '@/components/home/SiteHeader';
import { SiteFooter, FloatingChat } from '@/components/home/SiteFooter';

type Props = {
  children: ReactNode;
};

export const ShopLayout = ({ children }: Props) => (
  <div className="min-h-screen bg-white">
    <SiteHeader />
    <main>{children}</main>
    <SiteFooter />
    <FloatingChat />
  </div>
);
