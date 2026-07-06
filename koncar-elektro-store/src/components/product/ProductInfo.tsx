import { Check, Star } from 'lucide-react';
import type { ProductDetail } from '@/data/productDetail';
import { ProductWarrantyExtension } from '@/components/product/ProductWarrantyExtension';

type Props = {
  product: ProductDetail;
  onReviewsClick?: () => void;
};

export const ProductInfo = ({ product, onReviewsClick }: Props) => {
  const highlights = product.features.slice(0, 5);

  return (
    <div className="product-info">
      <p className="product-info-brand">{product.brand}</p>

      <h1 className="product-info-title">{product.name}</h1>

      <button
        type="button"
        onClick={onReviewsClick}
        className="product-info-rating"
        aria-label={`${product.rating} od 5, ${product.reviews} recenzija`}
      >
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < product.rating ? 'fill-accent text-accent' : 'fill-muted text-muted'}`}
            />
          ))}
        </div>
        <span>
          {product.rating}.0 <span className="text-muted-foreground">({product.reviews} recenzija)</span>
        </span>
      </button>

      <p className="product-info-subtitle">{product.subtitle || product.category}</p>

      <p className="product-info-sku">
        Šifra proizvoda: <strong>{product.sku}</strong>
      </p>

      <ul className="product-info-highlights">
        {highlights.map((item) => (
          <li key={item}>
            <Check className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={3} />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <ProductWarrantyExtension brand={product.brand} />
    </div>
  );
};
