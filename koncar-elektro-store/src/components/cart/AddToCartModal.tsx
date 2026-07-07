import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, PackageX, Phone, ShoppingCart, X } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Dialog, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { formatCartMoney, useCart } from '@/context/CartContext';
import { getCatalogProductUrl } from '@/lib/productUrls';
import { ROUTES } from '@/lib/catalogUrls';
import { contactChannels } from '@/data/staticPages';
import { cn } from '@/lib/utils';

const AUTO_CLOSE_MS = 6000;
const AUTO_CLOSE_UNAVAILABLE_MS = 10000;

export const AddToCartModal = () => {
  const { addedSnapshot, closeAddedModal, subtotal, itemCount } = useCart();

  const product = addedSnapshot?.product;
  const isUnavailable = addedSnapshot?.status === 'unavailable';
  const open = Boolean(addedSnapshot && product);
  const autoCloseMs = isUnavailable ? AUTO_CLOSE_UNAVAILABLE_MS : AUTO_CLOSE_MS;

  useEffect(() => {
    if (!open || !addedSnapshot) return;
    const timer = window.setTimeout(closeAddedModal, autoCloseMs);
    return () => window.clearTimeout(timer);
  }, [addedSnapshot?.addedAt, closeAddedModal, open, addedSnapshot, autoCloseMs]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeAddedModal()}>
      <DialogPortal>
        <DialogOverlay className="bg-primary/45 backdrop-blur-[2px]" />
        {product && addedSnapshot ? (
          <DialogPrimitive.Content
            className={cn(
              'add-to-cart-modal fixed left-[50%] top-[50%] z-50 w-[calc(100vw-1.25rem)] max-w-[32rem] translate-x-[-50%] translate-y-[-50%] overflow-hidden duration-200',
              'sm:w-full sm:max-w-[34rem]',
              'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-xl',
              isUnavailable && 'add-to-cart-modal--unavailable',
            )}
          >
            <DialogPrimitive.Title className="sr-only">
              {isUnavailable ? 'Proizvod trenutno nije na stanju' : 'Proizvod dodat u korpu'}
            </DialogPrimitive.Title>

            <div className="add-to-cart-modal-timer-track" aria-hidden>
              <div
                key={addedSnapshot.addedAt}
                className="add-to-cart-modal-timer-bar"
                style={{ animationDuration: `${autoCloseMs}ms` }}
              />
            </div>

            <button
              type="button"
              onClick={closeAddedModal}
              className="add-to-cart-modal-close"
              aria-label="Zatvori"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="add-to-cart-modal-body">
              <div className="add-to-cart-modal-product">
                <div className="add-to-cart-modal-media">
                  <img
                    src={product.image}
                    alt={product.name}
                    className={cn(
                      'max-h-full max-w-full object-contain',
                      isUnavailable && 'opacity-60 grayscale',
                    )}
                  />
                  {isUnavailable ? (
                    <span className="add-to-cart-modal-oos-tag">Rasprodato</span>
                  ) : null}
                </div>
                <p className="add-to-cart-modal-unit-price">{formatCartMoney(product.price)}</p>
                {!isUnavailable && addedSnapshot.cartQuantity > 1 ? (
                  <p className="add-to-cart-modal-qty">Količina: {addedSnapshot.cartQuantity}</p>
                ) : null}
              </div>

              <div className="add-to-cart-modal-details">
                {product.category ? (
                  <p className="add-to-cart-modal-category">{product.category}</p>
                ) : null}
                <Link
                  to={getCatalogProductUrl(product)}
                  onClick={closeAddedModal}
                  className="add-to-cart-modal-title"
                >
                  {product.name}
                </Link>

                {isUnavailable ? (
                  <>
                    <p className="add-to-cart-modal-warning">
                      <span className="add-to-cart-modal-warning-icon">
                        <PackageX className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </span>
                      Trenutno nije na stanju
                    </p>
                    <p className="add-to-cart-modal-warning-note">
                      Ovaj proizvod je trenutno rasprodat, pa ga ne možete dodati u korpu.
                      Javite nam se i obavestićemo vas čim ponovo bude dostupan.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="add-to-cart-modal-success">
                      <span className="add-to-cart-modal-success-icon">
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </span>
                      Proizvod je dodat u korpu.
                    </p>

                    <div className="add-to-cart-modal-divider" />

                    <p className="add-to-cart-modal-total">
                      Ukupno u korpi ({itemCount}): <strong>{formatCartMoney(subtotal)}</strong>
                    </p>
                  </>
                )}
              </div>
            </div>

            {isUnavailable ? (
              <div className="add-to-cart-modal-actions">
                <button type="button" onClick={closeAddedModal} className="add-to-cart-modal-btn-secondary">
                  <ArrowRight className="w-4 h-4 shrink-0" />
                  Nastavi kupovinu
                </button>
                <a href={contactChannels.primaryPhoneHref} className="add-to-cart-modal-btn-primary">
                  <Phone className="w-4 h-4 shrink-0" />
                  Pozovite nas
                </a>
              </div>
            ) : (
              <div className="add-to-cart-modal-actions">
                <button type="button" onClick={closeAddedModal} className="add-to-cart-modal-btn-secondary">
                  <ArrowRight className="w-4 h-4 shrink-0" />
                  Nastavi kupovinu
                </button>
                <Link to={ROUTES.cart} onClick={closeAddedModal} className="add-to-cart-modal-btn-primary">
                  <ShoppingCart className="w-4 h-4 shrink-0" />
                  Pogledaj korpu
                </Link>
              </div>
            )}
          </DialogPrimitive.Content>
        ) : null}
      </DialogPortal>
    </Dialog>
  );
};
