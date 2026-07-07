import { useEffect, useState } from 'react';
import { Check, ShoppingCart } from 'lucide-react';
import { useCart, type CartProduct } from '@/context/CartContext';

type Variant = 'icon' | 'yellow' | 'outline' | 'product';

type Props = {
  product: CartProduct;
  quantity?: number;
  variant?: Variant;
  className?: string;
  disabled?: boolean;
  onAdded?: () => void;
};

const ADDED_MS = 2000;

export const AddToCartButton = ({
  product,
  quantity = 1,
  variant = 'yellow',
  className = '',
  disabled = false,
  onAdded,
}: Props) => {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), ADDED_MS);
    return () => window.clearTimeout(timer);
  }, [added]);

  const handleClick = () => {
    if (disabled || added) return;
    addItem(product, quantity);
    if (product.inStock === false) return;
    setAdded(true);
    onAdded?.();
  };

  if (variant === 'product') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`add-to-cart-btn add-to-cart-btn--product ${added ? 'add-to-cart-btn--added' : ''} ${className}`}
      >
        {added ? (
          <>
            <Check className="w-5 h-5" strokeWidth={3} />
            Dodato u korpu
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" />
            Dodaj u korpu
          </>
        )}
      </button>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-label={added ? 'Dodato u korpu' : 'Dodaj u korpu'}
        className={`add-to-cart-btn add-to-cart-btn--icon ${added ? 'add-to-cart-btn--added' : ''} ${className}`}
      >
        {added ? <Check className="w-4 h-4" strokeWidth={3} /> : <ShoppingCart className="w-4 h-4" />}
      </button>
    );
  }

  if (variant === 'outline') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`add-to-cart-btn add-to-cart-btn--outline ${added ? 'add-to-cart-btn--added' : ''} ${className}`}
      >
        {added ? (
          <>
            <Check className="w-3.5 h-3.5" strokeWidth={3} />
            Dodato
          </>
        ) : (
          <>
            <ShoppingCart className="w-3.5 h-3.5" />
            Dodaj u korpu
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`add-to-cart-btn add-to-cart-btn--yellow ${added ? 'add-to-cart-btn--added' : ''} ${className}`}
    >
      {added ? (
        <>
          <Check className="w-4 h-4" strokeWidth={3} />
          Dodato
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4" />
          Dodaj u korpu
        </>
      )}
    </button>
  );
};
