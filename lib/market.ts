export type MarketCategory =
  "sale-listing" | "sale-transaction" | "rent-listing" | "rent-transaction";
export type MarketRecord = {
  id: string;
  building: string;
  unit: string | null;
  category: MarketCategory;
  bedrooms: number;
  areaSqft: number;
  amountAed: number;
  reportedPricePerSqft?: number;
  rentalPeriod: "annual" | null;
  finish: string | null;
  furnishing: "furnished" | "unfurnished" | "unknown";
  source: "bayut" | "dld" | "user";
  sourceUrl: string | null;
  sourceRecordId: string | null;
  transactionDate: string | null;
  retrievedAt: string;
  verification: "unverified" | "verified";
  active?: boolean;
};
export interface MarketProvider {
  name: string;
  load(building: string): Promise<MarketRecord[]>;
}
export const marketLabels: Record<MarketCategory, string> = {
  "sale-listing": "Te koop",
  "sale-transaction": "Verkocht",
  "rent-listing": "Te huur",
  "rent-transaction": "Geregistreerde huur",
};
export function sourceUrlValid(source: MarketRecord["source"], value: string) {
  try {
    const u = new URL(value);
    const domains =
      source === "bayut"
        ? ["bayut.com"]
        : ["dubailand.gov.ae", "dubaipulse.gov.ae"];
    return (
      u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      domains.some((d) => u.hostname === d || u.hostname.endsWith("." + d))
    );
  } catch {
    return false;
  }
}
const validDate = (x: unknown) =>
  typeof x === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(x) &&
  !Number.isNaN(Date.parse(x)) &&
  new Date(x).toISOString().slice(0, 10) === x;
export function validMarketRecord(value: unknown): value is MarketRecord {
  if (!value || typeof value !== "object") return false;
  const v = value as MarketRecord;
  const listing =
    v.category === "sale-listing" || v.category === "rent-listing";
  return (
    typeof v.id === "string" &&
    v.id.length > 0 &&
    typeof v.building === "string" &&
    v.building.trim().length > 0 &&
    (v.unit === null || typeof v.unit === "string") &&
    Object.keys(marketLabels).includes(v.category) &&
    Number.isInteger(v.bedrooms) &&
    v.bedrooms >= 0 &&
    v.bedrooms <= 20 &&
    Number.isFinite(v.areaSqft) &&
    v.areaSqft > 0 &&
    Number.isFinite(v.amountAed) &&
    v.amountAed > 0 &&
    (v.reportedPricePerSqft === undefined ||
      (Number.isFinite(v.reportedPricePerSqft) &&
        v.reportedPricePerSqft > 0)) &&
    (v.category.startsWith("rent")
      ? v.rentalPeriod === "annual"
      : v.rentalPeriod === null) &&
    (v.finish === null || typeof v.finish === "string") &&
    ["furnished", "unfurnished", "unknown"].includes(v.furnishing) &&
    (v.source === "bayut" || v.source === "dld" || v.source === "user") &&
    (listing
      ? v.source === "bayut"
      : v.source === "dld" || v.source === "user") &&
    (v.source === "user"
      ? v.sourceUrl === null
      : typeof v.sourceUrl === "string" &&
        sourceUrlValid(v.source, v.sourceUrl)) &&
    (v.sourceRecordId === null || typeof v.sourceRecordId === "string") &&
    (listing
      ? v.transactionDate === null || validDate(v.transactionDate)
      : validDate(v.transactionDate) &&
        (v.source === "user" || !!v.sourceRecordId?.trim())) &&
    validDate(v.retrievedAt) &&
    v.retrievedAt <=
      new Date().toLocaleDateString("en-CA", {
        timeZone: "Europe/Amsterdam",
      }) &&
    (!v.transactionDate || v.transactionDate <= v.retrievedAt) &&
    ["unverified", "verified"].includes(v.verification) &&
    (v.active === undefined || typeof v.active === "boolean")
  );
}
export function mergeMarketRecords(
  existing: MarketRecord[],
  incoming: MarketRecord[],
) {
  const key = (v: MarketRecord) =>
    `${v.source}|${v.category}|${v.sourceRecordId || (v.sourceUrl ? new URL(v.sourceUrl).origin + new URL(v.sourceUrl).pathname : v.id)}`;
  const result = new Map(existing.map((v) => [key(v), v]));
  for (const v of incoming) {
    const old = result.get(key(v));
    result.set(key(v), old ? { ...v, id: old.id } : v);
  }
  return [...result.values()];
}
export function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const m = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[m] : (sorted[m - 1] + sorted[m]) / 2;
}
export function comparableRecords(records: MarketRecord[], building: string) {
  return records.filter(
    (v) =>
      v.building.trim().toLowerCase() === building.trim().toLowerCase() &&
      v.bedrooms === 1,
  );
}
export function transactionTrend(records: MarketRecord[]) {
  const months = new Map<string, number[]>();
  for (const v of records) {
    if (
      v.category !== "sale-transaction" ||
      (v.source !== "user" &&
        (v.source !== "dld" || v.verification !== "verified")) ||
      !v.transactionDate
    )
      continue;
    const month = v.transactionDate.slice(0, 7);
    months.set(month, [...(months.get(month) ?? []), v.amountAed / v.areaSqft]);
  }
  return [...months.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, values]) => ({
      month,
      price: median(values)!,
      count: values.length,
    }));
}

/** User-supplied snapshot. No DLD/Bayut record references or source URLs were supplied. */
export const marketSnapshotVersion = "user-transactions-2026-11-05";
const suppliedSales = [
  ["2026-11-02", "2007", 915, 1200000, 1311],
  ["2026-10-30", "508", 835, 1150000, 1377],
  ["2026-10-30", "2310", 909, 1150000, 1265],
  ["2026-10-30", "1715", 904, 1416199, 1567],
  ["2026-10-28", "516", 839, 1200000, 1431],
] as const;
const suppliedRents = [
  ["2026-11-03", "2407", 915, 95000],
  ["2026-11-02", "3010", 909, 88000],
  ["2026-11-02", "1215", 902, 75000],
  ["2026-11-02", "3007", 911, 80000],
  ["2026-10-29", "2608", 842, 80000],
] as const;
export const suppliedMarketRecords: MarketRecord[] = [
  ...suppliedSales.map(([date, unit, area, amount, reportedPricePerSqft]) => ({
    reportedPricePerSqft,
    date,
    unit,
    area,
    amount,
    rent: false,
  })),
  ...suppliedRents.map(([date, unit, area, amount]) => ({
    date,
    unit,
    area,
    amount,
    rent: true,
  })),
].map((v) => ({
  id: `user-20261105-${v.rent ? "rent" : "sale"}-${v.unit}`,
  building: "Binghatti Apex",
  unit: v.unit,
  category: v.rent ? "rent-transaction" : "sale-transaction",
  bedrooms: 1,
  areaSqft: v.area,
  amountAed: v.amount,
  ...("reportedPricePerSqft" in v
    ? { reportedPricePerSqft: v.reportedPricePerSqft }
    : {}),
  rentalPeriod: v.rent ? "annual" : null,
  finish: null,
  furnishing: "unknown",
  source: "user",
  sourceUrl: null,
  sourceRecordId: null,
  transactionDate: v.date,
  retrievedAt: "2026-11-05",
  verification: "unverified",
}));
