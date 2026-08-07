'use client';

import { InfoPageShell } from '@/components/static/InfoPageShell';
import { PaymentCardIcons } from '@/components/payment/PaymentCardIcons';
import { BankSecurityBadges } from '@/components/payment/BankSecurityBadges';
import { companyInfo } from '@/data/staticPages';

const breadcrumbs = [{ label: 'Početna', href: '/' }, { label: 'Način plaćanja' }];

/** Content from live site `/nacin-placanja`, extended with card payment (RaiAccept). */
const PaymentMethodsPage = () => (
  <InfoPageShell
    breadcrumbs={breadcrumbs}
    title="Način plaćanja"
    subtitle="Proizvode koje želite da kupite možete platiti na sledeće načine."
  >
    <div className="prose prose-sm max-w-3xl">
      <p>
        Način plaćanja birate u poslednjem koraku procesa naručivanja. Neophodne podatke za
        plaćanje dobijate putem emaila neposredno nakon kreiranja narudžbenice.
      </p>

      <h2>Platne kartice</h2>
      <p>
        Prihvatamo platne kartice Visa, Mastercard, Maestro i DinaCard. Unos podataka o kartici
        obavlja se na bezbednoj stranici platnog procesora RaiAccept (Raiffeisen banka). Podaci o
        kartici se ne čuvaju na našem sajtu. Plaćanje je zaštićeno 3D Secure programima Visa Secure
        i Mastercard Identity Check.
      </p>
      <PaymentCardIcons size="md" className="not-prose my-4" />
      <BankSecurityBadges variant="light" className="not-prose my-4" />

      <h2>Uplata na šalteru / nalog za prenos</h2>
      <p>
        Plaćanje uplatnicom na šalteru podrazumeva da nakon naručivanja iznos sa narudžbenice
        uplatite putem opšte uplatnice na šalteru pošte ili bilo koje poslovne banke. Ukoliko
        kupujete kao pravno lice (firma) na šalteru se popunjava „nalog za prenos“.
      </p>

      <h2>E-banking / uplata na račun</h2>
      <p>
        Plaćanje e-bankingom podrazumeva da nakon naručivanja iznos sa narudžbenice uplatite
        e-bankingom preko svog računara. E-banking je opcija plaćanja koju vam omogućava vaša
        poslovna banka. Za više informacija konsultujte svoju banku kod koje posedujete tekući
        račun. Instrukcije za uplatu stižu na email nakon potvrde porudžbine.
      </p>
      <p>
        <strong>Tekući račun:</strong> {companyInfo.bankAccount}
        <br />
        <strong>Primalac:</strong> {companyInfo.legalName}
      </p>

      <h2>Plaćanje pouzećem</h2>
      <p>
        Plaćanje pouzećem podrazumeva plaćanje iznosa sa narudžbenice prilikom preuzimanja pošiljke.
        Plaćanje se vrši u gotovom novcu na ruke kuriru koji vam donosi pošiljku.
      </p>

      <h2>Napomena</h2>
      <p>
        Ukoliko ne izvršite plaćanje po narudžbenici u roku od 7 dana od dana njenog kreiranja
        (za uplate na račun), ista može biti stornirana. Nakon isteka perioda od 7 dana plaćanje po
        toj narudžbenici nije moguće, ali možete napraviti novu narudžbenicu i izvršiti uplatu po
        njoj.
      </p>

      <h2>Kontakt</h2>
      <p>
        {companyInfo.legalName}
        <br />
        {companyInfo.address.full}
        <br />
        PIB: {companyInfo.registry.pib} · Matični broj: {companyInfo.registry.mb}
        <br />
        Tel: {companyInfo.phones.join(' | ')}
        <br />
        Email: <a href={`mailto:${companyInfo.email}`}>{companyInfo.email}</a>
      </p>
    </div>
  </InfoPageShell>
);

export default PaymentMethodsPage;
