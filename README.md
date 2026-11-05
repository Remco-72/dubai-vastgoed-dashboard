# Apex Property Intelligence

Een werkend, Nederlandstalig vastgoeddashboard voor **Binghatti Apex · Unit 1107**, Jumeirah Village Circle, Dubai. Gebouwd met Next.js, TypeScript en Tailwind CSS. Geen database, account, API-sleutel of betaalde dienst nodig.

## Alleen op je iPad gebruiken — installeerbare offline-app

Een computer is na publicatie niet nodig. Publicatie en installatie zijn twee afzonderlijke stappen: een lokaal gebouwd pakket is nog geen actieve website.

1. Open het bevestigde HTTPS-webadres in **Safari** op je iPad. Bij GitHub Pages is het beoogde adres `https://remco-72.github.io/dubai-vastgoed-dashboard/`; dit werkt pas nadat Pages is ingeschakeld en de publicatie is voltooid.
2. Tik op **Delen** (vierkant met pijltje omhoog).
3. Kies **Zet op beginscherm**, zet **Open als webapp** aan als die optie verschijnt en tik op **Voeg toe**.
4. Open **Apex** via het nieuwe icoon. Wacht op **Offline beschikbaar**.
5. Daarna kun je het dashboard openen en bewerken zonder internet of computer. Voor de eerste download en latere app-updates is wel internet nodig.
6. Exporteer regelmatig je administratie naar **Bestanden** op je iPad. Apple/browseropslag kan worden gewist of ontruimd; installatie is geen back-up.

De app toont pas offlinegereedheid nadat alle bestanden van dezelfde versie zijn opgeslagen. Een onderbroken download geeft geen gereedmelding. Een nieuwe appversie wordt pas actief nadat bestaande appvensters gesloten zijn; lopende invoer wordt niet onderbroken. Sluit ook eventuele Safari-tabbladen met de app en open Apex opnieuw wanneer je wilt bijwerken.

Bij een overstap van een lokaal netwerkadres naar de website of de beginscherm-app kan de opslag apart zijn. Exporteer dan eerst en importeer daarna via **Objectdetails**. Er is geen automatische synchronisatie.

### Gratis publicatie

- **GitHub Pages:** bouw met `npm run build:pages`. Publiceer de inhoud van `out/` naar de branch `gh-pages` en kies in GitHub **Settings → Pages → Deploy from a branch → gh-pages → / (root) → Save**. De `.nojekyll`-markering houdt de Next.js-bestanden toegankelijk. Pages moet beschikbaar zijn voor het repositorytype en account; er wordt geen betaald abonnement geactiveerd.
- **Andere statische hosting, bijvoorbeeld Netlify:** bouw met `npm run build` en publiceer uitsluitend `out/`. `netlify.toml` bevat de bouw- en publicatie-instellingen. De rootversie en de GitHub Pages-versie hebben verschillende padinstellingen; wissel de pakketten niet om.
- Financiële wijzigingen worden alleen op het apparaat bewaard en niet naar de host gestuurd. De beginwaarden in de appcode zijn onderdeel van de gepubliceerde website. Back-upbestanden horen niet in de publicatiemap.

## Openen op je iPad — via een computer op hetzelfde wifi-netwerk

Je hebt een Windows-computer of Mac nodig die aan blijft staan. Op je iPad hoef je niets te installeren.

1. **Installeer op je computer Node.js 24 LTS**, via <https://nodejs.org>. De standaard installatiekeuzes zijn voldoende. Sluit na installatie eventueel bestaande terminalvensters.
2. **Download deze projectmap en pak het zipbestand uit.** Laat de bestanden bij elkaar staan. Gebruik een gewone map, bijvoorbeeld Documenten; open de startbestanden niet rechtstreeks vanuit een zipbestand.
3. **Start het dashboard op je computer.**
   - Windows: dubbelklik op `START-WINDOWS.cmd`.
   - Mac: dubbelklik op `START-MAC.command`. macOS kan bij een gedownload script om toestemming vragen. Als het bestand niet direct start, open Terminal, typ `bash ` (met een spatie), sleep `START-MAC.command` naar het venster en druk op Enter. Voer dit alleen uit vanuit jouw eigen uitgepakte projectmap.
