import { useState } from 'react';
import { Check } from 'lucide-react';
import type { ProductDetail } from '@/data/productDetail';
import { ProductReviews } from '@/components/product/ProductReviews';
import { BrandMark } from '@/components/brand/BrandMark';
import { getBrandLogoSrc } from '@/lib/brandLogos';

type TabId = 'description' | 'specs' | 'reviews' | 'declaration';

type Tab = {
  id: TabId;
  label: string;
  shortLabel: string;
};

type Props = {
  product: ProductDetail;
};

const tabs: Tab[] = [
  { id: 'description', label: 'Opis', shortLabel: 'Opis' },
  { id: 'specs', label: 'Tehničke karakteristike', shortLabel: 'Specifikacije' },
  { id: 'declaration', label: 'Deklaracija', shortLabel: 'Deklaracija' },
  { id: 'reviews', label: 'Recenzije', shortLabel: 'Recenzije' },
];

const isBrandSpecLabel = (label: string) =>
  /proizvodja[cč]|brend/i.test(label.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));

export const ProductTabs = ({ product }: Props) => {
  const [activeTab, setActiveTab] = useState<TabId>('specs');

  return (
    <div id="product-tabs" className="product-tabs">
      <div className="product-tabs-nav" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={tab.id === 'reviews' ? 'product-tab-reviews' : undefined}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`product-tabs-btn ${activeTab === tab.id ? 'product-tabs-btn--active' : ''}`}
          >
            <span className="hidden md:inline">{tab.label}</span>
            <span className="md:hidden">{tab.shortLabel}</span>
            {tab.id === 'reviews' && (
              <span className="ml-1 opacity-70">({product.reviews})</span>
            )}
          </button>
        ))}
      </div>

      <div className="product-tabs-panel" role="tabpanel">
        {activeTab === 'description' && (
          <div className="max-w-3xl">
            {product.longDescriptionHtml ? (
              <div
                className="product-description-html"
                dangerouslySetInnerHTML={{ __html: product.longDescriptionHtml }}
              />
            ) : (
              <>
                <p className="text-sm text-foreground/90 leading-relaxed">{product.longDescription}</p>
                <ul className="mt-6 space-y-2.5">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-foreground/90">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={3} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="product-specs-table-wrap">
            <table className="product-specs-table">
              <tbody>
                {product.specifications.map((spec, i) => {
                  const showLogo = isBrandSpecLabel(spec.label) && getBrandLogoSrc(spec.value);
                  return (
                    <tr key={spec.label + spec.value} className={i % 2 === 0 ? 'bg-secondary/40' : 'bg-white'}>
                      <th scope="row">{spec.label}</th>
                      <td>
                        {showLogo ? <BrandMark brand={spec.value} size="sm" /> : spec.value}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reviews' && <ProductReviews product={product} />}

        {activeTab === 'declaration' && (
          <div className="product-specs-table-wrap">
            <table className="product-specs-table">
              <tbody>
                {product.declaration.map((row, i) => {
                  const showLogo = isBrandSpecLabel(row.label) && getBrandLogoSrc(row.value);
                  return (
                    <tr key={row.label} className={i % 2 === 0 ? 'bg-secondary/40' : 'bg-white'}>
                      <th scope="row">{row.label}</th>
                      <td>
                        {showLogo ? <BrandMark brand={row.value} size="sm" /> : row.value}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
