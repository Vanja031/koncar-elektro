'use client';

import { InfoPageShell } from '@/components/static/InfoPageShell';
import { companyInfo } from '@/data/staticPages';

type Props = {
  /** Old SEO URL uses „korišćenja“; bank/checkout alias uses „kupovine“. */
  variant?: 'koriscenja' | 'kupovine';
};

const copy = {
  koriscenja: {
    title: 'Uslovi korišćenja',
    subtitle:
      'Pravila pri kupovini koja obezbeđuju kvalitet naše usluge i zadovoljstvo kupaca.',
  },
  kupovine: {
    title: 'Uslovi kupovine',
    subtitle:
      'Pravila pri kupovini koja obezbeđuju kvalitet naše usluge i zadovoljstvo kupaca.',
  },
} as const;

/** Content adapted from live `/uslovi-koriscenja` + firm registry; improved wording. */
const TermsOfSalePage = ({ variant = 'koriscenja' }: Props) => {
  const { title, subtitle } = copy[variant];
  const breadcrumbs = [{ label: 'Početna', href: '/' }, { label: title }];

  return (
    <InfoPageShell breadcrumbs={breadcrumbs} title={title} subtitle={subtitle}>
      <div className="prose prose-sm max-w-3xl">
        <h2>Podaci o prodavcu</h2>
        <ul>
          <li>
            <strong>Naziv:</strong> {companyInfo.legalName}
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
            <strong>Internet adresa:</strong>{' '}
            <a href={companyInfo.website}>{companyInfo.website}</a>
          </li>
          <li>
            <strong>Kontakt telefon:</strong> {companyInfo.phones.join(' / ')}
          </li>
          <li>
            <strong>Kontakt e-mail:</strong>{' '}
            <a href={`mailto:${companyInfo.email}`}>{companyInfo.email}</a>
          </li>
          <li>
            <strong>Tekući račun:</strong> {companyInfo.bankAccount}
          </li>
        </ul>

        <h2>Garancija kvaliteta</h2>
        <p>
          {companyInfo.name} garantuje za kvalitet svojih proizvoda. Svi proizvodi su originalne
          robne marke i odgovaraju specifikaciji navedenoj na sajtu.
        </p>

        <h2>Reklamacije i povraćaj robe</h2>
        <p>
          U slučaju nedostataka proizvoda koji proizilaze iz nepodudarnosti stvarnih sa propisanim
          odnosno deklarisanim karakteristikama kvaliteta, {companyInfo.name} će zameniti proizvod
          ili vratiti novac. Da bi se izbegli nesporazumi, prilikom isporuke dužnost prodavca i kupca
          je da izvrše pregled proizvoda i da ukažu na eventualna mehanička oštećenja, u kom slučaju
          će proizvod biti zamenjen. Detalje potražite na stranicama{' '}
          <a href="/reklamacije">Reklamacije</a> i{' '}
          <a href="/pravo-na-odustajanje">Pravo na odustajanje</a>.
        </p>

        <h2>Privatnost podataka</h2>
        <p>
          Da bismo uspešno obradili vašu narudžbu potrebni su nam vaše ime i prezime, adresa, e-mail
          i telefon. Uz pomoć tih podataka bićemo u mogućnosti da vam isporučimo željenu robu, kao i
          da vas obavestimo o trenutnom statusu narudžbe. U ime {companyInfo.name} obavezujemo se da
          ćemo čuvati privatnost svih naših kupaca. Prikupljamo samo neophodne, osnovne podatke o
          kupcima i podatke neophodne za poslovanje i informisanje korisnika u skladu sa dobrim
          poslovnim običajima i u cilju pružanja kvalitetne usluge. Svi podaci o kupcima/korisnicima
          se strogo čuvaju i dostupni su samo zaposlenima kojima su podaci nužni za obavljanje
          posla. Svi zaposleni {companyInfo.name} odgovorni su za poštovanje načela zaštite
          privatnosti.
        </p>
        <p>
          Pored navedenih prikupljamo, analiziramo i obrađujemo podatke o proizvodima koje naši
          posetioci traže i kupuju, kao i o stranicama koje posećuju. Te podatke koristimo da bismo
          poboljšali ponudu i izgled naših stranica, i omogućili vam jednostavnije korišćenje,
          sigurniju i udobniju kupovinu. Obavezujemo se da prikupljene podatke ne koristimo ni u koje
          druge svrhe. Više u <a href="/politika-privatnosti">Politici privatnosti</a>.
        </p>

        <h2>Opisi proizvoda</h2>
        <p>
          {companyInfo.name} nastoji da sve proizvode opiše što je tačnije moguće. Takođe,{' '}
          {companyInfo.name} ne garantuje da su svi navedeni podaci u vezi proizvoda 100% tačni,
          kompletni, pouzdani i bez grešaka. Ako proizvod koji ste kupili odstupa od podataka koji
          su navedeni na sajtu možete ga vratiti u nekorišćenom stanju sa kompletnom dokumentacijom
          koju ste uz njega dobili, a mi ćemo vam vratiti novac.
        </p>

        <h2>Cene proizvoda</h2>
        <p>
          Sve cene proizvoda navedene na sajtu su sa uračunatim PDV-om, u dinarima (RSD).{' '}
          {companyInfo.name} se obavezuje da će prihvatiti svaku cenu po kojoj ste napravili
          narudžbenicu bez obzira da li se cena proizvoda promenila nakon kreiranja narudžbenice.{' '}
          {companyInfo.name} ima pravo da otkaže narudžbenicu uz slanje email obaveštenja potrošaču
          ukoliko je došlo do grube greške prilikom postavljanja cene na sajtu.
        </p>

        <h2>Plaćanje i dostava</h2>
        <p>
          Dostupne načine plaćanja opisujemo na stranici{' '}
          <a href="/nacin-placanja">Način plaćanja</a>. Uslove isporuke potražite na stranici{' '}
          <a href="/nacini-isporuke">Dostava</a>.
        </p>

        <h2>Saglasnost i promene uslova</h2>
        <p>
          Korišćenje naših servisa podrazumeva saglasnost korisnika sa svim navedenim na ovoj strani.{' '}
          {companyInfo.name} se obavezuje da će se pridržavati svega navedenog, a sve promene uslova
          postaju važeće tek nakon objavljivanja na ovoj strani.
        </p>

        <h2>Intelektualna svojina</h2>
        <p>
          Sadržaj prikazan na ovom sajtu (stranice, dizajnerski elementi, tekstualni, video i audio
          materijali, fotografije, logotipi…) u vlasništvu je {companyInfo.name}. Neovlašćeno
          korišćenje bilo kog dela portala, bez dozvole vlasnika autorskih prava, smatra se kršenjem
          autorskih prava.
        </p>
      </div>
    </InfoPageShell>
  );
};

export default TermsOfSalePage;
