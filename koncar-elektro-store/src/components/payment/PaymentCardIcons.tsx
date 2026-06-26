import visa from '@/assets/visa.png';
import master from '@/assets/master.png';
import maestro from '@/assets/maestro.svg';
import dina from '@/assets/dina.webp';

const cards = [
  { src: visa, alt: 'Visa' },
  { src: master, alt: 'Mastercard' },
  { src: maestro, alt: 'Maestro' },
  { src: dina, alt: 'Dina' },
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
