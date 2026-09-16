/**
 * Polish WooCommerce category hero descriptions (hubs + mid-levels + leaves).
 * Usage: node scripts/polish-category-hero-descriptions.mjs [--dry-run]
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const dryRun = process.argv.includes('--dry-run');

function loadEnv() {
  const envPath = resolve(root, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
}

loadEnv();

const BASE = (process.env.NEXT_PUBLIC_WP_API_URL || '').replace(/\/$/, '');
const CK = process.env.WC_CONSUMER_KEY || '';
const CS = process.env.WC_CONSUMER_SECRET || '';
if (!BASE || !CK || !CS) {
  console.error('Missing WP URL / WC keys in .env');
  process.exit(1);
}

const auth = 'Basic ' + Buffer.from(`${CK}:${CS}`).toString('base64');

/** Exact copy for hubs and mid-level listing pages (slug → text). */
export const FIXED_DESCRIPTIONS = {
  // Roots / hubs
  'elektricni-alat':
    'Električni alati za radionicu i teren — bušilice, brusilice, testere i više. Provereni brendovi, garancija i brza dostava.',
  'akumulatorski-alat':
    'Akumulatorski alati za rad bez kabla: bušilice, odvijači, testere i setovi. Veliki izbor na stanju uz stručnu podršku.',
  'rucni-alat-i-pribor':
    'Ručni alati i pribor za precizan rad — ključevi, klešta, odvijači i organizacija alata. Kvalitet za majstore i hobi.',
  'aparati-za-varenje':
    'Aparati za varenje, elektrode i oprema za MIG, TIG i MMA. Rešenja za radionicu, montažu i terenski rad.',
  'htz-oprema':
    'HTZ oprema i lična zaštita na radu — kacige, rukavice, naočare i radna odeća. Bezbednost prema propisima.',
  'kompresori-i-pneumatski-alati':
    'Kompresori i pneumatski alati za farbanje, duvanje i radionicu. Uljni i bezuljni modeli različitih snaga.',
  agregati:
    'Benzinski, dizel i inverterski agregati za pouzdano napajanje kod kuće, na gradilištu i u privredi.',
  'kosacice-i-trimeri-dobra':
    'Kosačice, trimeri i baštenski alati za uređen travnjak i dvorište. Benzinski, električni i aku modeli.',
  'kosacice-i-trimeri':
    'Kosačice, trimeri i baštenski alati za uređen travnjak i dvorište. Benzinski, električni i aku modeli.',
  'poljoprivredni-alati-i-oprema':
    'Poljoprivredni alati i oprema za obradu zemlje, košenje i održavanje. Pouzdana rešenja za farmu i okućnicu.',
  'oprema-za-dvoriste':
    'Oprema za dvorište i baštu — zalivanje, čišćenje i održavanje zelenih površina. Praktična rešenja na stanju.',
  'elektromaterijal-i-oprema':
    'Elektromaterijal za instalacije: kablovi, prekidači, osigurači i razvodna oprema. Sve za stručni i kućni rad.',
  rasveta:
    'LED i klasična rasveta za enterijer, eksterijer i industriju. Sijalice, paneli, reflektori i trake.',
  'solarna-elektrana':
    'Oprema za solarne elektrane — paneli, inverteri i kompleti. Ušteda energije za domaćinstva i objekte.',
  'pumpe-za-vodu':
    'Pumpe za vodu za domaćinstvo, baštu i objekat — hidrofori, baštenske i potopne pumpe. Pouzdan protok i pritisak.',
  'pribor-i-potrosni-materijal':
    'Pribor i potrošni materijal za alate — burgije, listovi, diskovi i potrošni delovi. Uvek pri ruci uz alat.',
  pribor:
    'Pribor za alate i radionicu — nastavci, držači, organizacija i potrošni delovi. Dopunite postojeći set.',
  'industrijske-masine':
    'Industrijske mašine i oprema za proizvodnju i radionicu. Pogledajte modele prilagođene profesionalnoj upotrebi.',
  'industrijaske-masine':
    'Industrijske mašine i oprema za proizvodnju i radionicu. Pogledajte modele prilagođene profesionalnoj upotrebi.',
  'merni-instrumenti':
    'Merni instrumenti za precizan rad — metri, libele, laseri i merni pribor. Tačnost u radionici i na terenu.',
  'pistolj-za-farbanje':
    'Pištolji za farbanje i pribor za nanošenje boje. Rešenja za radionicu, karoseriju i majstorski rad.',
  'viljuskari-i-paletari':
    'Viljuškari i paletari za skladište i manipulisanje teretom. Oprema za efikasan unutrašnji transport.',
  'kablovi-i-provodnici':
    'Kablovi i provodnici za elektroinstalacije. Izaberite presek i tip prema nameni — na stanju za brzu isporuku.',
  'razvodni-ormani-i-table':
    'Razvodni ormani i table za instalacije. Kompletna oprema za uredan i bezbedan razvod struje.',
  'motorni-program-ostalo':
    'Motorni program i prateća oprema. Pogledajte dostupne modele i pribor za rad na otvorenom.',
  'pumpa-za-busilice':
    'Pumpe i pribor za bušilice. Dopunite set nastavcima i opremom za efikasniji rad.',
  ponuda:
    'Aktuelna ponuda — noviteti, traženi modeli i proizvodi na stanju. Brza dostava širom Srbije.',
  nesortirano:
    'Ostali proizvodi iz asortimana. Pregledajte dostupne artikle ili nas kontaktirajte za pomoć pri izboru.',

  // Mid-levels — ručni alat
  'rucni-alat':
    'Ručni alat za montažu, popravke i gradilište — ključevi, klešta, čekići, odvijači i više. Kvalitet za svakodnevni rad.',
  'koferi-klaseri-i-nosaci-alata':
    'Koferi, klaseri i nosači alata za urednu organizaciju i transport. Zaštitite alat na putu do objekta.',

  // Mid-levels — HTZ
  'zastita-glave':
    'Zaštita glave na radu — šlemovi, naočare, viziri, maske i antifoni. Bezbednost prema propisima i standardima.',
  'zastitna-obuca':
    'Zaštitna obuća za radilište i radionicu — cipele, čizme i patike. Trajna i udobna zaštita stopala.',
  'zastitna-odeca':
    'Zaštitna odeća za rad na otvorenom i u objektu — jakne, prsluci, majice i radna odela.',
  rukavice:
    'Radne i varilačke rukavice za zaštitu ruku. Izaberite materijal i nivo zaštite prema poslu.',
  ostalo:
    'Dodatna HTZ oprema i pribor. Pogledajte artikle za bezbedan rad na visini i specijalne namene.',

  // Mid-levels — rasveta
  'unutrasnja-rasveta':
    'Unutrašnja rasveta za dom i poslovni prostor — paneli, lustere, plafonjere, spotovi i više.',
  'spoljna-rasveta':
    'Spoljna rasveta za fasadu, dvorište i stazu — reflektori, stubne i zidne svetiljke, solarna rešenja.',
  'industrijska-rasveta':
    'Industrijska rasveta za hale, ulice i objekte — LED zvona, linijske svetiljke, rasteri i vodootporni modeli.',
  sijalice:
    'Sijalice LED, fluo i klasične — ušteda energije i pravi ton svetla za svaku prostoriju.',
  'led-trake-i-oprema':
    'LED trake, napajanja, profili i kontrole. Fleksibilna dekorativna i funkcionalna rasveta.',
  'sinska-rasveta':
    'Šinska rasveta — sine, reflektori i optički setovi. Modularna rešenja za galerije, lokale i enterijer.',
  'panik-i-rucne-lampe':
    'Panik lampe i ručne baterijske lampe za hitne situacije i rad u mraku. Pouzdana mobilna rasveta.',

  // Mid-levels — elektromaterijal
  'elektro-oprema':
    'Elektro oprema za razvodne table — osigurači, FID sklopke, kontaktori i grebenasti prekidači.',
  'elektro-pribor':
    'Elektro pribor za instalacije — kleme, vezice, uvodnice, izolir trake i sijalična grla.',
  'instalaciona-oprema':
    'Instalaciona oprema — cevi, kanalice, kutije, rebrasta creva i industrijski utikači.',
  'automatika-i-kontrola':
    'Automatika i kontrola — senzori, tajmeri, tasteri, bimetali i vazdušne sklopke.',

  // Mid-levels — kablovi
  'energetski-kablovi':
    'Energetski kablovi za napajanje objekata — PP00, X00-A, XHE i samonoseći snopovi. Izbor preseka prema opterećenju.',
  'instalacioni-kablovi':
    'Instalacioni kablovi PP/Y, PP/J, P/L i srodni tipovi za kućne i poslovne instalacije.',
  'bezhalogeni-kablovi':
    'Bezhalogeni kablovi za objekte sa zahtevima požarne bezbednosti. Niži dim i korozivnost pri požaru.',
  'gumirani-kablovi':
    'Gumirani kablovi za fleksibilne i mobilne priključke. Otporni na mehanička opterećenja.',
  'mrezni-i-opticki-kablovi':
    'Mrežni i koaksijalni kablovi — Cat 5e/6/7, RG6, RG59 i RG11. Pouzdani prenos podataka i signala.',
  'signalno-kontrolni-kablovi':
    'Signalno-kontrolni kablovi za automatiku i upravljanje. LiYY, YSLC i srodni tipovi.',
  'telekomunikacioni-kablovi':
    'Telekomunikacioni kablovi JYSTY, LiYCY i srodni tipovi za telefoniju i signalizaciju.',
  provodnici:
    'Provodnici za elektroinstalacije. Izaberite presek i izolaciju prema nameni i opterećenju.',

  // Mid-levels — razvodni ormani
  'metalni-razvodni-ormani':
    'Metalni razvodni ormani — aluminijumski, prohromski i gradilišni modeli za uredan razvod struje.',
  'plasticni-razvodni-ormani':
    'Plastični razvodni ormani ABS i poliester. Lagana i otporna rešenja za razvodne instalacije.',
  'plasticni-razvodne-table':
    'Plastične razvodne table — nadgradne, ugradne i vodootporne. Za uredan razvod u objektu.',

  // Mid-levels — poljoprivreda / bašta
  'kultivatori-i-freze':
    'Kultivatori i freze — benzinski, dizel i električni, plus priključna oprema za obradu zemlje.',
  'prskalice-i-atomizeri':
    'Prskalice i atomizeri — ručni, aku, benzinski i traktorski. Zaštita bilja i nega useva.',
  kosacice:
    'Kosačice za veće površine i traktorsku kosidbu. Pouzdana oprema za travnjak i livadu.',
  'benzinske-kosacice':
    'Benzinske kosačice i motorne kosačice za efikasno košenje travnjaka i većih površina.',
};