4. De eerste keer worden de benodigde pakketten gedownload. Wacht op **Ready** en de tekst **OPENEN OP JE IPAD**.
5. **Verbind je iPad met hetzelfde wifi-netwerk als de computer.** Gebruik geen gastnetwerk dat apparaten van elkaar afschermt.
6. Open **Safari** op je iPad. Typ het netwerkadres dat het startvenster toont precies over in de adresbalk, bijvoorbeeld `http://192.168.1.25:3000`. Dit is alleen een voorbeeld: gebruik het adres van jouw computer. Gebruik `http`, zonder `s`.
7. Je ziet nu het dashboard. Houd het startvenster open en laat de computer aan staan. Stoppen kan met **Ctrl+C** in het startvenster.

Werkt een adres niet? Bij meerdere netwerkadressen probeer je het volgende getoonde adres. Sta in de computerfirewall alleen toegang op je **privénetwerk** toe, controleer dat beide apparaten op hetzelfde netwerk zitten en schakel slaapstand van de computer tijdens gebruik uit. `localhost` op de iPad verwijst naar de iPad zelf en opent de computer niet. Maak geen routerpoort openbaar voor deze lokale preview.

Je kunt het dashboard ook op de computer bekijken via `http://localhost:3000`. Om de cloudversie buiten deze ontwikkelomgeving te openen is een door het platform aangeboden poortpreview of een aparte hostingstap nodig; de cloudserver is niet automatisch publiek toegankelijk.

## Eerste gebruik

- **Overzicht:** controleer aankoopprijs AED 1.200.000, contracthuur AED 73.950 en bruto rendement 8,5%. Alle bedragen zijn in AED.
- **Huuradministratie:** er staan negen termijnen klaar, van 10 november 2026 tot en met 10 juli 2027. Vul alleen bij een daadwerkelijk ontvangen betaling de ontvangstdatum in en bevestig de melding. Via **Heropenen** maak je dit ongedaan. Er wordt niets automatisch als betaald aangemerkt. Toekomstige ontvangstdatums worden geweigerd.
- **Kosten en rendement:** vul jaarlijkse exploitatiekosten en eenmalige aankoopkosten/meubilair in. Een leeg veld betekent onbekend; vul `0` in als een post niet van toepassing is. Netto rendement verschijnt pas wanneer alle zeven posten bekend zijn.
- **Marktmonitor:** bevat de vijf verkopen en vijf nieuwe huurcontracten die op 5 november 2026 zijn aangeleverd, met unitnummer, datum, bedrag, oppervlakte en vergelijking met unit 1107. Deze zijn als geregistreerd aangeleverd, maar niet rechtstreeks aan DLD geverifieerd: bronlinks en transactiereferenties ontbreken. Bayut-aanbod blijft apart van gerealiseerde transacties. Deel een advertentielink vanuit Bayut om aanbod vast te leggen. Voeg DLD-bronrecords toe via de invoer of importeer markt-JSON. Er is geen automatische DLD- of Bayut-datastroom actief.
- **Waardeontwikkeling:** voeg een peildatum en handmatige waarde toe. Toekomstige peildatums worden scenario's genoemd. Meetpunten staan gelijkmatig verdeeld op de grafiek, niet op een proportionele tijdas. De tabel geeft de exacte bedragen en datums.
- **Instellingen:** tik op het schuifjespictogram rechtsboven of op **Objectdetails**. Hier wijzig je aankoopprijs, maandhuur, oppervlakte en optionele geschatte marktwaarde. Dit laatste is een eigen schatting, geen officiële taxatie. De begindatum en negenmaandsduur staan voor deze eerste versie vast.
- **Back-up:** tik regelmatig op de downloadknop **Exporteer gegevens** en bewaar het JSON-bestand in Bestanden op je iPad. Terugzetten kan via **Objectdetails → Back-up importeren**. Import vervangt de huidige administratie na bevestiging.

