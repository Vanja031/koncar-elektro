import { useState, type ReactNode } from 'react';
import { SiteHeader } from '@/components/home/SiteHeader';
import { SiteFooter, FloatingChat } from '@/components/home/SiteFooter';

type Props = {
  children: ReactNode;
};

export const ShopLayout = ({ children }: Props) => {
  const [cart, setCart] = useState(0);

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader cartCount={cart} />
      <main>{children}</main>
      <SiteFooter />
      <FloatingChat />
    </div>
  );
};
