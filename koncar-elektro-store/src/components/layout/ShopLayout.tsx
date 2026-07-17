import { type ReactNode } from 'react';
import { SiteHeader } from '@/components/home/SiteHeader';
import { SiteFooter } from '@/components/home/SiteFooter';
import { FloatingContactWidget } from '@/components/layout/FloatingContactWidget';

type Props = {
  children: ReactNode;
  showFloatingChat?: boolean;
};

export const ShopLayout = ({ children, showFloatingChat = true }: Props) => (
  <div className="min-h-screen bg-white">
    <SiteHeader />
    <main>{children}</main>
    <SiteFooter />
    {showFloatingChat && <FloatingContactWidget />}
  </div>
);