**Let op bij wijziging van de maandhuur:** dit corrigeert de geplande contracttermijnen; eerder bevestigde ontvangstbedragen blijven bewaard. Deze eerste versie registreert uitsluitend volledig betaalde maandtermijnen; deelbetalingen en tussentijdse huurprijswijzigingen worden niet ondersteund.

## Lokaal bewaren en privacy

De gegevens worden onder `apex-v1` in de lokale browseropslag (`localStorage`) opgeslagen. Er is geen financiële backend en geen automatische synchronisatie tussen iPad, telefoon en computer. Een nieuwe browser, privémodus, een ander netwerkadres/poort of het wissen van websitegegevens kan een lege administratie tonen. Importeer dan je back-up. Gebruik voor dagelijks gebruik steeds dezelfde Safari-browser en hetzelfde adres; eventueel kun je in de router een vast lokaal IP-adres aan de computer toewijzen.

De lokale preview heeft geen inlogscherm. Gebruik hem op je vertrouwde privénetwerk. Een toekomstige online versie kan dezelfde lokale opslag gebruiken; accounts en synchronisatie vragen een aparte uitbreiding. Gegevens in een lokaal exportbestand zijn leesbaar: bewaar dat bestand zorgvuldig.

## Berekeningen

- Contracthuur: eerste termijn 10 t/m 30 november (21/30 × AED 8.500 = AED 5.950) + 8 × AED 8.500 = **AED 73.950**. De overige vervaldata en contracteinddatum blijven ongewijzigd.
- Geëxtrapoleerde jaarhuur: AED 8.500 × 12 = **AED 102.000**.
- Bruto rendement: jaarhuur ÷ aankoopprijs × 100 = **8,5%**.
- Netto rendement: (jaarhuur − jaarlijkse exploitatiekosten) ÷ (aankoopprijs + eenmalige aankoopkosten + meubilair) × 100.
- Jaarlijkse exploitatiekosten: service charges, onderhoud, verzekering, beheer en overige kosten.
- Ontvangen huur: som van de bevestigde ontvangstbedragen; de eerste termijn is naar rato. Historische bevestigde ontvangstbedragen blijven bij een upgrade/import behouden.
- Openstaand: contracthuur − ontvangen huur, inclusief nog niet vervallen termijnen.

De jaarlijkse huur is een extrapolatie van het negenmaandscontract, geen gegarandeerde huur na afloop. Contractperiode: 10 november 2026 t/m 9 augustus 2027. Bruto is exclusief kosten. Netto bevat uitsluitend de ingevoerde kosten, geen financiering, belasting, verkoopresultaat of aanvullende leegstandsaanname.

## Voor ontwikkelaars

Vereist: Node.js 24 LTS en npm. De lockfile legt de geïnstalleerde versies vast.

```bash
npm ci
npm run preview     # ontwikkeling op poort 3000; toont iPad-netwerkadressen
```

Alternatief: `npm run dev` start rechtstreeks Next.js. Productie:

```bash
npm run build
npm start          # serveert de statische productie-app, inclusief offlinegebruik
```

Controles:

```bash
npm test
npm run typecheck
npm run build
npm run test:pwa   # vereist Chromium; stel zo nodig BROWSER_PATH in
```

De financiële tests draaien met Node's ingebouwde testrunner. Webpack wordt expliciet gebruikt voor compatibiliteit met cloudomgevingen waarin Turbopack-subprocessen beperkt zijn.

### Bestanden en uitbreidbaarheid

- `app/page.tsx`: interactieve dashboardweergaven, lokale opslag en back-upbediening.
- `app/globals.css`: Tailwind-import en responsieve navy/gold-vormgeving.
- `lib/finance.ts`: getypeerd objectmodel, startgegevens, berekeningen en importvalidatie.
- `lib/finance.test.ts`: tests voor berekeningen, datums en ongeldige invoer.
- `lib/market.ts`: aangeleverde transacties, bronvalidatie, statistiek en providerinterface met bron, bron-URL, transactie-ID, transactiedatum, verificatiestatus en ophaaldatum.
- `scripts/preview.mjs`: lokale preview met netwerkadressen voor de iPad.
- `app/offline-app.tsx`: installatie-uitleg en gecontroleerde offlinegereedmelding.
- `scripts/build-offline.mjs` en `scripts/service-worker-template.js`: versiegebonden offlinecache.
- `scripts/test-pwa.mjs`: installatie, offlineherladen, browserherstart en mislukte download testen.
- `next.config.mjs`: statische export en staat uitsluitend de gedetecteerde lokale computeradressen en loopback toe als ontwikkeloorsprong.