/**
 * High-traffic / distinctive leaves — unique SEO copy (not parent templates).
 * Keep ~140–190 chars, keyword in first sentence, benefit in second.
 */
export const LEAF_OVERRIDES = {
  // Električni alat
  busilice: 'Električne bušilice za beton, metal i drvo. Uporedite snagu, udar i stegu — brendovi na stanju sa garancijom.',
  brusilice: 'Električne brusilice za sečenje i brušenje. Ugaone, ravne i specijalne — izbor snage i diska prema poslu.',
  'brusilice-za-zid-zirafe':
    'Brusilice za zid (žirafe) za ravnanje gipsa i maltera. Duži doseg i ujednačen brusni rezultat.',
  'busilice-stubne':
    'Stubne bušilice za precizno bušenje u radionici. Stabilan stub i podesiva dubina.',
  'cekic-busilice-i-stemarice':
    'Čekić bušilice i štemarice za beton i zid. SDS modeli za bušenje i razbijanje.',
  'cepac-za-drva-elektricni-alat':
    'Električni cepači za drva. Brzo i bezbednije cepanje ogrva uz manji napor.',
  'cepac-za-drva':
    'Cepači za drva — električni i hidraulični. Efikasna priprema ogreva za sezonu.',
  dizalice:
    'Dizalice i podizači za radionicu i servis. Bezbedno podizanje vozila i teških delova.',
  'dizalice-elektricni-alat':
    'Električne dizalice za radionicu. Bezbedno podizanje tereta uz manji napor.',
  'elektricni-ostraci-tocila':
    'Električni oštrači i tocila za noževe i alat. Oštra ivica uz jednostavno održavanje.',
  'fen-za-vreli-vazduh':
    'Fenovi za vreli vazduh — skidanje boje, PVC i sušenje. Regulacija temperature po poslu.',
  'ger-masine':
    'Ger mašine za precizne ugaone rezove. Lajsne, profili i lajsne — tačan ugao svaki put.',
  'glodalice-frezeri':
    'Glodalice i frezeri za drvo. Precizni žljebovi, ivice i profili u stolarstvu.',
  kekserice: 'Kekserice za spojeve u stolarstvu. Brzi i čvrsti spojevi ploča bez komplikovane obrade.',
  'lemilice-i-pistolji':
    'Lemilice i pištolji za lemljenje. Elektronika, instalacije i sitne popravke.',
  'mesaci-mikseri':
    'Mešači i mikseri za boju, lepak i malter. Ujednačena smeša bez grudvica.',
  'multifunkcionalni-alati':
    'Multifunkcionalni alati (multitool) za sečenje, brušenje i struganje. Jedna mašina — više nastavaka.',
  'ostali-elektricni-alati':
    'Ostali električni alati iz asortimana. Pogledajte specijalne mašine i pribor na stanju.',
  peraci: 'Perači pod pritiskom za dvorište, vozila i fasade. Jak mlaz za temeljno čišćenje.',
  polirke: 'Polirke za auto i metal. Visok sjaj površina uz odgovarajuće diskove i paste.',
  'pribor-za-ciscenje-i-brusenje':
    'Pribor za čišćenje i brušenje — diskovi, sunđeri i nastavci. Dopunite mašinu potrošnim delovima.',
  'punjaci-akumulatora':
    'Punjači akumulatora za aku alat. Brzo i bezbedno punjenje baterija različitih napona.',
  'rende-i-abrihteri-za-drvo':
    'Rende i abrihteri za drvo. Ravnanje i debljanje ploča u stolarskoj radionici.',
  slajferice: 'Šlajferice za fino brušenje površina. Priprema za farbanje i završnu obradu.',
  'testere-i-cirkulari':
    'Testere i cirkulari za drvo i ploče. Pravi i ugaoni rezovi — ručni i stolni modeli.',
  usisivaci: 'Usisivači za radionicu i gradilište. Sakupljanje prašine i strugotine tokom rada.',
  'zavrtaci-sauberi':
    'Zavrtači (šrauberi) za montažu. Brzo uvrtanje šrafova uz kontrolisan moment.',
  'zavrtaci-udarni':
    'Udarni zavrtači za zahtevnu montažu. Visok moment za duge šrafove i tvrde materijale.',

  // Aku
  'akumulatorske-busilice-odvijaci':
    'Akumulatorske bušilice-odvijači za montažu bez kabla. Izbor napona, momenta i setova baterija na stanju.',
  'akumulatorske-brusilice':
    'Akumulatorske brusilice za sečenje i brušenje na terenu. Mobilnost bez kabla uz dovoljnu snagu.',
  'akumulatorske-cekic-busilice':
    'Akumulatorske čekić bušilice za beton i zid. SDS modeli sa baterijom — rad gde nema utičnice.',
  'akumulatorski-setovi':
    'Akumulatorski setovi alata — više mašina na istom naponu baterije. Štedite na punjačima i ćelijama.',

  // Ručni alat
  klesta: 'Klešta za hvatanje, sečenje i savijanje žice. Kombinirke, bočne i specijalne — kvalitetan čelik za svakodnevni rad.',
  'setovi-alata-i-kljuceva':
    'Setovi alata i ključeva u koferu. Kompletna oprema za montažu, servis i kućne popravke.',
  makaze: 'Makaze za lim, kabel i baštu. Oštri rezovi i ergonomski rukohvat za precizan rad.',
  cekici: 'Čekići za stolarski, zidarski i montažni rad. Različite težine i oblici glave za svaku namenu.',
  'kljucevi-okasti-vilasti-podesivi':
    'Ključevi okasti, vilasti i podesivi. Precizan zahvat matice — setovi i pojedinačni komadi.',
  testere: 'Ručne testere za drvo, metal i plastiku. Listovi i ramovi za precizan rez bez struje.',
  'odvijaci-i-zavrtaci':
    'Odvijači i zavrtači za montažu. Ravni, krstasti i bit setovi — magnetni vrhovi i kvalitetan čelik.',
  'kljucevi-nasadni-i-cevasti':
    'Nasadni i cevasti ključevi za motor i mašine. Račne, nastavci i setovi u koferu.',
  'skalpeli-nozevi-i-seciva':
    'Skalpeli, noževi i sečiva za precizan rez. Zamenska sečiva i ergonomski rukohvati.',
  'keramicarski-i-staklarski-alat-i-pribor':
    'Keramičarski i staklarski alat — rezači, gleterice i pribor za precizan rad sa pločicama i staklom.',
  stege: 'Stege i stezaljke za fiksaciju tokom lepljenja i montaže. Brze i vijčane — različitih otvora.',
  'podmazivanje-i-pistolj-za-silikon':
    'Pištolji za silikon i pribor za podmazivanje. Ujednačeno nanošenje zaptivača i masti.',
  srafcigeri: 'Šrafcigeri i bitovi za svakodnevnu montažu. Magnetni vrhovi i setovi u držaču.',
  'turpije-i-brusni-materijali':
    'Turpije i brusni materijali za obradu metala i drveta. Različiti granulati i oblici.',
  'sekaci-spicevi-pajser-i-probijaci':
    'Sekači, špicevi, pajseri i probijači za razbijanje i montažu. Robusni alati za građevinu.',
  heftalice: 'Heftalice za tapaciranje i montažu. Ručni modeli i heftice različitih debljina.',
  'zatezaci-i-ekspanderi':
    'Zatezači i ekspanderi za montažu i popravke. Kontrola sile i precizan razmak.',
  'zidarski-alat-i-pribor':
    'Zidarski alat i pribor — gleterice, mistrije, libele i kofe. Sve za zidanje i malterisanje.',
  'klesta-za-pop-nitne':
    'Klešta za pop nitne za brzo spajanje limova i profila. Nitne i rezervni delovi na stanju.',
  'olovke-za-vrelo-lepljenje':
    'Olovke za vrelo lepljenje i patroni. Brzo lepljenje plastike, drveta i dekoracije.',
  'molersko-farbarski-alat':
    'Molersko-farbarski alat — valjci, četke i pribor za nanošenje boje. Ujednačen premaz bez mrlja.',
  'dleta-i-renda':
    'Dleta i rende za obradu drveta. Oštre oštrice za precizno dubljenje i ravnanje.',
  'naraznice-i-ureznice':
    'Naraznice i ureznice za narezivanje navoja. Setovi za metričke i colne dimenzije.',
  'kljucevi-usadni':
    'Usadni ključevi za teško dostupna mesta. Dug vek i precizan zahvat matice.',
  'pinovi-i-nosaci':
    'Pinovi i nosači za fiksaciju i montažu. Sitni ali bitni delovi za uredan rad.',
  'cevni-alat':
    'Cevni alat za instalacije — sekači, savijači i ključevi za cevi. Precizan rad na vodovodnim i gasnim linijama.',
  ispitivaci: 'Ispitivači napona i kontinuiteta. Brza provera instalacije pre i posle radova.',

  // Koferi
  koferi: 'Koferi za alat — čvrsta zaštita i uredan transport. Različite veličine za setove i pojedinačne mašine.',
  'torbe-i-nosaci-alata':
    'Torbe i nosači alata za teren. Lagan pristup alatu i udoban prenos na leđima ili ramenu.',
  klaseri: 'Klaseri i organizatori sitnog materijala. Pregrade za vijčanu robu, bitove i pribor.',

  // Bašta / poljo
  'motorne-kosacice':
    'Motorne kosačice za veće travnjake. Benzinski pogon, širina košenja i sakupljač trave po izboru.',
  'traktorska-kosacica':
    'Traktorska kosačica za velike površine. Efikasna kosidba livada i parkova uz traktorski pogon.',
  'benzinski-kultivatori':
    'Benzinski kultivatori za obradu bašte i okućnice. Dubina freziranja i širina rada po modelu.',
  'dizel-kultivatori':
    'Dizel kultivatori za zahtevniju obradu zemlje. Veća snaga i ekonomičan rad na većim parcelama.',
  'elektricni-kultivatori':
    'Električni kultivatori za manje bašte. Tiši rad i jednostavno održavanje bez goriva.',
  'rucne-prskalice':
    'Ručne prskalice za baštu i voćnjak. Precizno nanošenje zaštitnih sredstava i đubriva.',
  'akumulatorske-prskalice':
    'Akumulatorske prskalice bez pumpanja rukom. Ravnomeran pritisak i veći doseg mlaza.',
  'benzinske-prskalice':
    'Benzinske prskalice za veće površine. Visok pritisak i kapacitet rezervoara za profesionalni rad.',
  'benzinski-atomizeri':
    'Benzinski atomizeri za fino raspršivanje. Zaštita bilja i tretman većih zasada.',
  'traktorske-prskalice':
    'Traktorske prskalice za poljoprivredu. Veliki kapacitet i ravnomerna pokrivenost useva.',
  'oprema-za-prskalice':
    'Oprema za prskalice — mlaznice, creva, filteri i zaptivke. Održavanje i zamena potrošnih delova.',
  'prikljucna-oprema':
    'Priključna oprema za kultivatore i freze. Proširite mogućnosti mašine dodatnim nastavcima.',

  // HTZ leaves
  slemovi: 'Zaštitni šlemovi za gradilište i industriju. Udarni otpor i udoban unutrašnji umetak.',
  'naocare-i-viziri':
    'Zaštitne naočare i viziri protiv prašine, strugotine i prskanja. Jasna vidljivost i sigurno prijanjanje.',
  antifoni: 'Antifoni i štitnici sluha za bučna radilišta. Udobno nošenje uz dovoljnu redukciju buke.',
  maske: 'Zaštitne maske i respiratori. Filtracija prašine i aerosola prema uslovima rada.',
  'kacketi-i-kape':
    'Kačketi i kape za rad na suncu i terenu. Lagana zaštita glave uz udobnost tokom celog dana.',
  cipele: 'Zaštitne radne cipele sa kapicom. Protklizni đon i zaštita prstiju na gradilištu.',
  cizme: 'Radne čizme za vlažne i spoljne uslove. Vodootpornost i čvrsta zaštita stopala.',
  patike: 'Radne patike za lakše poslove i magacin. Udobnost uz osnovnu zaštitu.',
  jakne: 'Radne jakne za hladnoću i vetar. Džepovi za alat i trajni materijali.',
  majice: 'Radne majice i polo majice. Udoban kroj za svakodnevni rad u objektu i na terenu.',
  prsluci: 'Radni i signalni prsluci. Vidljivost na gradilištu i dodatni džepovi za sitnice.',
  'radna-odela':
    'Radna odela i kombinezoni. Otporna tkanina za mehaničke radove i servis.',
  'radne-rukavice':
    'Radne rukavice za montažu, skladište i gradilište. Zahvat, otpornost i udobnost po nameni.',
  'varilacke-rukavice':
    'Varilačke rukavice otporne na toplotu i prskanje. Zaštita šaka pri MMA, MIG i TIG varenju.',
  'oprema-za-rad-na-visini':
    'Oprema za rad na visini — pojasevi, užad i pribor. Bezbednost pri radu na skeli i krovu.',

  // Rasveta leaves
  'led-paneli':
    'LED paneli za kancelariju i dom. Ujednačeno svetlo, niska potrošnja i ugradni ili nadgradni modeli.',
  lusteri: 'Lustere za dnevni boravak i salone. Dekorativna i funkcionalna rasveta različitih stilova.',
  plafonjere: 'Plafonjere za hodnike, kupatila i sobe. Ravnomerna rasveta bez zauzimanja prostora.',
  'spot-svetiljke':
    'Spot svetiljke za usmereno osvetljenje. Naglasite zidove, police i radne površine.',
  'podne-lampe':
    'Podne lampe za čitanje i ambijent. Fleksibilno usmerenje svetlosti u dnevnom boravku.',
  'led-rozetne':
    'LED rozetne za plafon. Kompaktan oblik i ušteda energije u odnosu na klasične modele.',
  rozetne: 'Rozetne i plafonska rasveta. Jednostavna montaža i jasan izbor snage i tona svetla.',
  'decija-rasveta':
    'Dečija rasveta — bezbedni i veseli modeli za sobu. Meka svetlost pogodna za učenje i igru.',
  'zidne-lampe':
    'Zidne lampe za hodnik, spavaću sobu i dnevni boravak. Ambient i usmereno svetlo uz zid.',
  'led-reflektori':
    'LED reflektori za dvorište, fasadu i parking. Jak snop, niska potrošnja i dugotrajan rad.',
  'solarna-rasveta':
    'Solarna rasveta bez priključka na mrežu. Automatsko paljenje i ušteda na potrošnji.',
  'stubne-svetiljke':
    'Stubne svetiljke za stazu i baštu. Stabilna montaža i ravnomeran snop duž prolaza.',
  'zidne-i-plafonske-svetiljke':
    'Zidne i plafonske svetiljke za eksterijer. Otporne na vlagu — za ulaz, terasu i dvorište.',
  fenjeri: 'Fenjeri i baštenske svetiljke. Dekorativna spoljna rasveta za stazu i okućnicu.',
  'spot-podne-svetiljke':
    'Spot i podne svetiljke za eksterijer. Usmereno osvetljenje fasade, biljaka i staza.',
  'ulicne-svetiljke':
    'Ulične svetiljke za javnu i privatnu infrastrukturu. Jak snop i dug vek LED tehnologije.',
  'led-zvona':
    'LED zvona (high-bay) za hale i magacine. Visok lumen paket i ušteda u odnosu na klasična zvona.',
  'linijske-led-svetiljke':
    'Linijske LED svetiljke za kontinuirano osvetljenje. Kancelarije, prodavnice i proizvodne linije.',
  rasteri: 'Rasteri i plafonska rasveta za poslovne prostore. Ujednačena svetlost bez odsjaja.',
  'vododiht-vodonepropustive-svetiljke':
    'Vodonepropusne svetiljke za vlažne prostore. IP zaštita za kupatila, podrum i spoljašnje zone.',
  'kancelarijske-svetiljke':
    'Kancelarijske svetiljke za radni prostor. Ugodan ton svetla i smanjen umor očiju.',
  'led-sijalice':
    'LED sijalice — ušteda struje i dug vek. E27, E14 i GU10 — izbor snage i temperature boje.',
  'led-cevi':
    'LED cevi kao zamena za fluo. Brza ugradnja, manja potrošnja i stabilan svetlosni tok.',
  'fluo-cevi-i-sijalice-stedne':
    'Fluo cevi i štedne sijalice. Klasična rešenja gde je potrebna zamena postojećih modela.',
  'dekorativne-sijalice-edison-filament':
    'Dekorativne Edison / filament sijalice. Topao ambijent za ugostiteljstvo i enterijer.',
  'obicne-inkandescentne-i-halogene-sijalice':
    'Inkandescentne i halogene sijalice za specijalne namene i zamenu postojećih modela.',
  'led-trake':
    'LED trake za dekoraciju i indirektno svetlo. Različite dužine, boje i stepeni zaštite.',
  'led-napajanja':
    'Napajanja za LED trake i module. Stabilan napon i dovoljna snaga za duže instalacije.',
  'led-aluminijumski-profili':
    'Aluminijumski profili za LED trake. Hlađenje, zaštita i uredan estetski završetak.',
  'led-dimeri-i-kontrole':
    'Dimeri i kontrole za LED rasvetu. Regulacija jačine svetla i scene osvetljenja.',
  'led-moduli-creva-opticki-setovi':
    'LED moduli, creva i optički setovi. Fleksibilna rešenja za reklame i dekoraciju.',
  'sinski-reflektori':
    'Šinski reflektori za usmereno osvetljenje. Laka zamena pozicije duž šine.',
  'monofazne-sine-i-pribor':
    'Monofazne šine i pribor. Osnova za modularnu rasvetu u lokalima i stanovima.',
  'trofazne-sine-i-pribor':
    'Trofazne šine i pribor za zahtevnije instalacije. Više krugova na istoj šini.',
  'opticki-setovi':
    'Optički setovi za šinsku rasvetu. Usmerenje i oblik snopa prema sceni osvetljenja.',
  'baterijske-rucne-lampe':
    'Baterijske ručne lampe za teren i nestanak struje. Jak snop i pouzdane baterije.',
  'panik-lampe':
    'Panik lampe za hitno osvetljenje. Automatsko uključivanje pri nestanku napajanja.',

  // Elektro leaves (examples)
  'automatski-osiguraci':
    'Automatski osigurači za zaštitu instalacije. Izbor struje i karakteristike okidanja prema kolu.',
  'fid-sklopke':
    'FID (diferencijalne) sklopke za zaštitu od strujnog udara. Obavezna bezbednost u modernim instalacijama.',
  'cilindricni-i-topljivi-osiguraci':
    'Cilindrični i topljivi osigurači. Klasična zaštita kola — nosači i umetci na stanju.',
  'instalacioni-kontaktori-i-teretne-sklopke':
    'Kontaktori i teretne sklopke za uključivanje potrošača. Pouzdano prebacivanje većih opterećenja.',
  'grebenasti-prekidaci':
    'Grebenasti prekidači za ručno upravljanje kolima. Jasne pozicije i robustna konstrukcija.',
  'din-sine-i-bakarne-sabirnice':
    'DIN šine i bakarne sabirnice za uredan razvod u tabli. Standardne dimenzije i pouzdan kontakt.',
  bimetali: 'Bimetali za termičku zaštitu motora. Podesiva struja i pouzdano okidanje pri preopterećenju.',
  'dm-sklopke':
    'DM sklopke za razvodne table. Kompaktan format i jasno označavanje položaja.',
  tajmeri: 'Tajmeri za automatsko uključivanje potrošača. Dnevni i nedeljni programi za uštedu energije.',
  'senzori-pokreta':
    'Senzori pokreta za rasvetu i alarm. Automatsko paljenje svetla u hodnicima i dvorištu.',
  'foto-senzori':
    'Foto senzori (sumrak prekidači) za spoljnu rasvetu. Paljenje u sumrak, gašenje u zoru.',
  zvona: 'Električna zvona i gongovi za ulaz. Pouzdana signalizacija za kuću i objekat.',

  // Ručni / ostalo što je padalo na pogrešan šablon
  'kolica-i-pribor':
    'Kolica i pribor za transport tereta u radionici i magacinu. Stabilni točkovi i nosivost po modelu.',
  'ulja-i-sprejevi':
    'Ulja i sprejevi za podmazivanje, čišćenje i zaštitu alata. Potrošni materijal uvek pri ruci.',
  'dizalice-rucni-alat-i-pribor':
    'Ručne dizalice i podizači za radionicu. Bezbedno podizanje tereta u servisu i montaži.',
  izolatori: 'Izolatori za elektroinstalacije. Električna izolacija i pouzdano učvršćivanje provodnika.',
  'izolir-trake':
    'Izolir trake za izolaciju spojeva. Različite širine i debljine — standard za svaku instalaciju.',
  kleme: 'Kleme i redne stezaljke za povezivanje provodnika. Jasan kontakt i uredan razvod u tabli.',
  obujmice: 'Obujmice za učvršćivanje kablova i cevi. Brza montaža i uredno vođenje instalacije.',
  'sijalicna-grla':
    'Sijalična grla E27, E14 i druga. Pouzdan kontakt za sijalice u rasvetnim telima.',
  uvodnice: 'Uvodnice za kablove u ormane i kutije. Zaštita izolacije i uredan prolaz kroz kućište.',
  vezice: 'Vezice (najlon zip) za vezivanje kablova. Različite dužine i boje za urednu instalaciju.',

  // Aku — ostali
  'akumulatorska-inspekciona-kamera':
    'Akumulatorske inspekcione kamere za cevi i šupljine. Pregled teško dostupnih mesta bez razbijanja.',
  'akumulatorske-ger-masine':
    'Akumulatorske ger mašine za precizne uglove. Rezovi lajsni i profila bez kabla.',
  'akumulatorske-glodalice-frezeri':
    'Akumulatorske glodalice/frezeri za stolarski rad na terenu. Mobilnost bez gubitka preciznosti.',
  'akumulatorske-heftalice':
    'Akumulatorske heftalice za tapaciranje i montažu. Brzo zabijanje bez kompresora i kabla.',
  'akumulatorske-lampe':
    'Akumulatorske radne lampe za teren i servis. Jak snop tamo gde nema rasvete.',
  'akumulatorske-pumpe':
    'Akumulatorske pumpe za vazduh i tečnosti. Mobilno pumpanje guma i prenosa vode.',
  'akumulatorske-kosacice':
    'Akumulatorske kosačice za tiše košenje bez kabla. Idealne za manje i srednje travnjake.',
  'akumulatorski-trimeri':
    'Akumulatorski trimeri za ivice i teško dostupna mesta. Lagani rad bez benzina i kabla.',

  // Bašta / kosidba
  'benzinski-trimeri':
    'Benzinski trimeri za gustu travu i zarasle površine. Veća snaga za zahtevan teren.',
  'elektricne-kosacice':
    'Električne kosačice — tiši rad i jednostavno održavanje. Za travnjake uz kuću uz dostupnu struju.',
  'elektricni-trimeri':
    'Električni trimeri za ivice travnjaka. Lagani i precizni uz produžni kabl ili aku.',
  'oprema-za-kosacice':
    'Oprema za kosačice — noževi, točkovi, sakupljači i potrošni delovi. Održavanje mašine na stanju.',

  // Pumpe
  'benzinske-pumpe':
    'Benzinske pumpe za vodu na terenu. Visok protok gde nema električne mreže.',
  'bunarske-pumpe-rakete':
    'Bunarske pumpe (rakete) za duboke bunare. Pouzdan dotok vode za domaćinstvo i zalivanje.',
  'dizel-pumpe':
    'Dizel pumpe za zahtevniji protok i duži rad. Ekonomičan pogon za privredu i gradilište.',
  'elekticne-pumpe':
    'Električne pumpe za dom i baštu. Tiši rad i jednostavno povezivanje na mrežu.',
  hidrofori:
    'Hidrofori za stabilan pritisak vode u objektu. Automatsko uključivanje prema potrošnji.',
  'oprema-za-pumpe':
    'Oprema za pumpe — creva, spojnice, filteri i ventili. Dopuna i održavanje sistema.',

  // Varenje
  'combo-aparati':
    'Combo aparati za varenje — više tehnologija u jednom uređaju. Fleksibilnost za radionicu.',
  'inverterski-aparati':
    'Inverterski aparati za MMA varenje. Lagani, efikasni i pogodni za teren.',
  'mig-mag-aparati':
    'MIG/MAG aparati za brzo varenje čelika. Stabilan luk i manje naknadne obrade.',
  'tig-aparati':
    'TIG aparati za precizno varenje nerđajućeg čelika i aluminijuma. Čist i kontrolisan šav.',
  'plazma-aparati-za-secenje':
    'Plazma aparati za sečenje metala. Brz i čist rez limova i profila.',
  'oprema-za-zavarivanje':
    'Oprema za zavarivanje — elektrode, žice, maske i creva. Sve što treba uz aparat.',

  // Poljoprivreda / motorno
  'elekticni-duvaci':
    'Električni duvači lišća za dvorište. Brzo čišćenje staza i travnjaka bez benzina.',
  'motorna-drobilica-za-grane':
    'Motorne drobilice za grane. Pretvorite otpad od orezivanja u iverje za kompost.',
  'motorne-testere':
    'Motorne lančane testere za drvo. Sečenje stabala i debljih grana na otvorenom.',
  'motorni-busaci':
    'Motorni bušači zemlje za stubove i sadnju. Brže kopanje rupa uz manji napor.',
  'motorni-cistac-snega':
    'Motorni čistači snega za prilaz i staze. Brzo čišćenje zimi uz manje fizičkog rada.',
  'motorni-duvaci':
    'Motorni duvači za lišće i otpad. Veći doseg i snaga za veće površine.',

  // Kablovi — tipovi
  'cat-5e': 'Cat 5e mrežni kablovi za LAN. Pouzdan prenos podataka za kućne i poslovne mreže.',
  'cat-6': 'Cat 6 mrežni kablovi — veći protok od Cat 5e. Za moderne mreže i PoE uređaje.',
  'cat-7': 'Cat 7 mrežni kablovi za zahtevne instalacije. Bolja zaštita od smetnji i veći protok.',
  rg6: 'RG6 koaksijalni kablovi za TV i satelit. Stabilan signal uz manje gušenje.',
  rg59: 'RG59 koaksijalni kablovi za video i signalizaciju. Klasičan izbor za kraće trase.',
  rg11: 'RG11 koaksijalni kablovi za duže trase. Manje gušenje signala na većim rastojanjima.',
  'pp00': 'PP00 energetski kablovi za napajanje. Izbor preseka prema opterećenju instalacije.',
  'pp00-a': 'PP00-A energetski kablovi sa aluminijumskim žilama. Ekonomičan izbor za veće preseke.',
  'pp-y': 'PP/Y instalacioni kablovi za kućne instalacije. Standard za razvod u objektu.',
  'pp-j': 'PP/J instalacioni kablovi. Fleksibilniji razvod u odnosu na krute tipove.',
  'pp-l': 'PP/L instalacioni kablovi. Izbor preseka i broja žila prema projektu.',
  'p-l': 'P/L provodnici/kablovi za instalacije. Uskladite presek sa strujnim opterećenjem.',
  'p-f': 'P/F fleksibilni provodnici. Za povezivanje uređaja i pokretne instalacije.',
  'gg-j': 'GG-J gumirani kablovi za mobilne priključke. Otpornost na savijanje i habanje.',
  liyy: 'LiYY signalno-kontrolni kablovi. Za automatiku, senzore i upravljačke signale.',
  yslc: 'YSLC kontrolni kablovi za industrijske instalacije. Pouzdan prenos upravljačkih signala.',
  jysty: 'JYSTY telekomunikacioni kablovi. Za telefoniju i signalizaciju u objektu.',
  liycy: 'LiYCY ekranizovani telekomunikacioni kablovi. Manje smetnji u osetljivim instalacijama.',

  // Instalaciona oprema
  'pvc-kanalice':
    'PVC kanalice za uredno vođenje kablova. Estetičan razvod po zidu bez razbijanja.',
  'pvc-kutije':
    'PVC kutije za utičnice i spojeve. Ugradne i nadgradne — zaštita kontakata.',
  'rebrasta-creva':
    'Rebrasta creva za zaštitu kablova. Fleksibilno vođenje kroz zidove i plafone.',
  'sapa-creva':
    'Šapa creva za mehaničku zaštitu kablova. Otpornost na pritisak i habanje.',
  'instalacione-krute-cevi-i-oprema':
    'Krute instalacione cevi i oprema. Čvrsta zaštita kablova u zidu i betonu.',
  'pnk-regali-i-pribor':
    'PNK regali i pribor za kablovske trase. Uredan razvod u industrijskim objektima.',
  'industrijski-utikaci-i-uticnice-uko-uto':
    'Industrijski utikači i utičnice (UKO/UTO). Pouzdani priključci za veća opterećenja.',

  // Dvorište
  'bastenski-alat':
    'Baštenski alat za sadnju i održavanje. Lopate, grabulje, makaze i pribor za okućnicu.',
  'bastenski-namestaj':
    'Baštenski nameštaj za terasu i dvorište. Sednice i stolovi otporni na spoljne uslove.',
  bazeni: 'Bazeni i oprema za dvorište. Osveženje tokom sezone uz jednostavnu montažu.',
  'creva-za-dvoriste-i-bastu':
    'Creva za dvorište i baštu. Fleksibilna i otporna — za zalivanje i pranje.',
  suncobrani: 'Suncobrani za terasu i baštu. Hladovina tokom leta — stabilni i jednostavni za postavljanje.',

  // Razvodni
  'aluminijumski-razvodni-ormani':
    'Aluminijumski razvodni ormani — lagani i otporni na koroziju. Za uredan razvod u objektu.',
  'gradilisni-razvodni-ormani':
    'Gradilišni razvodni ormani za privremene instalacije. Robusni i prilagođeni uslovima rada napolju.',
  'prohromski-razvodni-ormani':
    'Prohromski razvodni ormani za vlažne i zahtevne sredine. Trajna zaštita od korozije.',
  'nadgradne-razvodne-table':
    'Nadgradne razvodne table za brzu montažu na zid. Pregledan raspored osigurača i sklopki.',
  'ugradne-razvodne-table':
    'Ugradne razvodne table za uredan izgled u zidu. Diskretna ugradnja u stambene i poslovne prostore.',
  'vodootporne-razvodne-table':
    'Vodootporne razvodne table za vlažne prostore. Viši IP stepen zaštite od prašine i vode.',

  // Pribor / potrošni
  burgije:
    'Burgije za metal, beton i drvo. SDS, HSS i setovi — izbor prečnika za bušilicu koju imate.',
  glodala: 'Glodala za metal i alatne mašine. Precizna obrada žljebova i profila.',
  'glodala-za-drvo':
    'Glodala za drvo za frezer i glodalicu. Ivice, žljebovi i dekorativni profili.',

  // Aku — preostali visokofrekventni
  'ostali-akomulatorski-alat':
    'Ostali akumulatorski alati iz asortimana. Specijalne mašine i pribor na istom naponu baterije.',
  'akumulatorske-testere-i-cirkulari':
    'Akumulatorske testere i cirkulari za drvo i ploče. Sečenje bez kabla na terenu i u radionici.',
  'akumulatorski-udarni-zavrtaci':
    'Akumulatorski udarni zavrtači za jak moment. Brza montaža dugih šrafova i ankera.',
  laseri: 'Laseri za nivelisanje i označavanje. Tačne linije za keramiku, gips i montažu.',
  baterije: 'Baterije za akumulatorski alat. Kapaciteti i naponi usklađeni sa vašim setom mašina.',
  daljinomeri: 'Laserski daljinomeri za brzo merenje rastojanja. Tačnost u prostoru bez metra.',
  'akumulatorski-usisivaci':
    'Akumulatorski usisivači za auto, radionicu i sitno čišćenje. Mobilno usisavanje bez utičnice.',
  'akumulatorski-trimeri-akumulatorski-alat':
    'Akumulatorski trimeri za ivice travnjaka. Lagani rad bez benzina i produžnog kabla.',
  'punjaci-baterija':
    'Punjači baterija za aku alat. Brzo i standardno punjenje — uskladite sa naponom seta.',
  'akumulatorski-duvaci':
    'Akumulatorski duvači lišća za dvorište. Tiši rad i bez kabla oko kuće.',
  'akumulatorski-zavrtaci-sauberi':
    'Akumulatorski zavrtači-šrauberi za montažu. Kompaktni modeli za svakodnevni rad.',
  'akumulatorske-slajferice':
    'Akumulatorske šlajferice za fino brušenje. Priprema površina bez kabla.',
  detektori: 'Detektori metala, napona i vlage u zidu. Bezbednije bušenje i montaža.',
  'akumulatorski-fen-za-vreli-vazduh':
    'Akumulatorski fen za vreli vazduh. Skidanje folija i sitni radovi bez utičnice.',

  // Agregati / kompresori
  'benzinski-agregati':
    'Benzinski agregati za kuću, vikendicu i gradilište. Izbor snage (kW) prema potrošačima.',
  'dizel-agregati':
    'Dizel agregati za duži rad i veća opterećenja. Ekonomičan pogon za privredu i objekte.',
  'inverterski-agregati':
    'Inverterski agregati — stabilan napon za elektroniku. Tiši rad i manja potrošnja.',
  'oprema-za-agregate':
    'Oprema za agregate — točkovi, setovi za transport, ulja i potrošni delovi.',
  'pneumatski-alati-i-pribor':
    'Pneumatski alati i pribor — pištolji, čegrtaljke i creva. Za radionicu uz kompresor.',
  'elektricni-kompresori-uljni':
    'Uljni električni kompresori za duži rad. Veći protok vazduha za farbanje i pneumatiku.',
  'elektricni-kompresori-bezuljni':
    'Bezuljni električni kompresori — manje održavanja. Pogodni za kućnu radionicu i duvanje.',
  'benzinski-kompresori':
    'Benzinski kompresori za teren bez struje. Mobilni vazduh za pneumatske alate.',

  // Pumpe / bašta / poljo
  'potapajuce-pumpe':
    'Potapajuće pumpe za bunare, šahte i ispumpavanje. Rad ispod nivoa vode uz pouzdan protok.',
  'oprema-za-trimere':
    'Oprema za trimere — glave, strune i štitnici. Potrošni delovi za sezonsko održavanje.',
  tresaci: 'Tresači za voće i masline. Brža berba uz manji napor na terenu.',
  trimeri: 'Trimeri za ivice i zarasle površine. Benzinski, električni i aku modeli.',
  'pumpa-za-busilice-pumpe-za-vodu':
    'Pumpe uz bušilicu za vodu. Praktično rešenje za manje protoke i baštenske potrebe.',

  // Industrija / solar
  'industrijska-oprema':
    'Industrijska oprema za proizvodnju i radionicu. Pogledajte dostupne mašine i specifikacije.',
  'industrijska-oprema-industrijaske-masine':
    'Industrijska oprema za profesionalnu upotrebu. Modeli prilagođeni kontinuiranom radu.',
  'solarni-paneli':
    'Solarni paneli za proizvodnju struje. Osnova fotonaponskog sistema za dom i objekat.',

  // Rasveta — preostali listovi
  'stone-radne-lampe':
    'Stone / radne lampe za sto i radionicu. Usmereno svetlo tamo gde radite.',
  't5-t8-led-i-fluo-svetiljke-strele':
    'T5/T8 LED i fluo svetiljke (strele). Zamena cevi u kancelarijama i objektima.',
  'ugradne-led-svetiljke-downlight':
    'Ugradne LED svetiljke (downlight) za plafon. Diskretna i ravnomerna rasveta prostora.',
  visilice: 'Visilice za trpezariju i dnevni boravak. Dekorativna rasveta iznad stola.',

  // Elektro oprema — preostali
  'katodni-odvodnici-prenapona':
    'Katodni odvodnici prenapona za zaštitu instalacije. Smanjite rizik od udara i kvarova.',
  'kompakt-prekidaci':
    'Kompakt prekidači za razvodne table. Visoka prekidna moć u manjem formatu.',
  'kondenzatorske-baterija':
    'Kondenzatorske baterije za kompenzaciju. Bolji faktor snage i manji gubici u mreži.',
  kontaktori: 'Kontaktori za uključivanje potrošača. Pouzdano prebacivanje većih opterećenja.',
  'nozasti-osiguraci-i-postolja':
    'Nožasti osigurači i postolja. Klasična zaštita kola u industrijskim tablama.',
  'regulatori-kompenzacije-reaktivne-energije':
    'Regulatori kompenzacije reaktivne energije. Automatsko upravljanje kondenzatorskim baterijama.',
  'granicni-i-mikro-prekidaci':
    'Granični i mikro prekidači za automatiku. Precizna signalizacija položaja i kraja hoda.',
  'komandni-tasteri-prekidaci-i-kutije-za-tastere':
    'Komandni tasteri, prekidači i kutije. Jasno upravljanje mašinama i linijama.',
  kondenzatori: 'Kondenzatori za elektrotehniku i kompenzaciju. Stabilan rad i standardne vrednosti.',
  'signalne-sijalice':
    'Signalne sijalice za table i panele. Jasna indikacija statusa i alarma.',
  'vazdusne-sklopke-presostati':
    'Vazdušne sklopke i presostati. Kontrola pritiska u pneumatskim i hidrauličnim sistemima.',

  // Kablovi — preostali tipovi
  jhsth: 'JH(ST)H bezhalogeni kablovi za signalizaciju. Niži dim i korozivnost pri požaru.',
  'jhsth-fe180':
    'JH(ST)H FE180 — bezhalogeni kablovi sa otpornošću na vatru. Za kritične instalacije.',
  lihch: 'LIHCH bezhalogeni kontrolni kablovi. Za objekte sa zahtevima požarne bezbednosti.',
  'lihch-fe180':
    'LIHCH FE180 — bezhalogeni kablovi otporni na vatru. Pouzdan prenos u kritičnim sistemima.',
  n2xh: 'N2XH bezhalogeni energetski kablovi. Napajanje uz smanjen rizik dima pri požaru.',
  'nhxh-fe180':
    'NHXH FE180 bezhalogeni energetski kablovi. Otpornost na vatru za zahtevne objekte.',
  'pp-r': 'PP-R instalacioni kablovi. Izbor preseka za razvod u stambenim i poslovnim objektima.',
  'x00-a': 'X00-A energetski kablovi. Napajanje objekata — uskladite presek sa opterećenjem.',
  xhe49: 'XHE49 energetski kablovi. Pouzdano napajanje za industrijske i građevinske instalacije.',
  'xhe49-a':
    'XHE49-A energetski kablovi sa aluminijumskim žilama. Ekonomičan izbor za veće preseke.',
  xhp48: 'XHP48 energetski kablovi. Izdržljiv razvod za zahtevne uslove ugradnje.',
  'xp00-samonoseci-snop':
    'XP00 samonoseći snop za vazdušne vodove. Napajanje bez dodatnog nosećeg užeta.',

  // Razvodni — preostali
  'metalni-razvodni-ormani-metalni-razvodni-ormani':
    'Metalni razvodni ormani za uredan razvod struje. Robusna kućišta za objekte i industriju.',
  'plasticni-razvodni-ormani-abs':
    'Plastični razvodni ormani ABS. Lagana montaža i otpornost na koroziju.',
  'plasticni-razvodni-ormani-poliester':
    'Plastični razvodni ormani od poliestera. Veća otpornost u spoljnim i vlažnim uslovima.',
  pribro: 'Pribro razvodni ormani i table. Kompaktna rešenja za uredan razvod u objektu.',

  // Čudni listovi pod kosidbom (kako stoje u WP)
  'teretni-prekidaci':
    'Teretni prekidači za uključivanje potrošača. Pouzdano prebacivanje opterećenja u tabli.',
  'vremenski-releji':
    'Vremenski releji za odloženo uključivanje. Automatika rasvete i potrošača po vremenu.',
};

