'use client';

import { InfoPageShell } from '@/components/static/InfoPageShell';
import { companyInfo, contactChannels } from '@/data/staticPages';

const breadcrumbs = [{ label: 'Početna', href: '/' }, { label: 'Podaci o firmi' }];

/**
 * Old URL: `/podaci-o-firmi/` — registry / contact block for consumers.
 * Content cleaned and aligned with current companyInfo.
 */
const CompanyInfoPage = () => (
  <InfoPageShell
    breadcrumbs={breadcrumbs}
    title="Podaci o firmi"
    subtitle="Zvanični podaci o prodavcu — za fakture, reklamacije i pravnu identifikaciju."
  >
    <div className="prose prose-sm max-w-3xl">
      <p>
        Ispod su podaci o prodavcu koji se koriste na računima, u komunikaciji sa kupcima i u
        skladu sa propisima o trgovini na daljinu.
      </p>

      <h2>Pravno lice</h2>
      <ul>
        <li>
          <strong>Naziv:</strong> {companyInfo.legalName}
        </li>
        <li>
          <strong>Trgovački naziv:</strong> {companyInfo.name}
        </li>
        <li>
          <strong>Adresa sedišta:</strong> {companyInfo.address.full}
        </li>
        <li>
          <strong>PIB:</strong> {companyInfo.registry.pib}
        </li>
        <li>
          <strong>Matični broj:</strong> {companyInfo.registry.mb}
        </li>
        <li>
          <strong>Šifra delatnosti:</strong> {companyInfo.registry.activityCode} —{' '}
          {companyInfo.registry.activity}
        </li>
        <li>
          <strong>Tekući račun:</strong> {companyInfo.bankAccount}
        </li>
      </ul>

      <h2>Kontakt</h2>
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
          <strong>Internet prodavnica:</strong>{' '}
          <a href={companyInfo.website}>{companyInfo.website}</a>
        </li>
      </ul>

      <h2>Radno vreme</h2>
      <ul>
        {companyInfo.supportHours.map((row) => (
          <li key={row.day}>
            <strong>{row.day}:</strong> {row.hours}
          </li>
        ))}
      </ul>

      <p>
        Za porudžbine, servis i tehničku podršku koristite stranicu{' '}
        <a href="/kontakt">Kontakt</a> ili sticky dugme „Stručna pomoć“ na sajtu.
      </p>
    </div>
  </InfoPageShell>
);

export default CompanyInfoPage;
