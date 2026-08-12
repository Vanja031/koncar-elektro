'use client';

import { InfoPageShell } from '@/components/static/InfoPageShell';
import { companyInfo, contactChannels } from '@/data/staticPages';

const breadcrumbs = [{ label: 'Početna', href: '/' }, { label: 'Naručivanje' }];

/**
 * Old URL: `/narucivanje/`
 * Updated for guest checkout (registration no longer required) + current phones.
 */
const OrderingPage = () => (
  <InfoPageShell
    breadcrumbs={breadcrumbs}
    title="Naručivanje"
    subtitle="Kako da naručite online ili telefonom — korak po korak."
  >
    <div className="prose prose-sm max-w-3xl">
      <p>
        Proizvode sa sajta {companyInfo.name} možete naručiti na dva načina: putem sajta (online) ili
        telefonom. Proces je sličan kupovini u fizičkoj prodavnici — prvo odaberete artikle, zatim
        potvrdite podatke za isporuku i plaćanje.
      </p>

      <h2>Naručivanje putem sajta</h2>
      <ol>
        <li>
          Pronađite proizvod pretragom, kroz kategorije ili na stranicama akcije / najprodavanije.
        </li>
        <li>
          Na stranici proizvoda kliknite <strong>Dodaj u korpu</strong>. U korpu možete staviti jedan
          ili više artikala.
        </li>
        <li>
          Otvorite <a href="/korpa">Korpu</a>, proverite količine i uklonite stavke koje ne želite.
        </li>
        <li>
          Kliknite <strong>Nastavi na plaćanje</strong> i unesite podatke naručioca i adresu
          isporuke.
        </li>
        <li>
          Izaberite način plaćanja (kartica, pouzeće ili virman — detalji na{' '}
          <a href="/nacin-placanja">Način plaćanja</a>).
        </li>
        <li>
          Pregledajte sažetak porudžbine (proizvodi, dostava, ukupno) i potvrdite porudžbinu.
        </li>
      </ol>
      <p>
        Nakon potvrde dobićete email sa detaljima narudžbenice. Status i pripremu pošiljke možete
        pratiti u komunikaciji sa nama ili putem podataka iz emaila.
      </p>

      <h2>Registracija nije obavezna</h2>
      <p>
        Kupovinu možete završiti i kao gost — nije potrebno da kreirate nalog. Ako želite, možete se
        registrovati radi bržeg popunjavanja podataka pri narednim porudžbinama (
        <a href="/registracija">Registracija</a> / <a href="/prijava">Prijava</a>).
      </p>

      <h2>Naručivanje telefonom</h2>
      <p>
        Ako vam je lakše, naručite telefonom tokom radnog vremena. Pripremite naziv ili šifru
        proizvoda (SKU) i adresu za dostavu.
      </p>
      <ul>
        <li>
          <strong>Telefon:</strong>{' '}
          <a href={contactChannels.primaryPhoneHref}>{companyInfo.phones[0]}</a>
          {companyInfo.phones[1] ? (
            <>
              {' / '}
              <a href={contactChannels.secondaryPhoneHref}>{companyInfo.phones[1]}</a>
            </>
          ) : null}
        </li>
        <li>
          <strong>Email:</strong>{' '}
          <a href={contactChannels.emailHref}>{companyInfo.email}</a>
        </li>
        <li>
          <strong>Adresa:</strong> {companyInfo.address.full}
        </li>
      </ul>

      <h2>Povezane informacije</h2>
      <ul>
        <li>
          <a href="/nacini-isporuke">Načini isporuke</a>
        </li>
        <li>
          <a href="/nacin-placanja">Način plaćanja</a>
        </li>
        <li>
          <a href="/pravo-na-odustajanje">Pravo na odustajanje</a>
        </li>
        <li>
          <a href="/reklamacije">Reklamacije</a>
        </li>
      </ul>
    </div>
  </InfoPageShell>
);

export default OrderingPage;