/** Template key used when walking up the parent chain. */
const TEMPLATE_KEYS = new Set([
  'elektricni-alat',
  'akumulatorski-alat',
  'rucni-alat-i-pribor',
  'rucni-alat',
  'koferi-klaseri-i-nosaci-alata',
  'aparati-za-varenje',
  'htz-oprema',
  'zastita-glave',
  'zastitna-obuca',
  'zastitna-odeca',
  'rukavice',
  'kompresori-i-pneumatski-alati',
  'agregati',
  'kosacice-i-trimeri-dobra',
  'kosacice-i-trimeri',
  'benzinske-kosacice',
  'kosacice',
  'poljoprivredni-alati-i-oprema',
  'kultivatori-i-freze',
  'prskalice-i-atomizeri',
  'oprema-za-dvoriste',
  'elektromaterijal-i-oprema',
  'elektro-oprema',
  'elektro-pribor',
  'instalaciona-oprema',
  'automatika-i-kontrola',
  'rasveta',
  'unutrasnja-rasveta',
  'spoljna-rasveta',
  'industrijska-rasveta',
  'sijalice',
  'led-trake-i-oprema',
  'sinska-rasveta',
  'panik-i-rucne-lampe',
  'solarna-elektrana',
  'pumpe-za-vodu',
  'pribor',
  'pribor-i-potrosni-materijal',
  'industrijske-masine',
  'industrijaske-masine',
  'kablovi-i-provodnici',
  'energetski-kablovi',
  'instalacioni-kablovi',
  'bezhalogeni-kablovi',
  'gumirani-kablovi',
  'mrezni-i-opticki-kablovi',
  'signalno-kontrolni-kablovi',
  'telekomunikacioni-kablovi',
  'provodnici',
  'razvodni-ormani-i-table',
  'metalni-razvodni-ormani',
  'plasticni-razvodni-ormani',
  'plasticni-razvodne-table',
]);