Objectgegevens zijn losgekoppeld van de rekenfuncties en hebben een stabiele `property.id`. Voor een volgend appartement voeg je een nieuw `Data`-record toe, een objectselector en een browseropslagsleutel per object, bijvoorbeeld `apex-v1:<property.id>`. Migreer bestaande `apex-v1`-gegevens daarbij expliciet; overschrijf deze niet. De eerste versie richt zich uitsluitend op unit 1107.

Toekomstige Bayut- of DLD-adapters implementeren `MarketProvider` en leveren `MarketRecord`-records. Vraagprijzen en gerealiseerde transacties hebben afzonderlijke categorieën. Verifieer bron en gebruiksrechten, vermeld herkomst en actualiteit en houd onbekende afwerking/inrichting expliciet onbekend. Er zijn geen scrapingprocessen, verzonnen transactiereferenties of API-sleutels ingebouwd.

## Herkomst en gebruik marktgegevens

De momentopname van 5 november 2026 bevat uitsluitend de door de gebruiker aangeleverde vijf 1BR-verkopen (28 oktober t/m 2 november) en vijf nieuwe huurcontracten (29 oktober t/m 3 november). Er zijn geen bronlinks of DLD/Ejari-referenties meegestuurd. Deze records hebben daarom `source: user` en `verification: unverified`, niet `dld` of `verified`. De app verzint geen afwerking, uitzicht, inrichting of transactiereferenties.

Verkoopprijzen per sqft worden uit bedrag en oppervlakte berekend; de ingevoerde huurcontracten zijn jaarlijkse bedragen. De medianen tonen alleen de vastgelegde selectie en bewijzen geen volledige dekking van het gebouw of een officiële taxatie. Jouw eigen huurcontract en handmatige marktwaardeschatting worden niet gewijzigd.

De eerste migratie voegt de tien records toe aan bestaande administratie zonder ontvangstbedragen, kosten of andere marktregels te verwijderen. `marketSeedVersion` voorkomt dat verwijderde records bij iedere herstart terugkomen. Marktregels zitten in de algemene back-up en kunnen ook apart worden geëxporteerd. JSON-import accepteert een array of `{ "records": [...] }` met hetzelfde schema als de export, maximaal 5 MB. Herhaalde bronreferenties worden bijgewerkt, niet dubbel toegevoegd.

Voor DLD-invoer zijn een officiële HTTPS-bronlink, transactiereferentie en transactiedatum nodig. Bayut-invoer vereist een officiële Bayut-link en een peildatum. Invoer in m² wordt naar sqft omgerekend; maandhuur wordt expliciet met 12 omgerekend naar jaarhuur. Controleer object en bedrag zelf voordat je de controlebevestiging aanvinkt. Dat is een handmatige broncontrole, geen automatische verificatie door DLD. Markeer vervallen Bayut-advertenties als gearchiveerd; zij tellen daarna niet meer mee in aanbodmedianen.

De officiële bronnen zijn vanuit de huidige cloudnetwerkpolicy niet bereikbaar en er is geen Bayut-appconnector beschikbaar. De app biedt bronlinks, invoer en import; er wordt geen live koppeling of actuele aanboddekking geclaimd.

Unit 1107 heeft afwerkingsniveau **Premium Plus**, opgegeven door de eigenaar. Dit is zichtbaar in het objectoverzicht en de marktvergelijking en aanpasbaar bij Objectdetails. Voor de tien aangeleverde vergelijkingsobjecten is het afwerkingsniveau onbekend; er wordt geen ongefundeerde premie of automatische waardecorrectie toegepast. Oudere lokale administratie krijgt deze objectinformatie zonder verlies van financiële gegevens.
