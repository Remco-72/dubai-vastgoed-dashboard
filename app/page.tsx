"use client";
import { useEffect, useState, useRef } from "react";
import {
  ArrowUpRight,
  ArrowDownToLine,
  Building2,
  LayoutDashboard,
  Wallet,
  ChartNoAxesCombined,
  TrendingUp,
  Settings2,
  ChevronRight,
  MapPin,
  Check,
  Plus,
  X,
  ShieldCheck,
  Upload,
  ArrowRight,
  Layers3,
} from "lucide-react";
import { OfflineApp } from "./offline-app";
import { basePath } from "../lib/paths";
import { MarketMonitor } from "./market-monitor";
import {
  initial,
  calculate,
  installmentAmount,
  preserveReceipts,
  applyMarketSnapshot,
  dueDate,
  contractEnd,
  validData,
  type Data,
  type CostKey,
} from "../lib/finance";
const money = (n: number) =>
  new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(n);
const num = (n: number) =>
  new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 1 }).format(n);
const date = (s: string) =>
  new Date(s + "T12:00:00").toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
const tabs = [
  { name: "Overzicht", icon: LayoutDashboard },
  { name: "Huuradministratie", icon: Wallet },
  { name: "Kosten en rendement", icon: ChartNoAxesCombined },
  { name: "Marktmonitor", icon: Building2 },
  { name: "Waardeontwikkeling", icon: TrendingUp },
];
const costLabels: Record<CostKey, string> = {
  service: "Service charges",
  maintenance: "Onderhoud",
  insurance: "Verzekering",
  management: "Beheerkosten",
  other: "Overige kosten",
  purchase: "Aankoopkosten",
  furniture: "Meubilair",
};
export default function Dashboard() {
  const [data, setData] = useState<Data>(initial),
    [loaded, setLoaded] = useState(false),
    [tab, setTab] = useState(0),
    [settings, setSettings] = useState(false),
    [notice, setNotice] = useState(""),
    [storageError, setStorageError] = useState(""),
    [valuationDate, setValuationDate] = useState(""),
    [valuationAmount, setValuationAmount] = useState("");
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("apex-v1");
      if (raw) {
        const saved = JSON.parse(raw);
        if (validData(saved))
          setData(applyMarketSnapshot(preserveReceipts(saved)));
        else
          setStorageError(
            "Opgeslagen gegevens zijn ongeldig. Exporteer of controleer de browseropslag voordat je wijzigingen maakt.",
          );
      }
    } catch {
      setStorageError(
        "Lokale opslag is niet beschikbaar of beschadigd. Gebruik een export als back-up.",
      );
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded && !storageError) {
      try {
        localStorage.setItem("apex-v1", JSON.stringify(data));
      } catch {
        setStorageError("Opslaan mislukt. Exporteer je gegevens als back-up.");
      }
    }
  }, [data, loaded, storageError]);
  useEffect(() => {
    if (!settings) return;
    const opener = document.activeElement as HTMLElement | null;
    const modal = document.querySelector<HTMLElement>("[role=dialog]");
    const controls = () =>
      modal?.querySelectorAll<HTMLElement>(
        'button,input:not([hidden]):not([type="file"]),[tabindex="0"]',
      );
    controls()?.[0]?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSettings(false);
      if (e.key === "Tab") {
        const items = controls();
        if (!items?.length) return;
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = previous;
      opener?.focus();
    };
  }, [settings]);
  const p = data.property,
    f = calculate(data);
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Amsterdam",
  });
  const next = data.payments.findIndex((x) => !x.paid);
  function exportData() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "apex-1107-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    setNotice("Back-up gedownload. Bewaar dit bestand op een veilige plek.");
  }
  async function importData(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      const selected = e.target.files?.[0];
      if (!selected) return;
      const d = JSON.parse(await selected.text());
      if (!validData(d)) throw Error();
      if (window.confirm("Huidige gegevens vervangen door deze back-up?")) {
        setData(applyMarketSnapshot(preserveReceipts(d)));
        setStorageError("");
        setNotice("Back-up hersteld.");
      }
    } catch {
      setNotice("Import mislukt: dit is geen geldige Apex-back-up.");
    }
    e.target.value = "";
  }
  function paid(i: number, received: string) {
    setData((d) => ({
      ...d,
      payments: d.payments.map((x, j) =>
        i === j
          ? {
              paid: !!received,
              received,
              ...(received
                ? { receivedAmount: installmentAmount(d.property, i) }
                : {}),
            }
          : x,
      ),
    }));
  }
  const values = [
    { date: "Aankoop", amount: p.purchase },
    ...data.valuations.slice().sort((a, b) => a.date.localeCompare(b.date)),
  ];
  const min = Math.min(...values.map((v) => v.amount)) * 0.92,
    max = Math.max(...values.map((v) => v.amount)) * 1.08;
  const y = (v: number) => 185 - ((v - min) / (max - min)) * 150;
  const x = (i: number) => 45 + i * (650 / Math.max(values.length - 1, 1));
  return (
    <div className="shell">
      <aside className="sidebar">
        <a
          className="brand"
          href={`${basePath}/`}
          aria-label="Apex startpagina"
        >
          <div className="brand-mark">
            A<span> /</span>
          </div>
          <div>
            APEX<small>PROPERTY INTELLIGENCE</small>
          </div>
        </a>
        <div className="workspace-label">INVESTMENT WORKSPACE</div>
        <nav>
          {tabs.map((t, i) => (
            <button
              key={t.name}
              onClick={() => setTab(i)}
              aria-current={tab === i ? "page" : undefined}
              className={tab === i ? "nav-item active" : "nav-item"}
            >
              <t.icon size={19} />
              <span>{t.name}</span>
              {tab === i && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-property">
          <span className="tiny-label">MIJN PORTEFEUILLE</span>
          <div className="portfolio-icon">
            <Building2 size={22} />
          </div>
          <strong>{p.project}</strong>
          <p>Unit {p.unit} · 1-bedroom</p>
          <span className="status">
            <span />
            Verhuurd
          </span>
        </div>
        <div className="sidebar-bottom">
          <ShieldCheck size={17} />
          <div>
            Privé & lokaal opgeslagen
            <small>Jouw gegevens blijven in deze browser</small>
          </div>
        </div>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <div className="breadcrumb">
            Mijn portefeuille <ChevronRight size={14} />
            <span>Unit {p.unit}</span>
          </div>
          <div className="top-actions">
            <span className="local-indicator">
              <span />
              {loaded ? "Lokale werkruimte" : "Laden…"}
            </span>
            <button
              className="avatar"
              onClick={() => setSettings(true)}
              aria-label="Objectinstellingen"
            >
              AP
            </button>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">BINGHATTI APEX · DUBAI</div>
              <h1>
                {tabs[tab].name}
                <span className="gold">.</span>
              </h1>
              <p>Een helder perspectief op jouw vastgoedinvestering.</p>
            </div>
            <div className="heading-actions">
              <button className="btn" onClick={exportData}>
                <ArrowDownToLine size={16} />
                Exporteer gegevens
              </button>
              <button
                className="icon-button"
                onClick={() => setSettings(true)}
                aria-label="Financiële gegevens aanpassen"
              >
                <Settings2 size={19} />
              </button>
            </div>
          </div>
          <OfflineApp />
          {storageError && (
            <div role="alert" className="alert">
              {storageError}
            </div>
          )}
          {notice && (
            <div role="status" className="notice">
              {notice}
              <button
                onClick={() => setNotice("")}
                aria-label="Melding sluiten"
              >
                <X size={16} />
              </button>
            </div>
          )}
          {tab === 0 && (
            <>
              <section className="property-banner">
                <div className="building-art" aria-hidden="true">
                  <div className="tower tower-back" />
                  <div className="tower tower-front" />
                  <div className="art-sun" />
                  <span>APEX / 1107</span>
                </div>
                <div className="property-details">
                  <div className="eyebrow">
                    JOUW INVESTERING{" "}
                    <span className="status">
                      <span />
                      Verhuurd
                    </span>
                  </div>
                  <h2>
                    {p.project} <span>Unit {p.unit}</span>
                  </h2>
                  <p>
                    <MapPin size={14} />
                    {p.location}
                  </p>
                  <div className="property-facts">
                    <span>1-bedroom apartment</span>
                    <span className="gold">
                      {p.finish || "Afwerking onbekend"}
                    </span>
                    <span>
                      {num(p.area)} sqft <small>incl. balkons</small>
                    </span>
                    <span>{p.months} maanden contract</span>
                  </div>
                </div>
                <button
                  className="banner-link"
                  onClick={() => setSettings(true)}
                >
                  Objectdetails <ArrowUpRight size={17} />
                </button>
              </section>
              <div className="section-heading">
                <h2>Financieel in één oogopslag</h2>
                <span className="tiny-label">ALLE BEDRAGEN IN AED</span>
              </div>
              <div className="kpi-grid">
                <Kpi
                  label="Aankoopprijs"
                  value={money(p.purchase)}
                  sub={`${money(p.purchase / p.area)} per sqft`}
                  icon={<Building2 size={18} />}
                />
                <Kpi
                  label="Actuele contracthuur"
                  value={money(f.contract)}
                  sub={`${p.months} maanden · ${money(p.rent)} / maand`}
                  icon={<Wallet size={18} />}
                />
                <Kpi
                  label="Bruto huurrendement"
                  value={`${num(f.gross)}%`}
                  sub="Op jaarbasis · volle maandhuur · excl. kosten"
                  gold
                  icon={<TrendingUp size={18} />}
                />
                <Kpi
                  label="Ontvangen huur"
                  value={money(f.received)}
                  sub={`${data.payments.filter((x) => x.paid).length} van ${p.months} termijnen bevestigd`}
                  icon={<Check size={18} />}
                />
                <Kpi
                  label="Nog te ontvangen"
                  value={money(f.outstanding)}
                  sub="Openstaande contracthuur"
                  icon={<Wallet size={18} />}
                />
                <Kpi
                  label="Geschatte marktwaarde"
                  value={
                    p.market === null ? "Nog niet bepaald" : money(p.market)
                  }
                  sub="Handmatige schatting · geen taxatie"
                  icon={<ChartNoAxesCombined size={18} />}
                />
              </div>
              <div className="two-columns">
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Huurinkomsten</h2>
                      <p>
                        Contractoverzicht · {date(p.start)} –{" "}
                        {date(contractEnd(p.start, p.months))}
                      </p>
                    </div>
                    <span className="chip">{p.months} maanden</span>
                  </div>
                  <div className="chart-legend">
                    <span>
                      <i className="legend-gold" />
                      Contractueel
                    </span>
                    <span>
                      <i className="legend-green" />
                      Ontvangen
                    </span>
                  </div>
                  <div className="bar-chart">
                    <div className="chart-y">
                      <span>{num(p.rent / 1000)}k</span>
                      <span>{num(p.rent / 2000)}k</span>
                      <span>0</span>
                    </div>
                    <div className="bars">
                      {data.payments.map((v, i) => (
                        <div className="bar-slot" key={i}>
                          <div
                            className={"bar " + (v.paid ? "received" : "")}
                            style={{
                              height: `${p.rent > 0 ? ((v.paid ? (v.receivedAmount ?? installmentAmount(p, i)) : installmentAmount(p, i)) / p.rent) * 100 : 0}%`,
                            }}
                            title={`${date(dueDate(p.start, i))}: ${money(v.paid ? (v.receivedAmount ?? installmentAmount(p, i)) : installmentAmount(p, i))} ${v.paid ? "ontvangen" : "contractueel"}`}
                          />
                          <span>
                            {new Date(
                              dueDate(p.start, i) + "T12:00:00",
                            ).toLocaleDateString("nl-NL", { month: "short" })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="panel-footer">
                    <span>
                      Huur op jaarbasis <strong>{money(f.annual)}</strong>
                    </span>
                    <span className="muted">
                      Extrapolatie van het {p.months}-maandscontract
                    </span>
                  </div>
                </section>
                <section className="panel contract-card">
                  <div className="panel-heading">
                    <div>
                      <h2>Jouw huurcontract</h2>
                      <p>Overzicht van de lopende overeenkomst</p>
                    </div>
                    <div className="small-icon">
                      <Layers3 size={20} />
                    </div>
                  </div>
                  <dl>
                    <div>
                      <dt>Startdatum</dt>
                      <dd>{date(p.start)}</dd>
                    </div>
                    <div>
                      <dt>Huurperiode</dt>
                      <dd>{p.months} maanden</dd>
                    </div>
                    <div>
                      <dt>Maandelijkse huur</dt>
                      <dd>{money(p.rent)}</dd>
                    </div>
                    <div>
                      <dt>Betaalfrequentie</dt>
                      <dd>Maandelijks</dd>
                    </div>
                  </dl>
                  <div className="next-payment">
                    <span>VOLGENDE OPENSTAANDE TERMIJN</span>
                    <strong>
                      {next < 0
                        ? "Alles ontvangen"
                        : money(installmentAmount(p, next))}{" "}
                      <small>
                        {next < 0 ? "" : date(dueDate(p.start, next))}
                      </small>
                    </strong>
                  </div>
                  <button className="text-button" onClick={() => setTab(1)}>
                    Naar huuradministratie <ArrowRight size={16} />
                  </button>
                </section>
              </div>
              <div className="info-note">
                <ShieldCheck size={16} />
                <p>
                  Inzicht met de juiste context. Rendementen zijn exclusief
                  kosten. De jaarlijkse huur is een extrapolatie; er is geen
                  huur na dit contract gegarandeerd. Betalingen worden
                  uitsluitend na jouw bevestiging als ontvangen verwerkt.
                </p>
              </div>
            </>
          )}
          {tab === 1 && (
            <>
              <div className="compact-kpis">
                <Kpi
                  label="Contracthuur"
                  value={money(f.contract)}
                  sub={`${p.months} maandtermijnen`}
                />
                <Kpi
                  label="Ontvangen"
                  value={money(f.received)}
                  sub="Uitsluitend bevestigde betalingen"
                />
                <Kpi
                  label="Openstaand"
                  value={money(f.outstanding)}
                  sub="Inclusief toekomstige termijnen"
                  gold
                />
              </div>
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>Maandelijkse huurtermijnen</h2>
                    <p>
                      Eerste termijn: 10 t/m 30 november 2026, 21/30 × de
                      maandhuur. De overige termijnen en vervaldata blijven
                      ongewijzigd. Vul de werkelijke ontvangstdatum in om een
                      betaling te bevestigen.
                    </p>
                  </div>
                  <span className="chip">Maandelijks</span>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Termijn</th>
                        <th>Vervaldatum</th>
                        <th>Bedrag</th>
                        <th>Status</th>
                        <th>Ontvangstdatum</th>
                        <th>Actie</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.payments.map((v, i) => (
                        <tr key={i}>
                          <td className="strong">
                            {String(i + 1).padStart(2, "0")}
                          </td>
                          <td>{date(dueDate(p.start, i))}</td>
                          <td>
                            {money(installmentAmount(p, i))}
                            {i === 0 && (
                              <small className="table-small">
                                10 t/m 30 november · 21/30 naar rato
                              </small>
                            )}
                          </td>
                          <td>
                            <span
                              className={
                                "badge " +
                                (v.paid
                                  ? "green"
                                  : dueDate(p.start, i) < today
                                    ? "amber"
                                    : "")
                              }
                            >
                              {v.paid
                                ? "Betaald"
                                : dueDate(p.start, i) < today
                                  ? "Vervallen"
                                  : "Openstaand"}
                            </span>
                          </td>
                          <td>
                            <input
                              aria-label={`Ontvangstdatum termijn ${i + 1}`}
                              type="date"
                              max={today}
                              value={v.received}
                              onChange={(e) => {
                                if (e.target.value > today) {
                                  setNotice(
                                    "Een ontvangstdatum kan niet in de toekomst liggen.",
                                  );
                                  return;
                                }
                                if (
                                  !e.target.value ||
                                  window.confirm(
                                    `Ontvangst van ${money(installmentAmount(p, i))} voor termijn ${i + 1} bevestigen?`,
                                  )
                                )
                                  paid(i, e.target.value);
                              }}
                            />
                            {v.paid && (
                              <small className="table-small">
                                Ontvangen:{" "}
                                {money(
                                  v.receivedAmount ?? installmentAmount(p, i),
                                )}
                              </small>
                            )}
                          </td>
                          <td>
                            {v.paid ? (
                              <button
                                className="text-button"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      "Deze betaling weer als openstaand markeren?",
                                    )
                                  )
                                    paid(i, "");
                                }}
                              >
                                Heropenen
                              </button>
                            ) : (
                              <span className="muted">Vul datum in</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
          {tab === 2 && (
            <>
              <div className="compact-kpis">
                <Kpi
                  label="Bruto rendement / jaar"
                  value={`${num(f.gross)}%`}
                  sub={`${money(f.annual)} / ${money(p.purchase)}`}
                />
                <Kpi
                  label="Netto rendement / jaar"
                  value={
                    f.net === null ? "Nog niet beschikbaar" : `${num(f.net)}%`
                  }
                  sub={
                    f.net === null
                      ? "Vul alle kosten in, ook expliciete nullen"
                      : "Gebaseerd op totale investering"
                  }
                  gold
                />
                <Kpi
                  label="Jaarlijkse exploitatiekosten"
                  value={money(f.expenses)}
                  sub="Som van de ingevulde jaarlijkse kosten"
                />
              </div>
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>Kosten van jouw investering</h2>
                    <p>
                      Leeg betekent onbekend. Vul 0 in wanneer een kostenpost
                      niet van toepassing is.
                    </p>
                  </div>
                </div>
                <div className="cost-grid">
                  {(Object.keys(costLabels) as CostKey[]).map((k) => (
                    <label key={k}>
                      {costLabels[k]}
                      <span className="input-addon">
                        <span>AED</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Nog onbekend"
                          value={data.costs[k] ?? ""}
                          onChange={(e) =>
                            setData((d) => ({
                              ...d,
                              costs: {
                                ...d.costs,
                                [k]:
                                  e.target.value === ""
                                    ? null
                                    : Math.max(0, Number(e.target.value)),
                              },
                            }))
                          }
                        />
                      </span>
                      <small>
                        {k === "purchase" || k === "furniture"
                          ? "Eenmalig · toegevoegd aan investering"
                          : "Per jaar · exploitatiekosten"}
                      </small>
                    </label>
                  ))}
                </div>
                <div className="formula">
                  <h3>Berekeningsgrondslag</h3>
                  <p>Bruto = (maandhuur × 12) ÷ aankoopprijs × 100.</p>
                  <p>
                    Netto = (maandhuur × 12 − jaarlijkse exploitatiekosten) ÷
                    (aankoopprijs + aankoopkosten + meubilair) × 100.
                  </p>
                  <p>
                    De huur is geëxtrapoleerd uit {p.months} maanden. Geen
                    leegstand, financiering, belasting of verkoopwinst
                    opgenomen. Het netto rendement verschijnt zodra alle zeven
                    kostenposten bekend zijn.
                  </p>
                </div>
              </section>
            </>
          )}
          {tab === 3 && (
            <MarketMonitor
              property={p}
              records={data.market ?? []}
              onChange={(market) => setData((d) => ({ ...d, market }))}
            />
          )}
          {tab === 4 && (
            <>
              <div className="compact-kpis">
                <Kpi
                  label="Oorspronkelijke aankoopprijs"
                  value={money(p.purchase)}
                  sub="Referentie voor de waardeontwikkeling"
                />
                <Kpi
                  label="Laatste ingevoerde waarde"
                  value={
                    values.length > 1
                      ? money(values.at(-1)!.amount)
                      : "Nog geen metingen"
                  }
                  sub="Handmatige invoer · geen officiële taxatie"
                  gold
                />
                <Kpi
                  label="Ontwikkeling t.o.v. aankoop"
                  value={
                    values.length > 1
                      ? `${num((values.at(-1)!.amount / p.purchase - 1) * 100)}%`
                      : "—"
                  }
                  sub="Ongerealiseerde waardeverandering"
                />
              </div>
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>Waardeontwikkeling</h2>
                    <p>
                      Voeg gedateerde waardeschattingen toe. Toekomstige waarden
                      zijn scenario’s. Meetpunten staan op gelijke afstand.
                    </p>
                  </div>
                </div>
                <div className="value-chart">
                  <svg
                    viewBox="0 0 740 240"
                    role="img"
                    aria-label="Ingevoerde waarden vergeleken met de oorspronkelijke aankoopprijs"
                  >
                    <line
                      x1="45"
                      x2="695"
                      y1={y(p.purchase)}
                      y2={y(p.purchase)}
                      stroke="#798393"
                      strokeDasharray="6 6"
                    />
                    <text
                      x="45"
                      y={y(p.purchase) - 10}
                      fill="#9da5b3"
                      fontSize="11"
                    >
                      Aankoop {money(p.purchase)}
                    </text>
                    <polyline
                      points={values
                        .map((v, i) => `${x(i)},${y(v.amount)}`)
                        .join(" ")}
                      fill="none"
                      stroke="#d5b67b"
                      strokeWidth="3"
                    />
                    {values.map((v, i) => (
                      <g key={i}>
                        <circle
                          cx={x(i)}
                          cy={y(v.amount)}
                          r="5"
                          fill="#d5b67b"
                        />
                        <text
                          x={x(i)}
                          y="220"
                          textAnchor={
                            i === 0
                              ? "start"
                              : i === values.length - 1
                                ? "end"
                                : "middle"
                          }
                          fill="#9da5b3"
                          fontSize="11"
                        >
                          {v.date === "Aankoop" ? "Aankoop" : date(v.date)}
                        </text>
                        <title>
                          {v.date}: {money(v.amount)}
                        </title>
                      </g>
                    ))}
                  </svg>
                </div>
                <form
                  className="valuation-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const amount = Number(valuationAmount);
                    if (
                      !valuationDate ||
                      !Number.isFinite(amount) ||
                      amount <= 0
                    )
                      return;
                    setData((d) => ({
                      ...d,
                      valuations: [
                        ...d.valuations,
                        {
                          id:
                            typeof crypto.randomUUID === "function"
                              ? crypto.randomUUID()
                              : Date.now().toString(36) +
                                "-" +
                                Math.random().toString(36).slice(2),
                          date: valuationDate,
                          amount,
                        },
                      ],
                    }));
                    setValuationAmount("");
                    setNotice("Waarde toegevoegd.");
                  }}
                >
                  <label>
                    Peildatum
                    <input
                      required
                      type="date"
                      value={valuationDate}
                      onChange={(e) => setValuationDate(e.target.value)}
                    />
                  </label>
                  <label>
                    Waarde in AED
                    <input
                      required
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="Bijv. 1.300.000"
                      value={valuationAmount}
                      onChange={(e) => setValuationAmount(e.target.value)}
                    />
                  </label>
                  <button className="btn gold-btn">
                    <Plus size={16} />
                    Waarde toevoegen
                  </button>
                </form>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Peildatum</th>
                        <th>Waarde</th>
                        <th>Soort</th>
                        <th>Actie</th>
                      </tr>
                    </thead>
                    <tbody>
                      {values.length === 1 ? (
                        <tr>
                          <td colSpan={4}>
                            Nog geen waarden toegevoegd. Begin met een peildatum
                            en schatting.
                          </td>
                        </tr>
                      ) : (
                        data.valuations
                          .slice()
                          .sort((a, b) => a.date.localeCompare(b.date))
                          .map((v) => (
                            <tr key={v.id}>
                              <td>{date(v.date)}</td>
                              <td>{money(v.amount)}</td>
                              <td>
                                {v.date > today
                                  ? "Toekomstscenario"
                                  : "Handmatige schatting"}
                              </td>
                              <td>
                                <button
                                  className="text-button"
                                  onClick={() => {
                                    if (
                                      window.confirm("Deze waarde verwijderen?")
                                    )
                                      setData((d) => ({
                                        ...d,
                                        valuations: d.valuations.filter(
                                          (a) => a.id !== v.id,
                                        ),
                                      }));
                                  }}
                                >
                                  Verwijderen
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
          <footer>
            <span>
              APEX <span className="muted">PROPERTY INTELLIGENCE</span>
            </span>
            <span>Jouw vastgoed. Jouw perspectief.</span>
          </footer>
        </main>
      </div>
      {settings && (
        <div className="modal-overlay" onClick={() => setSettings(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="panel-heading">
              <div>
                <span className="eyebrow">UNIT {p.unit}</span>
                <h2 id="settings-title">Object & gegevens</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setSettings(false)}
                aria-label="Sluiten"
              >
                <X size={20} />
              </button>
            </div>
            <p className="muted">
              Wijzigingen worden direct in deze browser bewaard. Contractduur en
              begindatum staan voor deze eerste versie vast.
            </p>
            <div className="settings-fields">
              <label>
                Afwerkingsniveau
                <input
                  type="text"
                  maxLength={80}
                  value={p.finish ?? ""}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      property: { ...d.property, finish: e.target.value },
                    }))
                  }
                />
              </label>
              {(
                [
                  { key: "purchase", label: "Aankoopprijs (AED)", min: 1 },
                  { key: "rent", label: "Maandhuur (AED)", min: 0 },
                  {
                    key: "area",
                    label: "Oppervlakte inclusief balkons (sqft)",
                    min: 1,
                  },
                  {
                    key: "market",
                    label: "Geschatte marktwaarde (AED, optioneel)",
                    min: 1,
                  },
                ] as const
              ).map((v) => (
                <label key={v.key}>
                  {v.label}
                  <input
                    type="number"
                    min={v.min}
                    step="0.01"
                    value={p[v.key] ?? ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? null : Number(e.target.value);
                      if (value === null && v.key !== "market") return;
                      if (
                        value !== null &&
                        (!Number.isFinite(value) || value < v.min)
                      )
                        return;
                      setData((d) => ({
                        ...d,
                        property: { ...d.property, [v.key]: value },
                      }));
                    }}
                  />
                </label>
              ))}
            </div>
            <p className="muted">
              Een wijziging van de maandhuur herberekent alle negen termijnen,
              de geplande termijnen. Bevestigde ontvangstbedragen blijven
              bewaard. Gebruik dit alleen om de contractgegevens te corrigeren.
            </p>
            <div className="modal-actions">
              <button className="btn" onClick={exportData}>
                <ArrowDownToLine size={16} />
                Back-up exporteren
              </button>
              <button className="btn" onClick={() => file.current?.click()}>
                <Upload size={16} />
                Back-up importeren
              </button>
              <input
                ref={file}
                type="file"
                accept="application/json,.json"
                hidden
                onChange={importData}
              />
            </div>
            <div className="info-note">
              <ShieldCheck size={18} />
              <p>
                Gegevens worden niet automatisch gesynchroniseerd tussen
                apparaten. Exporteer regelmatig een back-up; gewiste
                browsergegevens verwijderen ook je administratie.
              </p>
            </div>
            <button
              className="btn gold-btn full"
              onClick={() => setSettings(false)}
            >
              Gereed <Check size={17} />
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
function Kpi({
  label,
  value,
  sub,
  gold,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  gold?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <article className={"kpi " + (gold ? "kpi-gold" : "")}>
      <div className="kpi-label">
        {label}
        <span>{icon}</span>
      </div>
      <div className={"kpi-value " + (gold ? "gold" : "")}>{value}</div>
      <p>{sub}</p>
    </article>
  );
}
