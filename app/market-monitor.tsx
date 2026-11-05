"use client";
import { useState, useRef } from "react";
import { ExternalLink, Plus, Upload, Download, X } from "lucide-react";
import {
  marketLabels,
  validMarketRecord,
  mergeMarketRecords,
  comparableRecords,
  transactionTrend,
  median,
  type MarketRecord,
} from "../lib/market";
import type { Property } from "../lib/finance";
const money = (n: number) =>
  new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(n);
const number = (n: number) =>
  new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 1 }).format(n);
const furnishing = {
  furnished: "Gemeubileerd",
  unfurnished: "Ongemeubileerd",
  unknown: "Onbekend",
};
export function MarketMonitor({
  property,
  records,
  onChange,
}: {
  property: Property;
  records: MarketRecord[];
  onChange: (records: MarketRecord[]) => void;
}) {
  const [source, setSource] = useState<"all" | "dld" | "bayut" | "user">("all"),
    [kind, setKind] = useState("all"),
    [form, setForm] = useState(false),
    [entrySource, setEntrySource] = useState<"dld" | "bayut">("bayut"),
    [entryKind, setEntryKind] = useState<"sale" | "rent">("sale"),
    [areaUnit, setAreaUnit] = useState("sqft"),
    [rentPeriod, setRentPeriod] = useState("annual"),
    [message, setMessage] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const compared = comparableRecords(records, property.project),
    sales = compared.filter(
      (v) =>
        v.category === "sale-transaction" &&
        (v.source === "user" ||
          (v.source === "dld" && v.verification === "verified")),
    ),
    leaseTransactions = compared.filter(
      (v) =>
        v.category === "rent-transaction" &&
        (v.source === "user" ||
          (v.source === "dld" && v.verification === "verified")),
    ),
    offers = compared.filter(
      (v) => v.category === "sale-listing" && v.active !== false,
    ),
    rents = compared.filter(
      (v) => v.category === "rent-listing" && v.active !== false,
    ),
    trend = transactionTrend(compared);
  const saleMedian = median(sales.map((v) => v.amountAed / v.areaSqft)),
    offerMedian = median(offers.map((v) => v.amountAed / v.areaSqft));
  const filtered = records.filter(
    (v) =>
      (source === "all" || v.source === source) &&
      (kind === "all" || v.category === kind),
  );
  function download() {
    const u = URL.createObjectURL(
      new Blob([JSON.stringify({ records }, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = u;
    a.download = "apex-marktgegevens.json";
    a.click();
    URL.revokeObjectURL(u);
  }
  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      const f = e.target.files?.[0];
      if (!f) return;
      if (f.size > 5 * 1024 * 1024)
        throw Error("Het bestand is groter dan 5 MB.");
      const parsed = JSON.parse(await f.text());
      const list = Array.isArray(parsed) ? parsed : parsed.records;
      if (
        !Array.isArray(list) ||
        !list.length ||
        !list.every(validMarketRecord)
      )
        throw Error(
          "Gebruik een markt-JSON met geldige DLD- of Bayut-records, bronlinks, datums en jaarlijkse huurbedragen.",
        );
      if (
        window.confirm(
          `${list.length} marktregels toevoegen/bijwerken? Dezelfde bronreferentie wordt bijgewerkt.`,
        )
      ) {
        onChange(mergeMarketRecords(records, list));
        setMessage(
          `${list.length} marktregels verwerkt. Niet automatisch aan de bron geverifieerd.`,
        );
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Import mislukt.");
    }
    e.target.value = "";
  }
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fields = new FormData(e.currentTarget);
    const value = (name: string) => String(fields.get(name) || "").trim();
    const category =
      `${entryKind}-${entrySource === "dld" ? "transaction" : "listing"}` as MarketRecord["category"];
    const amount =
      Number(value("amount")) *
      (entryKind === "rent" && rentPeriod === "monthly" ? 12 : 1);
    const record: MarketRecord = {
      id: Date.now().toString(36) + "-" + Math.random().toString(36).slice(2),
      building: property.project,
      unit: value("unit") || null,
      category,
      bedrooms: Number(value("bedrooms")),
      areaSqft:
        Number(value("area")) * (areaUnit === "sqm" ? 10.76391041671 : 1),
      amountAed: amount,
      rentalPeriod: entryKind === "rent" ? "annual" : null,
      finish: value("finish") || null,
      furnishing: value("furnishing") as MarketRecord["furnishing"],
      source: entrySource,
      sourceUrl: value("url"),
      sourceRecordId: value("reference") || null,
      transactionDate: entrySource === "dld" ? value("transactionDate") : null,
      retrievedAt: value("checked"),
      verification: fields.has("verified") ? "verified" : "unverified",
      active: true,
    };
    if (!validMarketRecord(record)) {
      setMessage(
        "Controleer de bronlink, referentie, datums en bedragen. Gebruik een HTTPS-link van Bayut, DLD of Dubai Pulse.",
      );
      return;
    }
    onChange(mergeMarketRecords(records, [record]));
    setForm(false);
    setMessage("Marktgegeven opgeslagen met bronvermelding.");
  }
  return (
    <>
      <div className="compact-kpis">
        <article className="kpi">
          <div className="kpi-label">Mediaan geregistreerde verkoop / sqft</div>
          <div className="kpi-value">
            {saleMedian === null ? "Nog geen data" : money(saleMedian)}
          </div>
          <p>
            {sales.length} transacties ·{" "}
            {sales.filter((v) => v.source === "user").length} aangeleverd, niet
            rechtstreeks geverifieerd
          </p>
        </article>
        <article className="kpi">
          <div className="kpi-label">Bayut · mediaan vraagprijs / sqft</div>
          <div className="kpi-value">
            {offerMedian === null ? "Nog niet vastgelegd" : money(offerMedian)}
          </div>
          <p>{offers.length} als actief vastgelegde verkoopadvertenties</p>
        </article>
        <article className="kpi">
          <div className="kpi-label">Mediaan geregistreerde jaarhuur</div>
          <div className="kpi-value">
            {leaseTransactions.length
              ? money(median(leaseTransactions.map((v) => v.amountAed))!)
              : "Nog geen data"}
          </div>
          <p>
            {leaseTransactions.length} huurcontracten · aangeleverde selectie
          </p>
        </article>
      </div>
      <div className="info-note">
        <p>
          Momentopname ontvangen op 5 november 2026: vijf verkopen (28 oktober–2
          november) en vijf nieuwe huurcontracten (29 oktober–3 november), door
          jou aangeleverd als geregistreerde transacties. Geen vraagprijzen.
          Rechtstreekse DLD-verificatie en bronreferenties ontbreken; afwerking,
          uitzicht en inrichting zijn onbekend.
        </p>
      </div>
      <div className="two-columns market-sources">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">GEREGISTREERDE TRANSACTIES</span>
              <h2>Dubai Land Department</h2>
              <p>
                Gerealiseerde verkoop en geregistreerde huur, met datum en
                transactiereferentie.
              </p>
            </div>
          </div>
          <div className="source-content">
            <p>
              DLD is de officiële bron. Hier staan alleen gegevens die je
              vastlegt of importeert; er is geen automatische DLD-datastroom
              actief.
            </p>
            <a
              className="btn"
              href="https://dubailand.gov.ae/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open DLD <ExternalLink size={14} />
            </a>
            <button
              className="text-button"
              onClick={() => {
                setEntrySource("dld");
                setForm(true);
              }}
            >
              DLD-transactie vastleggen <Plus size={15} />
            </button>
          </div>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">HUIDIG AANBOD · VRAAGPRIJZEN</span>
              <h2>Bayut</h2>
              <p>
                Te koop en te huur. Een advertentie is geen gerealiseerde
                transactie.
              </p>
            </div>
          </div>
          <div className="source-content">
            <p>
              Zoek in Bayut naar Binghatti Apex en filter op 1-bedroom. Deel de
              advertentielink vanuit de Bayut-app en plak deze bij de invoer.
              Controleer prijs en beschikbaarheid bij Bayut.
            </p>
            <a
              className="btn"
              href="https://www.bayut.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Bayut <ExternalLink size={14} />
            </a>
            <button
              className="text-button"
              onClick={() => {
                setEntrySource("bayut");
                setForm(true);
              }}
            >
              Bayut-advertentie vastleggen <Plus size={15} />
            </button>
          </div>
        </section>
      </div>
      {message && (
        <div className="notice" role="status">
          {message}
          <button
            onClick={() => setMessage("")}
            aria-label="Marktmelding sluiten"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {form && (
        <section className="panel market-entry">
          <div className="panel-heading">
            <h2>
              {entrySource === "dld" ? "DLD-transactie" : "Bayut-advertentie"}{" "}
              toevoegen
            </h2>
            <button
              className="icon-button"
              onClick={() => setForm(false)}
              aria-label="Marktinvoer sluiten"
            >
              <X size={17} />
            </button>
          </div>
          <form onSubmit={submit}>
            <div className="cost-grid">
              <label>
                Bron
                <select
                  value={entrySource}
                  onChange={(e) =>
                    setEntrySource(e.target.value as "dld" | "bayut")
                  }
                >
                  <option value="dld">DLD · geregistreerd</option>
                  <option value="bayut">Bayut · aanbod</option>
                </select>
              </label>
              <label>
                Type
                <select
                  value={entryKind}
                  onChange={(e) =>
                    setEntryKind(e.target.value as "sale" | "rent")
                  }
                >
                  <option value="sale">Verkoop</option>
                  <option value="rent">Huur</option>
                </select>
              </label>
              <label>
                Bronlink (HTTPS)
                <input
                  required
                  name="url"
                  type="url"
                  placeholder={
                    entrySource === "bayut"
                      ? "Plak de gedeelde Bayut-link"
                      : "Link naar DLD of Dubai Pulse"
                  }
                />
              </label>
              <label>
                {entrySource === "dld"
                  ? "DLD-transactiereferentie (verplicht)"
                  : "Bayut-advertentiereferentie (optioneel)"}
                <input name="reference" required={entrySource === "dld"} />
              </label>
              <label>
                Appartementnummer (indien bekend)
                <input name="unit" />
              </label>
              <label>
                Slaapkamers
                <input
                  required
                  name="bedrooms"
                  type="number"
                  min="0"
                  max="20"
                  step="1"
                  defaultValue="1"
                />
              </label>
              <label>
                Oppervlakte
                <input
                  required
                  name="area"
                  type="number"
                  min="0.01"
                  step="any"
                />
                <select
                  aria-label="Oppervlakte-eenheid"
                  value={areaUnit}
                  onChange={(e) => setAreaUnit(e.target.value)}
                >
                  <option value="sqft">sqft</option>
                  <option value="sqm">m² · wordt omgerekend naar sqft</option>
                </select>
              </label>
              <label>
                {entryKind === "rent"
                  ? "Huurbedrag (AED)"
                  : "Verkoopbedrag (AED)"}
                <input
                  required
                  name="amount"
                  type="number"
                  min="0.01"
                  step="any"
                />
                {entryKind === "rent" && (
                  <select
                    aria-label="Huurperiode marktgegeven"
                    value={rentPeriod}
                    onChange={(e) => setRentPeriod(e.target.value)}
                  >
                    <option value="annual">Per jaar</option>
                    <option value="monthly">
                      Per maand · × 12 voor vergelijking
                    </option>
                  </select>
                )}
              </label>
              {entrySource === "dld" && (
                <label>
                  Transactiedatum
                  <input
                    required
                    name="transactionDate"
                    type="date"
                    max={new Date().toLocaleDateString("en-CA", {
                      timeZone: "Europe/Amsterdam",
                    })}
                  />
                </label>
              )}
              <label>
                Bron geraadpleegd op
                <input
                  required
                  name="checked"
                  type="date"
                  max={new Date().toLocaleDateString("en-CA", {
                    timeZone: "Europe/Amsterdam",
                  })}
                  defaultValue={new Date().toLocaleDateString("en-CA", {
                    timeZone: "Europe/Amsterdam",
                  })}
                />
              </label>
              <label>
                Afwerkingsniveau (indien bekend)
                <input name="finish" placeholder="Onbekend" />
              </label>
              <label>
                Inrichting
                <select name="furnishing" defaultValue="unknown">
                  <option value="unknown">Onbekend</option>
                  <option value="furnished">Gemeubileerd</option>
                  <option value="unfurnished">Ongemeubileerd</option>
                </select>
              </label>
            </div>
            <label className="market-check">
              <input type="checkbox" name="verified" />
              Ik heb bedrag, object en referentie zelf gecontroleerd aan de
              bron.
            </label>
            <div className="source-content">
              <p>
                Object: {property.project}. Exacte vloer-/balkondefinities
                kunnen afwijken van jouw {number(property.area)} sqft inclusief
                balkons. Onbekende kenmerken worden niet ingevuld.
              </p>
              <button className="btn gold-btn" type="submit">
                Opslaan met bronvermelding
              </button>
            </div>
          </form>
        </section>
      )}
      <section className="panel market-trend">
        <div className="panel-heading">
          <div>
            <h2>Geregistreerde verkoop · prijsontwikkeling</h2>
            <p>
              Mediaan AED per sqft per transactiemaand · aangeleverde of aan DLD
              gecontroleerde 1-bedroom verkopen in {property.project}.
            </p>
          </div>
        </div>
        {trend.length === 0 ? (
          <div className="source-content">
            <p>
              Nog geen gecontroleerde verkooptransacties vastgelegd. Er wordt
              geen markttrend of woningwaarde verzonnen.
            </p>
          </div>
        ) : (
          <>
            <div className="value-chart">
              <svg
                viewBox="0 0 740 240"
                role="img"
                aria-label="Verkoopprijsontwikkeling op basis van de vastgelegde transacties"
              >
                {(() => {
                  const lo = Math.min(...trend.map((v) => v.price)) * 0.9,
                    hi = Math.max(...trend.map((v) => v.price)) * 1.1;
                  const x = (i: number) =>
                      45 + (i * 650) / Math.max(trend.length - 1, 1),
                    y = (v: number) => 185 - ((v - lo) / (hi - lo)) * 150;
                  return (
                    <>
                      <polyline
                        fill="none"
                        stroke="#d4b47b"
                        strokeWidth="3"
                        points={trend
                          .map((v, i) => `${x(i)},${y(v.price)}`)
                          .join(" ")}
                      />
                      {trend.map((v, i) => (
                        <g key={v.month}>
                          <circle
                            cx={x(i)}
                            cy={y(v.price)}
                            r="4"
                            fill="#d4b47b"
                          />
                          <text
                            x={x(i)}
                            y="220"
                            textAnchor={i === 0 ? "start" : "end"}
                            fill="#9da5b3"
                            fontSize="11"
                          >
                            {v.month}
                          </text>
                          <title>
                            {v.month}: {money(v.price)}/sqft · {v.count}{" "}
                            transacties
                          </title>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Transactiemaand</th>
                    <th>Mediaan AED / sqft</th>
                    <th>Aantal</th>
                  </tr>
                </thead>
                <tbody>
                  {trend.map((v) => (
                    <tr key={v.month}>
                      <td>{v.month}</td>
                      <td>{money(v.price)}</td>
                      <td>{v.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <div className="formula">
          Alleen jouw vastgelegde selectie, geen volledige marktdekking. Maanden
          zonder data ontbreken; meetpunten staan op gelijke afstand. Een andere
          transactiemix kan het gemiddelde beïnvloeden. Dit is geen officiële
          taxatie.
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading market-records-heading">
          <div>
            <h2>Brongegevens & vergelijking met unit 1107</h2>
            <p>
              Jouw afwerking: {property.finish || "Onbekend"}. Jouw aankoop:{" "}
              {money(property.purchase / property.area)}/sqft · jaarhuur:{" "}
              {money((property.rent * 12) / property.area)}/sqft.
            </p>
          </div>
          <div className="heading-actions">
            <button className="btn" onClick={() => file.current?.click()}>
              <Upload size={15} />
              Importeer JSON
            </button>
            <button className="btn" onClick={download}>
              <Download size={15} />
              Exporteer markt
            </button>
            <input
              hidden
              type="file"
              ref={file}
              accept=".json,application/json"
              onChange={upload}
            />
          </div>
        </div>
        <div className="filters">
          {(["all", "dld", "bayut", "user"] as const).map((v) => (
            <button
              key={v}
              className={source === v ? "selected" : ""}
              onClick={() => setSource(v)}
            >
              {v === "all"
                ? "Alle bronnen"
                : v === "dld"
                  ? "DLD · met bron"
                  : v === "user"
                    ? "Aangeleverde transacties"
                    : "Bayut · aanbod"}
            </button>
          ))}
          <select
            aria-label="Marktcategorie"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            <option value="all">Alle categorieën</option>
            {Object.entries(marketLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Bron / object</th>
                <th>Categorie</th>
                <th>Prijs</th>
                <th>Oppervlakte</th>
                <th>AED / sqft (berekend)</th>
                <th>Verschil met 1107</th>
                <th>Datum & controle</th>
                <th>Afwerking / inrichting</th>
                <th>Actie</th>
              </tr>
            </thead>
            <tbody>
              {!filtered.length ? (
                <tr>
                  <td colSpan={9}>
                    Nog geen brongegevens in deze selectie. Voeg een
                    DLD-transactie of Bayut-advertentie toe. Er worden geen
                    fictieve gegevens getoond.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => {
                  const rental = v.category.startsWith("rent"),
                    comparable =
                      v.bedrooms === 1 &&
                      v.building.trim().toLowerCase() ===
                        property.project.trim().toLowerCase(),
                    base =
                      (rental ? property.rent * 12 : property.purchase) /
                      property.area;
                  return (
                    <tr key={v.id}>
                      <td>
                        {v.sourceUrl ? (
                          <a
                            className="gold"
                            href={v.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {v.source === "dld" ? "DLD" : "Bayut"}{" "}
                            <ExternalLink size={11} />
                          </a>
                        ) : (
                          <span className="gold">Door jou aangeleverd</span>
                        )}
                        <small className="table-small">
                          {v.building} · {v.unit || "unit onbekend"} ·{" "}
                          {v.bedrooms} slpk
                        </small>
                        <small className="table-small">
                          Ref: {v.sourceRecordId || "niet opgegeven"}
                        </small>
                      </td>
                      <td>
                        {marketLabels[v.category]}
                        {v.source === "bayut" && (
                          <small className="table-small">
                            {v.active === false
                              ? "Gearchiveerd"
                              : "Als actief vastgelegd"}
                          </small>
                        )}
                      </td>
                      <td>
                        {money(v.amountAed)}
                        <small className="table-small">
                          {rental ? "Per jaar" : "Totaal"} ·{" "}
                          {v.source === "bayut"
                            ? "vraagprijs"
                            : "geregistreerd bedrag"}
                        </small>
                      </td>
                      <td>{number(v.areaSqft)} sqft</td>
                      <td>
                        {money(v.amountAed / v.areaSqft)}
                        {v.reportedPricePerSqft !== undefined && (
                          <small className="table-small">
                            Aangeleverd: {money(v.reportedPricePerSqft)}
                          </small>
                        )}
                        {rental && (
                          <small className="table-small">per jaar</small>
                        )}
                      </td>
                      <td>
                        {comparable
                          ? `${number((v.amountAed / v.areaSqft / base - 1) * 100)}%`
                          : "Niet vergelijkbaar"}
                      </td>
                      <td>
                        {v.transactionDate || "Advertentie"}
                        <small className="table-small">
                          Geraadpleegd: {v.retrievedAt}
                        </small>
                        <small className="table-small">
                          {v.source === "user"
                            ? "Bron niet rechtstreeks geverifieerd"
                            : v.verification === "verified"
                              ? "Door jou gecontroleerd"
                              : "Nog niet gecontroleerd"}
                        </small>
                      </td>
                      <td>
                        {v.finish || "Afwerking onbekend"}
                        <small className="table-small">
                          {furnishing[v.furnishing]}
                        </small>
                      </td>
                      <td>
                        {v.source === "bayut" && (
                          <button
                            className="text-button"
                            onClick={() =>
                              onChange(
                                records.map((r) =>
                                  r.id === v.id
                                    ? { ...r, active: v.active === false }
                                    : r,
                                ),
                              )
                            }
                          >
                            {v.active === false ? "Activeren" : "Archiveren"}
                          </button>
                        )}
                        <button
                          className="text-button"
                          onClick={() => {
                            if (window.confirm("Dit marktgegeven verwijderen?"))
                              onChange(records.filter((r) => r.id !== v.id));
                          }}
                        >
                          Verwijderen
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="formula">
          Jouw unit heeft afwerking {property.finish || "onbekend"}, door jou
          opgegeven. De afwerking van de aangeleverde vergelijkingsobjecten is
          onbekend. Zonder aantoonbaar vergelijkbare afwerking wordt geen
          waardetoeslag of prijscorrectie berekend. Vraagprijzen en
          gerealiseerde bedragen worden niet samengevoegd. AED per sqft wordt
          berekend uit het bedrag en de opgegeven oppervlakte; de aangeleverde
          sqft-prijs staat waar beschikbaar afzonderlijk vermeld. Vergelijkingen
          zijn op prijs per sqft, zonder correctie voor inrichting, afwerking,
          verdieping of balkondefinitie. Bayut-beschikbaarheid verandert: de
          peildatum is de laatste handmatige controle, geen live status.
          Aangeleverde transacties tellen apart herkenbaar mee; zij zijn niet
          rechtstreeks aan DLD gecontroleerd. Gearchiveerd Bayut-aanbod telt
          niet mee in aanbodmedianen. Alle marktgegevens zitten ook in de
          algemene dashboardback-up.
        </div>
      </section>
    </>
  );
}
