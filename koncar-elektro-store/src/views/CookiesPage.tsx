'use client';

import { InfoPageShell } from '@/components/static/InfoPageShell';
import { companyInfo } from '@/data/staticPages';

const breadcrumbs = [{ label: 'Početna', href: '/' }, { label: 'Kolačići (cookies)' }];

/**
 * Old URL: `/kolacici-cookies/`
 * Improved copy aligned with current cookie consent + privacy policy.
 */
const CookiesPage = () => (
  <InfoPageShell
    breadcrumbs={breadcrumbs}
    title="Kolačići (cookies)"
    subtitle="Kako koristimo kolačiće na sajtu i kako možete da upravljate saglasnošću."
  >
    <div className="prose prose-sm max-w-3xl">
      <p>
        {companyInfo.website.replace('https://', '')} koristi kolačiće da bi sajt radio ispravno, da
        bismo zapamtili vašu korpu i — samo uz vašu saglasnost — da merimo posetu i unapređujemo
        ponudu. Cookie je mali tekstualni fajl koji pregledač sačuva na vašem uređaju ako to
        dozvolite.
      </p>

      <h2>Šta kolačići nisu</h2>
      <p>
        Kolačići ne mogu da pokrenu programe, ne šalju viruse i ne čitaju podatke sa vašeg hard
        diska. Ne mogu da čitaju kolačiće drugih sajtova — samo domen koji ih je postavio može da ih
        čita ili briše.
      </p>

      <h2>Koje kolačiće koristimo</h2>
      <ul>
        <li>
          <strong>Neophodni</strong> — korpa, sesija, bezbednost i osnovne funkcije prodavnice. Bez
          njih sajt ne može pouzdano da radi.
        </li>
        <li>
          <strong>Preferencije</strong> — npr. izbor saglasnosti za analitiku (Prihvati / Odbij u
          baneru).
        </li>
        <li>
          <strong>Analitički</strong> — Google Analytics (GA4), isključivo ako prihvatite kolačiće u
          baneru. Ako odbijete, analitika se ne učitava.
        </li>
      </ul>

      <h2>Zašto prikupljamo tehničke podatke</h2>
      <ul>
        <li>Poboljšanje proizvoda, usluga i korisničkog iskustva</li>
        <li>Razumevanje koje stranice i proizvodi su najkorisniji</li>
        <li>Interna analitika rada sajta (uz saglasnost gde je zakonski potrebna)</li>
      </ul>

      <h2>Kako da upravljate kolačićima</h2>
      <p>
        Pri prvoj poseti možete da prihvatite ili odbijete neobavezne kolačiće u baneru. Izbor možete
        promeniti brisanjem kolačića za ovaj domen u podešavanjima pregledača — baner će se ponovo
        prikazati. Isključivanje svih kolačića u pregledaču može onemogućiti korpu i deo funkcionalnosti
        prodavnice.
      </p>

      <h2>Lični podaci i treća lica</h2>
      <p>
        Ne prodajemo vaše lične podatke. Delimo ih samo sa pouzdanim partnerima potrebnim za rad
        prodavnice (npr. dostava, plaćanje karticom) ili kada to zahteva zakon. Više detalja:{' '}
        <a href="/politika-privatnosti">Politika privatnosti</a>.
      </p>

      <h2>Eksterni linkovi</h2>
      <p>
        Sajt može sadržati linkove ka sajtovima trećih lica. Za njihove kolačiće i politike privatnosti
        odgovorni su ti sajtovi — preporučujemo da pročitate njihova pravila pre unosa podataka.
      </p>

      <h2>Kontakt</h2>
      <p>
        Pitanja o kolačićima i privatnosti:{' '}
        <a href={`mailto:${companyInfo.email}`}>{companyInfo.email}</a> · {companyInfo.legalName},{' '}
        {companyInfo.address.full}.
      </p>
    </div>
  </InfoPageShell>
);

export default CookiesPage;
