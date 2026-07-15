'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from '@/lib/router-compat';
import type { BreadcrumbItem } from '@/data/categoryPages';

type Props = {
  breadcrumbs: BreadcrumbItem[];
};

/**
 * Mobilno dugme za povratak na vrhu stranice proizvoda. Na desktopu postoji breadcrumb
 * traka i meni, ali na mobilnom nema jasnog puta nazad na listing — ovo dugme se vraća na
 * prethodnu stranu (istorija), a ako stranica proizvoda otvorena direktno (npr. iz Google-a,
 * bez istorije), vodi na najbližu roditeljsku kategoriju iz breadcrumb-a.
 */
export const ProductBackBar = ({ breadcrumbs }: Props) => {
  const navigate = useNavigate();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, []);

  const parent = [...breadcrumbs].reverse().find((item) => item.href && item.label !== 'Početna');

  return (
    <div className="product-back-bar lg:hidden">
      <div className="container">
        {canGoBack ? (
          <button type="button" onClick={() => navigate(-1)} className="product-back-btn">
            <ChevronLeft className="w-4 h-4 shrink-0" />
            <span>Nazad</span>
          </button>
        ) : (
          <Link to={parent?.href ?? '/'} className="product-back-btn">
            <ChevronLeft className="w-4 h-4 shrink-0" />
            <span className="truncate">{parent ? parent.label : 'Početna'}</span>
          </Link>
        )}
      </div>
    </div>
  );
};
