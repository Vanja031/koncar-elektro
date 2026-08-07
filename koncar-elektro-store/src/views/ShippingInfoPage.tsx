'use client';

import { InfoPageShell } from '@/components/static/InfoPageShell';
import { companyInfo } from '@/data/staticPages';

const breadcrumbs = [{ label: 'Početna', href: '/' }, { label: 'Dostava' }];

/** Content from live site `/nacini-isporuke`. */
const ShippingInfoPage = () => (
  <InfoPageShell
    breadcrumbs={breadcrumbs}
    title="Načini isporuke"
    subtitle="Dostavu pošiljaka vrše naše partnerske kurirske službe."
  >
    <div className="prose prose-sm max-w-3xl">
      <p>
        Dostavu pošiljaka vrše naše partnerske kurirske službe. Cena isporuke zavisi od veličine
        pošiljke i kurirske službe. Tačan trošak dostave prikazuje se u korpi i na checkout stranici
        pre potvrde porudžbine.
      </p>

      <h2>Rokovi</h2>
      <p>
        Ukupno vreme za koje će vam pošiljka biti poslata (uručena) je 2–5 radnih dana od trenutka
        evidentiranja vaše narudžbenice. Trudimo se da sve pošiljke isporučimo i pre vremena, ali u
        određenim slučajevima može doći do zakašnjenja o čemu ćete biti blagovremeno obavešteni.
      </p>

      <h2>Preuzimanje</h2>
      <p>
        Kuriri pošiljke donose na adresu za isporuku u periodu od 08:00 – 16:00 h. Molimo vas da u
        tom periodu obezbedite da na adresi bude osoba koja može preuzeti pošiljku. Prilikom
        preuzimanja pošiljke potrebno je da vizuelno pregledate paket da slučajno ne postoje neka
        vidna oštećenja. Ukoliko primetite da je proizvod možda oštećen, odbijte prijem pošiljke i
        odmah nas obavestite.
      </p>
      <p>
        Ukoliko je pošiljka naizgled bez oštećenja slobodno preuzmite pošiljku i potpišite kuriru
        adresnicu.
      </p>

      <h2>Ponovni pokušaj uručenja</h2>
      <p>
        Kurir pokušava svaku pošiljku da uruči u dva navrata. Uobičajena praksa je da ukoliko vas
        kurir ne pronađe na adresi, da vas pozove na telefon koji ste ostavili prilikom kreiranja
        narudžbenice i ugovori novi termin isporuke. Ukoliko vas i tada ne pronađe na adresi,
        pošiljka će se vratiti nama. Po prijemu pošiljke, kontaktiraćemo vas kako bismo ustanovili
        razlog neuručenja i dogovorili se o ponovnom slanju.
      </p>

      <h2>Lično preuzimanje</h2>
      <p>
        Proizvode koje ste poručili preko našeg sajta možete preuzeti u lokalu — izaberite lično
        preuzimanje prilikom kupovine, ili nas kontaktirajte da dogovorimo termin. Adresa:{' '}
        {companyInfo.address.full}.
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

export default ShippingInfoPage;
