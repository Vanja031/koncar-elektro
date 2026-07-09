import { Link } from '@/lib/router-compat';
import { ShoppingCart } from 'lucide-react';
import { getProductListingUrl } from '@/lib/catalogUrls';

const browseUrl = getProductListingUrl('alati', 'elektricni-alat', 'busilice-i-odvijaci');

export const CartEmpty = () => (
  <div className="cart-empty">
    <div className="cart-empty-icon" aria-hidden>
      <ShoppingCart className="w-10 h-10 text-primary/70" />
    </div>
    <h2 className="font-display font-bold text-xl text-primary">Vaša korpa je prazna</h2>
    <p className="text-sm text-muted-foreground max-w-md">
      Dodajte proizvode iz kataloga i vratite se ovde da završite porudžbinu.
    </p>
    <Link to={browseUrl} className="btn-yellow inline-flex px-8 py-3 mt-2">
      Pogledajte proizvode
    </Link>
  </div>
);
