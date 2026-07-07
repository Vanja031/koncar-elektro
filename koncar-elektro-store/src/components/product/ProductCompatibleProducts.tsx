import { Link } from 'react-router-dom';
import { formatPrice } from '@/data/homepage';
import type { ProductDetail } from '@/data/productDetail';
import { getProductUrl } from '@/data/productDetail';
import { AddToCartButton } from '@/components/cart/AddToCartButton';

type Props = {
  products: ProductDetail[];
};

export const ProductCompatibleProducts = ({ products }: Props) => {
  if (products.length === 0) return null;

  return (
    <section className="product-section">
      <h2 className="product-section-title">Kompatibilni proizvodi</h2>
      <div className="product-compatible-grid">
        {products.map((p) => (
          <article key={p.id} className="product-compatible-card">
            <Link to={getProductUrl(p.id)} className="product-compatible-media">
              <img src={p.image} alt={p.name} loading="lazy" />
            </Link>
            <div className="product-compatible-body">
              <Link to={getProductUrl(p.id)} className="product-compatible-name">
                {p.name}
              </Link>
              <p className="product-compatible-price">{formatPrice(p.price)}</p>
              <AddToCartButton product={p} variant="outline" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
