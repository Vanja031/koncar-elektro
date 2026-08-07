'use client';

import { InfoPageShell } from '@/components/static/InfoPageShell';
import { companyInfo } from '@/data/staticPages';

const breadcrumbs = [{ label: 'Početna', href: '/' }, { label: 'Politika privatnosti' }];

const PrivacyPolicyPage = () => (
  <InfoPageShell breadcrumbs={breadcrumbs} title="Politika privatnosti">
    <div className="prose prose-sm max-w-3xl">
      <p>
        {companyInfo.legalName} ({companyInfo.address.full}) poštuje privatnost posetilaca i
        kupaca na sajtu {companyInfo.name.toLowerCase()}. Ova politika objašnjava koje podatke
        prikupljamo, u koje svrhe i koja prava imate u vezi sa njima.
      </p>

      <h2>Koje podatke prikupljamo</h2>
      <ul>
        <li>Podaci koje unesete pri poručivanju: ime, prezime, adresa, telefon, email.</li>
        <li>Podaci o korpi i porudžbinama — čuvaju se lokalno u vašem pregledaču i na našem serveru radi obrade porudžbine.</li>
        <li>Tehnički podaci o poseti (stranice koje posetite, uređaj, približna lokacija) — samo uz vašu saglasnost, putem analitičkih kolačića.</li>
      </ul>

      <h2>Kolačići (cookies)</h2>
      <p>
        Koristimo neophodne kolačiće za osnovne funkcije sajta (korpa, prijava) koji se ne mogu
        isključiti jer su preduslov za rad prodavnice. Analitičke kolačiće (npr. Google Analytics)
        koristimo samo ako to izričito prihvatite u baneru za saglasnost — svoj izbor možete
        promeniti u bilo kom trenutku brisanjem kolačića u pregledaču.
      </p>

      <h2>Svrha obrade podataka</h2>
      <ul>
        <li>Obrada i isporuka porudžbina.</li>
        <li>Komunikacija u vezi sa porudžbinom, reklamacijom ili upitom.</li>
        <li>Unapređenje sajta na osnovu anonimizovane analitike (uz saglasnost).</li>
      </ul>

      <h2>Deljenje podataka sa trećim licima</h2>
      <p>
        Podatke ne prodajemo. Delimo ih isključivo sa kurirskom službom (radi isporuke) i, kada je
        primenjivo, sa platnim procesorom (radi obrade plaćanja karticom).
      </p>

      <h2>Vaša prava</h2>
      <p>
        Imate pravo da zatražite uvid, izmenu ili brisanje vaših podataka. Zahtev možete poslati na{' '}
        <a href={`mailto:${companyInfo.email}`}>{companyInfo.email}</a> ili pozivom na{' '}
        {companyInfo.phones.join(' / ')}.
      </p>

      <h2>Kontakt</h2>
      <p>
        {companyInfo.legalName}
        <br />
        {companyInfo.address.full}
        <br />
        Email: <a href={`mailto:${companyInfo.email}`}>{companyInfo.email}</a>
      </p>
    </div>
  </InfoPageShell>
);

export default PrivacyPolicyPage;
