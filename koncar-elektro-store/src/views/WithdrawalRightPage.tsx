'use client';

import { InfoPageShell } from '@/components/static/InfoPageShell';
import { companyInfo } from '@/data/staticPages';

const breadcrumbs = [{ label: 'Početna', href: '/' }, { label: 'Pravo na odustajanje' }];

/** Content from live site `/pravo-na-odustajanje`. */
const WithdrawalRightPage = () => (
  <InfoPageShell
    breadcrumbs={breadcrumbs}
    title="Pravo na odustajanje"
    subtitle="Odustanak od ugovora zaključenog na daljinu, u skladu sa Zakonom o zaštiti potrošača."
  >
    <div className="prose prose-sm max-w-3xl">
      <p>
        Poštovani kupci, obaveštavamo vas da se prema Zakonu o zaštiti potrošača (Službeni glasnik
        RS, br. 88/2021) kupovina preko naše prodajne internet stranice {companyInfo.website} smatra
        prodajom na daljinu.
      </p>
      <p>
        Zakon za slučaj prodaje na daljinu ustanovljava pravo kupca, koji se smatra potrošačem
        (fizičko lice koje proizvod kupuje radi namirenja svojih individualnih potreba, a ne radi
        obavljanja profesionalne delatnosti), da odustane od ugovora u roku od 14 dana od dana kada
        mu je proizvod predat. Prilikom odustanka kupac može, ali ne mora da navede razloge zbog
        kojih odustaje.
      </p>

      <h2>Izjava o odustanku</h2>
      <p>
        Obrazac/izjava o odustanku od ugovora proizvodi pravno dejstvo od dana kada je poslata
        trgovcu. Izjavu možete poslati na{' '}
        <a href={`mailto:${companyInfo.email}`}>{companyInfo.email}</a> uz broj porudžbine, ili nas
        kontaktirati telefonom.
      </p>

      <h2>Povraćaj robe i novca</h2>
      <p>
        U slučaju odustanka od ugovora, potrošač ima pravo na povraćaj novca ili na zamenu za drugi
        proizvod. Cena se kupcu vraća po prijemu proizvoda, i nakon što se utvrdi da je proizvod
        neoštećen i ispravan.
      </p>
      <p>
        Kupac je dužan da proizvod vrati bez odlaganja, a najkasnije u roku od 14 dana od dana kada
        je poslao obrazac za odustanak. Po isteku roka od 14 dana od dana kada je poslao odustanak,
        proizvod se više ne može vratiti.
      </p>
      <p>
        Prilikom povraćaja robe obavezno je vratiti u ispravnom i nekorišćenom stanju i originalno
        neoštećenom pakovanju, pri čemu se mora priložiti i račun-otpremnica koju je kupac
        prethodno dobio uz porudžbinu.
      </p>
      <p>
        Po prijemu proizvoda utvrdiće se da li je proizvod ispravan i neoštećen. Kupac odgovara za
        neispravnost ili oštećenje proizvoda koji su rezultat neadekvatnog rukovanja proizvodom,
        tj. kupac je isključivo odgovoran za umanjenu vrednost proizvoda koja nastane kao posledica
        rukovanja robom na način koji nije adekvatan, odnosno prevazilazi ono što je neophodno da
        bi se ustanovili njegova priroda, karakteristike i funkcionalnost. Ukoliko se utvrdi da je
        nastupila neispravnost ili oštećenje proizvoda krivicom kupca, odbiće se vraćanje cene i
        proizvod će mu biti vraćen na njegov trošak.
      </p>
      <p>
        Trgovac je dužan da potrošaču bez odlaganja vrati iznos koji je potrošač platio po osnovu
        ugovora, a najkasnije u roku od 14 dana od dana prijema izjave o odustanku, a nakon prijema
        proizvoda. Troškove vraćanja robe i novca snosi kupac, sem u slučajevima kada kupac dobije
        neispravan ili pogrešan artikal.
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

export default WithdrawalRightPage;
