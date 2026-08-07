import visa from '@/assets/payments/visa.png';
import master from '@/assets/payments/mastercard.png';
import maestro from '@/assets/payments/maestro.png';
import dina from '@/assets/payments/dinacard.jpg';

/** Card-brand logos from the Raiffeisen brand pack (Uputstvo: unchanged form). */
const cards = [
  { src: visa, alt: 'Visa' },
  { src: master, alt: 'Mastercard' },
  { src: maestro, alt: 'Maestro' },
  { src: dina, alt: 'DinaCard' },
] as const;

type Props = {
  className?: string;
  size?: 'sm' | 'md';
};

export const PaymentCardIcons = ({ className = '', size = 'md' }: Props) => (
  <ul className={`payment-card-icons payment-card-icons--${size} ${className}`} aria-label="Prihvaćene kartice">
    {cards.map((card) => (
      <li key={card.alt}>
        <img src={card.src} alt={card.alt} className="payment-card-icons-img" loading="lazy" />
      </li>
    ))}
  </ul>
);
