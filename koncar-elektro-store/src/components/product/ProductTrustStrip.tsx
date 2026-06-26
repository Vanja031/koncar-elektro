import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faHeadset,
  faTruck,
  faShieldHalved,
  faScrewdriverWrench,
} from '@fortawesome/free-solid-svg-icons';

const items: { icon: IconDefinition; title: string; desc: string }[] = [
  {
    icon: faHeadset,
    title: 'Stručna podrška pri izboru alata',
    desc: 'Pomažemo da izaberete pravi alat za posao',
  },
  {
    icon: faTruck,
    title: 'Danas poručeno – sutra isporučeno',
    desc: 'Brza i sigurna isporuka na vašu adresu',
  },
  {
    icon: faShieldHalved,
    title: 'Originalni proizvodi sa garancijom',
    desc: 'Samo provereni brendovi i ovlašćena podrška',
  },
  {
    icon: faScrewdriverWrench,
    title: 'Servis i rezervni delovi',
    desc: 'Podrška i nakon kupovine proizvoda',
  },
];

export const ProductTrustStrip = () => (
  <section className="product-trust-strip" aria-label="Prednosti kupovine">
    <div className="container">
      <div className="product-trust-bar">
        {items.map(({ icon, title, desc }) => (
          <div key={title} className="product-trust-item">
            <span className="product-trust-icon" aria-hidden>
              <FontAwesomeIcon icon={icon} />
            </span>
            <div className="product-trust-copy">
              <p className="product-trust-title">{title}</p>
              <p className="product-trust-desc">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
