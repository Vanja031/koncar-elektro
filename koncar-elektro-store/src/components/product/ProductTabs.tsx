import { useState } from 'react';
import { Check, Download, FileText } from 'lucide-react';
import type { ProductDetail } from '@/data/productDetail';
import { ProductReviews } from '@/components/product/ProductReviews';

type TabId = 'description' | 'specs' | 'reviews' | 'documents';

type Props = {
  product: ProductDetail;
};

const tabs: { id: TabId; label: string }[] = [
  { id: 'description', label: 'Opis' },
  { id: 'specs', label: 'Tehničke karakteristike' },
  { id: 'documents', label: 'Dokumentacija' },
  { id: 'reviews', label: 'Recenzije' },
];

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
            {tab.label}
            {tab.id === 'reviews' && (
              <span className="ml-1 opacity-70">({product.reviews})</span>
            )}
          </button>
        ))}
      </div>

      <div className="product-tabs-panel" role="tabpanel">
        {activeTab === 'description' && (
          <div className="max-w-3xl">
            <p className="text-sm text-foreground/90 leading-relaxed">{product.longDescription}</p>
            <ul className="mt-6 space-y-2.5">
              {product.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-foreground/90">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={3} />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="product-specs-table-wrap">
            <table className="product-specs-table">
              <tbody>
                {product.specifications.map((spec, i) => (
                  <tr key={spec.label + spec.value} className={i % 2 === 0 ? 'bg-secondary/40' : 'bg-white'}>
                    <th scope="row">{spec.label}</th>
                    <td>{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reviews' && <ProductReviews product={product} />}

        {activeTab === 'documents' && (
          <ul className="space-y-3 max-w-xl">
            {product.documents.map((doc) => (
              <li key={doc.label}>
                <button type="button" className="product-document-link">
                  {doc.type === 'manual' ? (
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                  ) : (
                    <Download className="w-5 h-5 text-primary shrink-0" />
                  )}
                  <span className="flex-1 text-left">
                    <span className="block text-sm font-medium text-foreground">{doc.label}</span>
                    {doc.size && <span className="text-xs text-muted-foreground">{doc.size}</span>}
                  </span>
                  <span className="text-xs font-semibold text-primary uppercase">Preuzmi</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
