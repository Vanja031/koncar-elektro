'use client';

import { InfoPageShell } from '@/components/static/InfoPageShell';
import { companyInfo } from '@/data/staticPages';

const breadcrumbs = [{ label: 'Početna', href: '/' }, { label: 'Reklamacije' }];

/** Content from live site `/reklamacije`. */
const ComplaintsPage = () => (
  <InfoPageShell
    breadcrumbs={breadcrumbs}
    title="Reklamacije"
    subtitle="Procedura reklamacije na proizvod ili uslugu."
  >
    <div className="prose prose-sm max-w-3xl">
      <p>
        U slučaju da imate bilo kakvu reklamaciju na proizvod ili našu uslugu budite slobodni da nas
        kontaktirate. Budite sigurni da smo spremni i sposobni da rešimo svaku nastalu situaciju.
      </p>

      <h2>Pregled pošiljke pri preuzimanju</h2>
      <p>
        Dužnost kupca je da prilikom preuzimanja pošiljke u prisustvu kurira ustanovi kompletnost i
        fizičku neoštećenost proizvoda koje preuzima, i ukoliko ima nedostataka koje je uočio javi
        odmah inače će izgubiti prava koja mu u vezi s tim pripadaju. Ukoliko je pregled obavljen
        kasnije, ili roba ima skrivene nedostatke koji se nisu mogli odmah uočiti, kupac ima rok od
        sedam dana da o tome obavesti prodavca. Ukoliko na njemu ima vidljivih oštećenja paket ne
        bi trebalo da preuzmete.
      </p>
      <p>
        U tom slučaju molimo vas da nas pozovete telefonom na {companyInfo.phones[0]} ili nam
        pošaljete e-mail sa svojim podacima (ime, prezime, telefon) na adresu{' '}
        <a href={`mailto:${companyInfo.email}`}>{companyInfo.email}</a> i navedete razlog zbog koga
        ste odbili da preuzmete paket. U najkraćem mogućem roku obavestićemo vas o daljem
        postupanju.
      </p>

      <h2>Pogrešna ili nesaobrazna roba</h2>
      <p>
        Ukoliko ste primili pošiljku i nakon otvaranja kutije ustanovili da isporučena roba ne
        odgovara naručenoj ili podaci na računu nisu odgovarajući, molimo vas da nas, najkasnije u
        roku od 24h od trenutka prijema pošiljke, pozovete telefonom ili pošaljete e-mail sa svojim
        podacima i opišete kakav problem imate. U najkraćem mogućem roku obavestićemo vas o daljem
        postupanju.
      </p>

      <h2>Garancija</h2>
      <p>
        {companyInfo.name} je dužan da u toku trajanja garantnog roka zameni robu, da umanji cenu
        ili refundira sredstva. Trajanje garancije za naše proizvode je označeno na ambalaži
        proizvoda. Dužni smo da bez odlaganja, a najkasnije u roku od 7 dana od prijema
        reklamacije, odgovorimo potrošaču, sa izjašnjenjem o podnetom zahtevu i predlogom za
        njegovo rešavanje. Kupac ima pravo na naknadu štete ili da traži adekvatnu zamenu za drugi
        proizvod. Ukoliko se utvrdi da oštećenje na proizvodu nije nastalo fabričkim putem, kupac
        će biti obavešten o daljem postupku.
      </p>

      <h2>Obaveštenje o vansudskom rešavanju potrošačkih sporova</h2>
      <p>
        {companyInfo.name} ovim obaveštava potrošače da smo kao prodavci prema Zakonu o zaštiti
        potrošača („Službeni glasnik RS“, br. 88/2021) obavezni da učestvujemo u vansudskom
        rešavanju potrošačkih sporova pred telom za vansudsko rešavanje potrošačkih sporova, ukoliko
        potrošač podnese predlog za pokretanje postupka vansudskog rešavanja potrošačkog spora
        neposredno, preko pošte ili elektronskim putem Ministarstvu nadležnom za poslove zaštite
        potrošača.
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

export default ComplaintsPage;
