import raiffeisenPos from '@/assets/payments/raiffeisen-pos.png';
import raiffeisenNeg from '@/assets/payments/raiffeisen-neg.png';
import visaSecurePos from '@/assets/payments/visa-secure-pos.png';
import visaSecureNeg from '@/assets/payments/visa-secure-neg.png';
import mcIdCheckPos from '@/assets/payments/mastercard-idcheck-pos.png';
import mcIdCheckNeg from '@/assets/payments/mastercard-idcheck-neg.png';

/**
 * Bank-mandated branding (Raiffeisen Uputstvo + E-commerce check lista):
 * - Raiffeisen logo → www.raiffeisenbank.rs (home + payment pages)
 * - 3D Secure logos SEPARATE from card-brand icons (Visa Secure, Mastercard ID Check)
 * - Dimensions: 60–155px (per bank instruction)
 */
const LINKS = {
  raiffeisen: 'https://www.raiffeisenbank.rs',
  visaSecure:
    'https://rs.visa.com/run-your-business/small-business-tools/payment-technology/visa-secure.html',
  mastercardIdCheck:
    'https://www.mastercard.rs/sr-rs/korisnici/podrska/sigurnost-i-zastita/identity-check.html',
} as const;

type Props = {
  className?: string;
  /** `dark` = footer / dark backgrounds (negative logos). */
  variant?: 'light' | 'dark';
};

export const BankSecurityBadges = ({ className = '', variant = 'light' }: Props) => {
  const isDark = variant === 'dark';
  const raiffeisen = isDark ? raiffeisenNeg : raiffeisenPos;
  const visaSecure = isDark ? visaSecureNeg : visaSecurePos;
  const mcIdCheck = isDark ? mcIdCheckNeg : mcIdCheckPos;

  return (
    <div className={`bank-security-badges bank-security-badges--${variant} ${className}`}>
      <a
        href={LINKS.raiffeisen}
        target="_blank"
        rel="noopener noreferrer"
        className="bank-security-badges-link"
        aria-label="Raiffeisen banka"
      >
        <img src={raiffeisen} alt="Raiffeisen banka" className="bank-security-badges-img bank-security-badges-img--bank" />
      </a>

      <span className="bank-security-badges-sep" aria-hidden />

      <ul className="bank-security-badges-secure" aria-label="3D Secure zaštita">
        <li>
          <a
            href={LINKS.visaSecure}
            target="_blank"
            rel="noopener noreferrer"
            className="bank-security-badges-link"
            aria-label="Visa Secure"
          >
            <img src={visaSecure} alt="Visa Secure" className="bank-security-badges-img" />
          </a>
        </li>
        <li>
          <a
            href={LINKS.mastercardIdCheck}
            target="_blank"
            rel="noopener noreferrer"
            className="bank-security-badges-link"
            aria-label="Mastercard Identity Check"
          >
            <img src={mcIdCheck} alt="Mastercard Identity Check" className="bank-security-badges-img" />
          </a>
        </li>
      </ul>
    </div>
  );
};
