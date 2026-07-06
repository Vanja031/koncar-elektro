import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import garancijaBadge from '@/assets/garancija-badge.png';
import { getWarrantyExtensionOffer } from '@/lib/warrantyExtension';

type Props = {
  brand: string;
};

export const ProductWarrantyExtension = ({ brand }: Props) => {
  const offer = getWarrantyExtensionOffer(brand);
  if (!offer) return null;

  const inner = (
    <>
      <img src={garancijaBadge} alt="" className="product-warranty-extension-img" aria-hidden />
      <span className="product-warranty-extension-copy">
        <span className="product-warranty-extension-label">
          {offer.label}
          {offer.external && <ExternalLink className="w-3 h-3 shrink-0 opacity-70" aria-hidden />}
        </span>
        <span className="product-warranty-extension-hint">{offer.hint}</span>
      </span>
    </>
  );

  if (offer.external) {
    return (
      <a
        href={offer.href}
        target="_blank"
        rel="noopener noreferrer"
        className="product-warranty-extension"
        aria-label={`${offer.label} — otvara se u novom tabu`}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link to={offer.href} className="product-warranty-extension" aria-label={offer.label}>
      {inner}
    </Link>
  );
};
