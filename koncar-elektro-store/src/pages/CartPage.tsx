import { Link } from 'react-router-dom';
import { ShopLayout } from '@/components/layout/ShopLayout';
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs';
import { CartLineItem } from '@/components/cart/CartLineItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { CartEmpty } from '@/components/cart/CartEmpty';
import { useCart } from '@/context/CartContext';
import { getProductListingUrl } from '@/lib/catalogUrls';

const browseUrl = getProductListingUrl('alati', 'elektricni-alat', 'busilice-i-odvijaci');

const CartPage = () => {
  const { lines, itemCount, setQuantity, removeItem } = useCart();

  return (
    <ShopLayout>
      <Breadcrumbs
        items={[
          { label: 'Početna', href: '/' },
          { label: 'Korpa' },
        ]}
        variant="bar"
      />

      <section className="container py-8 lg:py-10">
        <div className="cart-page-header">
          <h1 className="section-heading text-xl md:text-2xl">Korpa</h1>
          {itemCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {itemCount} {itemCount === 1 ? 'stavka' : 'stavki'}
            </p>
          )}
        </div>

        {lines.length === 0 ? (
          <CartEmpty />
        ) : (
          <div className="cart-page-grid">
            <div className="cart-lines-wrap">
              <div className="cart-lines-head hidden md:grid">
                <span>Proizvod</span>
                <span className="text-right">Ukupno</span>
              </div>
              <div className="cart-lines">
                {lines.map((line) => (
                  <CartLineItem
                    key={line.productId}
                    line={line}
                    onQuantityChange={(qty) => setQuantity(line.productId, qty)}
                    onRemove={() => removeItem(line.productId)}
                  />
                ))}
              </div>
              <Link
                to={browseUrl}
                className="hidden md:inline-flex text-sm text-primary font-medium hover:underline mt-4"
              >
                ← Nastavi kupovinu
              </Link>
            </div>

            <CartSummary />
          </div>
        )}
      </section>
    </ShopLayout>
  );
};

export default CartPage;
