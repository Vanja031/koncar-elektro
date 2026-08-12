'use client';

import { X } from 'lucide-react';
import { Link } from '@/lib/router-compat';
import { InfoPageShell } from '@/components/static/InfoPageShell';
import { CatalogStateMessage } from '@/components/catalog/CatalogStateMessage';
import { ProductImage } from '@/components/product/ProductImage';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { formatPrice } from '@/data/homepage';
import { useCompare, getCompareProductUrl, COMPARE_LIMIT } from '@/context/CompareContext';
import { ROUTES } from '@/lib/catalogUrls';

const breadcrumbs = [{ label: 'Početna', href: '/' }, { label: 'Uporedite' }];

const ComparePage = () => {
  const { products, count, remove, clear } = useCompare();

  const allSpecKeys = Array.from(
    new Set(products.flatMap((p) => p.specs ?? [])),
  );

  return (
    <InfoPageShell
      breadcrumbs={breadcrumbs}
      title="Uporedite"
      subtitle={`Uporedite do ${COMPARE_LIMIT} proizvoda. Lista se čuva u ovom pregledaču.`}
    >
      {count === 0 ? (
        <CatalogStateMessage
          variant="empty"
          title="Nema proizvoda za poređenje"
          description="Označite „Uporedi“ na kartici proizvoda ili na stranici proizvoda."
        />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {count} / {COMPARE_LIMIT} proizvoda
            </p>
            <div className="flex items-center gap-3">
              <Link to={ROUTES.shop} className="text-sm text-primary hover:underline">
                Nastavi kupovinu
              </Link>
              <button
                type="button"
                onClick={clear}
                className="text-sm text-muted-foreground hover:text-destructive transition-colors"
              >
                Isprazni poređenje
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-border rounded-lg bg-white">
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-left font-medium text-muted-foreground w-36">Proizvod</th>
                  {products.map((p) => (
                    <th key={p.id} className="p-3 align-top min-w-[12rem]">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => remove(p.id)}
                          className="absolute -top-1 -right-1 w-7 h-7 rounded-full border border-border bg-white flex items-center justify-center text-muted-foreground hover:text-destructive"
                          aria-label={`Ukloni ${p.name}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <Link to={getCompareProductUrl(p)} className="block">
                          <div className="aspect-square max-w-[8rem] mx-auto mb-2">
                            <ProductImage src={p.image} alt={p.name} />
                          </div>
                          <p className="font-medium text-foreground leading-snug line-clamp-3 text-left">
                            {p.name}
                          </p>
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-3 text-muted-foreground">Brend</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-3 font-medium">
                      {p.brand || '—'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3 text-muted-foreground">Šifra</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-3">
                      {p.sku || '—'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3 text-muted-foreground">Cena</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-3">
                      {p.oldPrice ? (
                        <span className="block text-xs text-muted-foreground line-through">
                          {formatPrice(p.oldPrice)}
                        </span>
                      ) : null}
                      <span className="font-display font-bold">{formatPrice(p.price)}</span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3 text-muted-foreground">Dostupnost</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-3">
                      {p.inStock === false ? 'Nije na stanju' : 'Na stanju'}
                    </td>
                  ))}
                </tr>
                {allSpecKeys.length > 0 && (
                  <tr className="border-b border-border">
                    <td className="p-3 text-muted-foreground align-top">Specifikacije</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 align-top">
                        {(p.specs ?? []).length > 0 ? (
                          <ul className="list-disc pl-4 space-y-0.5">
                            {p.specs!.map((s) => (
                              <li key={s}>{s}</li>
                            ))}
                          </ul>
                        ) : (
                          '—'
                        )}
                      </td>
                    ))}
                  </tr>
                )}
                <tr>
                  <td className="p-3 text-muted-foreground">Korpa</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-3">
                      <AddToCartButton product={p} variant="yellow" className="w-full text-xs py-2" />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </InfoPageShell>
  );
};

export default ComparePage;