const SKIP_SLUGS = new Set(['poljo']);

function leafDescription(name, templateKey) {
  const n = name.trim();
  switch (templateKey) {
    case 'elektricni-alat':
      return `${n} u ponudi električnih alata. Uporedite snagu i brendove — naručite online uz brzu dostavu širom Srbije.`;
    case 'akumulatorski-alat':
      return `${n} na akumulator za rad bez kabla. Izaberite napon, kapacitet i brend — modeli na stanju sa garancijom.`;
    case 'rucni-alat':
    case 'rucni-alat-i-pribor':
      return `${n} iz asortimana ručnog alata i pribora. Za radionicu, montažu i teren — modeli na stanju.`;
    case 'koferi-klaseri-i-nosaci-alata':
      return `${n} za organizaciju i transport alata. Zaštitite opremu na putu do objekta.`;
    case 'aparati-za-varenje':
      return `${n} za varenje i montažu. Pogledajte karakteristike i opremu — podrška pri izboru tehnologije.`;
    case 'htz-oprema':
      return `${n} za zaštitu na radu. Izaberite veličinu i nivo zaštite — bezbednost prema standardima.`;
    case 'zastita-glave':
      return `${n} za zaštitu glave i lica. Udobno nošenje i usklađenost sa propisima bezbednosti.`;
    case 'zastitna-obuca':
      return `${n} za radilište i radionicu. Čvrsta zaštita stopala i protklizni đon.`;
    case 'zastitna-odeca':
      return `${n} za rad na terenu i u objektu. Trajni materijali i praktični džepovi.`;
    case 'rukavice':
      return `${n} za zaštitu ruku. Izaberite materijal i nivo zaštite prema poslu.`;
    case 'kompresori-i-pneumatski-alati':
      return `${n} za kompresore i pneumatiku. Uporedite performanse i namenu — brza isporuka širom Srbije.`;
    case 'agregati':
      return `${n} za pouzdano napajanje. Pogledajte snagu, tip goriva i opremu — dostava i savet pri kupovini.`;
    case 'kosacice-i-trimeri-dobra':
    case 'kosacice-i-trimeri':
    case 'benzinske-kosacice':
    case 'kosacice':
      return `${n} za uređenje travnjaka i dvorišta. Benzinski, električni i aku modeli na stanju.`;
    case 'poljoprivredni-alati-i-oprema':
      return `${n} za poljoprivredu i okućnicu. Pouzdana oprema za sezonski i svakodnevni rad.`;
    case 'kultivatori-i-freze':
      return `${n} za obradu zemlje. Uporedite snagu, širinu rada i tip pogona.`;
    case 'prskalice-i-atomizeri':
      return `${n} za zaštitu bilja i negu useva. Kapacitet i pritisak prema veličini parcele.`;
    case 'oprema-za-dvoriste':
      return `${n} za dvorište i baštu. Praktična rešenja za održavanje i uređenje okoline.`;
    case 'elektromaterijal-i-oprema':
      return `${n} za elektroinstalacije. Izaberite dimenzije i tip — brza dostava i stručna podrška.`;
    case 'elektro-oprema':
      return `${n} za razvodne table i instalacije. Standardne dimenzije i pouzdani proizvođači.`;
    case 'elektro-pribor':
      return `${n} za montažu elektroinstalacija. Potreban pribor za uredan i bezbedan razvod.`;
    case 'instalaciona-oprema':
      return `${n} za vođenje i zaštitu kablova. Cevi, kanalice i pribor za urednu instalaciju.`;
    case 'automatika-i-kontrola':
      return `${n} za automatiku i upravljanje. Senzori, tajmeri i komandni elementi na stanju.`;
    case 'rasveta':
      return `${n} u ponudi rasvete. LED i klasična rešenja za enterijer, eksterijer i objekat.`;
    case 'unutrasnja-rasveta':
      return `${n} za unutrašnje prostore. Izaberite snagu i ton svetla za dom ili kancelariju.`;
    case 'spoljna-rasveta':
      return `${n} za dvorište, fasadu i stazu. Otpornost na vlagu i dug vek LED tehnologije.`;
    case 'industrijska-rasveta':
      return `${n} za hale, ulice i objekte. Visok lumen paket i energetski efikasni modeli.`;
    case 'sijalice':
      return `${n} — LED i klasične. Ušteda energije i izbor temperature boje svetla.`;
    case 'led-trake-i-oprema':
      return `${n} za LED trake i dekorativnu rasvetu. Kompletna oprema za urednu montažu.`;
    case 'sinska-rasveta':
      return `${n} za šinske sisteme. Modularna rasveta — pomerajte reflektore po potrebi.`;
    case 'panik-i-rucne-lampe':
      return `${n} za hitne situacije i rad u mraku. Pouzdana mobilna rasveta na stanju.`;
    case 'solarna-elektrana':
      return `${n} za solarne sisteme. Komponente za uštedu energije — paneli, inverteri i pribor.`;
    case 'pumpe-za-vodu':
      return `${n} za vodosnabdevanje i zalivanje. Izaberite snagu i protok prema vašim potrebama.`;
    case 'pribor':
    case 'pribor-i-potrosni-materijal':
      return `${n} — potrošni materijal i pribor za alate. Dopunite set delovima na stanju.`;
    case 'industrijske-masine':
    case 'industrijaske-masine':
      return `${n} za profesionalnu i industrijsku upotrebu. Pogledajte dostupne modele i specifikacije.`;
    case 'kablovi-i-provodnici':
    case 'energetski-kablovi':
    case 'instalacioni-kablovi':
    case 'bezhalogeni-kablovi':
    case 'gumirani-kablovi':
    case 'mrezni-i-opticki-kablovi':
    case 'signalno-kontrolni-kablovi':
    case 'telekomunikacioni-kablovi':
    case 'provodnici':
      return `${n} — kablovi i provodnici za elektroinstalacije. Izaberite presek i tip prema nameni.`;
    case 'razvodni-ormani-i-table':
    case 'metalni-razvodni-ormani':
    case 'plasticni-razvodni-ormani':
    case 'plasticni-razvodne-table':
      return `${n} za razvod struje. Uredna montaža osigurača i sklopki — modeli na stanju.`;
    default:
      return `${n} u asortimanu Končar Elektro. Provereni brendovi, garancija i brza dostava širom Srbije.`;
  }
}

function strip(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parentChainSlugs(cat, byId) {
  const slugs = [];
  let cur = cat.parent ? byId.get(cat.parent) : null;
  while (cur) {
    slugs.push(cur.slug);
    cur = cur.parent ? byId.get(cur.parent) : null;
  }
  return slugs;
}

function resolveTemplateKey(cat, byId) {
  for (const slug of parentChainSlugs(cat, byId)) {
    if (TEMPLATE_KEYS.has(slug)) return slug;
  }
  return null;
}

async function fetchAll() {
  const all = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const url = new URL(`${BASE}/wc/v3/products/categories`);
    url.searchParams.set('per_page', '100');
    url.searchParams.set('page', String(page));
    url.searchParams.set('_fields', 'id,name,slug,description,parent');
    const res = await fetch(url, { headers: { Authorization: auth } });
    if (!res.ok) throw new Error(`List HTTP ${res.status}`);
    totalPages = Number(res.headers.get('x-wp-totalpages') || 1);
    all.push(...(await res.json()));
    page += 1;
  }
  return all;
}

async function putDescription(id, description) {
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const res = await fetch(`${BASE}/wc/v3/products/categories/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: auth,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });
      if (res.ok) return;
      const t = await res.text();
      lastErr = new Error(`PUT ${id} HTTP ${res.status}: ${t.slice(0, 200)}`);
      if (res.status >= 500) {
        await new Promise((r) => setTimeout(r, attempt * 1500));
        continue;
      }
      throw lastErr;
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, attempt * 1500));
    }
  }
  throw lastErr;
}

function desiredDescription(cat, byId) {
  if (SKIP_SLUGS.has(cat.slug)) return null;
  if (LEAF_OVERRIDES[cat.slug]) return LEAF_OVERRIDES[cat.slug];
  if (FIXED_DESCRIPTIONS[cat.slug]) return FIXED_DESCRIPTIONS[cat.slug];

  const templateKey = resolveTemplateKey(cat, byId);
  return leafDescription(cat.name, templateKey);
}

async function main() {
  console.log('Target:', BASE);
  console.log(dryRun ? 'Mode: DRY RUN\n' : 'Mode: WRITE\n');

  const all = await fetchAll();
  const byId = new Map(all.map((c) => [c.id, c]));

  let changed = 0;
  let same = 0;
  let skipped = 0;
  let stillGeneric = 0;
  const samples = [];

  for (const cat of all) {
    const next = desiredDescription(cat, byId);
    if (!next) {
      skipped += 1;
      continue;
    }
    if (/u asortimanu Končar Elektro/.test(next)) stillGeneric += 1;

    const current = strip(cat.description);
    if (current === next) {
      same += 1;
      continue;
    }
    if (samples.length < 15) {
      samples.push({ slug: cat.slug, from: current.slice(0, 70), to: next.slice(0, 100) });
    }
    console.log(`${dryRun ? 'WOULD' : 'UPDATE'} #${cat.id} ${cat.slug}`);
    if (!dryRun) await putDescription(cat.id, next);
    changed += 1;
  }

  console.log('\nSamples:');
  for (const s of samples) {
    console.log(`- ${s.slug}`);
    console.log(`  WAS: ${s.from}`);
    console.log(`  NOW: ${s.to}`);
  }
  console.log(
    `\nDone. changed=${changed} unchanged=${same} skipped=${skipped} stillGenericFallback=${stillGeneric}`,
  );
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
