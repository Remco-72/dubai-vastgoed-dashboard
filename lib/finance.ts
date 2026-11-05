import {
  validMarketRecord,
  suppliedMarketRecords,
  marketSnapshotVersion,
  mergeMarketRecords,
  type MarketRecord,
} from "./market.ts";
export type Property = {
  id: string;
  project: string;
  unit: string;
  location: string;
  area: number;
  purchase: number;
  rent: number;
  start: string;
  months: number;
  market: number | null;
  finish?: string;
};
export type Payment = {
  paid: boolean;
  received: string;
  receivedAmount?: number;
};
export type Valuation = { id: string; date: string; amount: number };
export type CostKey =
  | "service"
  | "maintenance"
  | "insurance"
  | "management"
  | "other"
  | "purchase"
  | "furniture";
export type Data = {
  property: Property;
  payments: Payment[];
  costs: Record<CostKey, number | null>;
  valuations: Valuation[];
  market?: MarketRecord[];
  marketSeedVersion?: string;
};
export const initial: Data = {
  property: {
    id: "apex-1107",
    project: "Binghatti Apex",
    unit: "1107",
    location: "Jumeirah Village Circle, Dubai",
    area: 912,
    purchase: 1200000,
    rent: 8500,
    start: "2026-11-10",
    months: 9,
    market: null,
    finish: "Premium Plus",
  },
  payments: Array.from({ length: 9 }, () => ({ paid: false, received: "" })),
  costs: {
    service: null,
    maintenance: null,
    insurance: null,
    management: null,
    other: null,
    purchase: null,
    furniture: null,
  },
  valuations: [],
  market: suppliedMarketRecords,
  marketSeedVersion: marketSnapshotVersion,
};
export function dueDate(start: string, index: number) {
  const [y, m, d] = start.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + index, 1));
  const last = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
  date.setUTCDate(Math.min(d, last));
  return date.toISOString().slice(0, 10);
}
/** First calendar month includes the start date and its final day. Later terms stay unchanged. */
export function installmentAmount(p: Property, index: number) {
  if (index !== 0) return p.rent;
  const [year, month, day] = p.start.split("-").map(Number);
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Math.round(((p.rent * (days - day + 1)) / days) * 100) / 100;
}
/** Preserve actual receipts from the previous full-month ledger during upgrade/import. */
export function preserveReceipts(data: Data): Data {
  return {
    ...data,
    payments: data.payments.map((payment) =>
      payment.paid && payment.receivedAmount === undefined
        ? { ...payment, receivedAmount: data.property.rent }
        : payment,
    ),
  };
}
export function calculate(data: Data) {
  const p = data.property;
  const contract = data.payments.reduce(
    (sum, _, i) => sum + installmentAmount(p, i),
    0,
  );
  const annual = p.rent * 12;
  const received = data.payments.reduce(
    (sum, x, i) =>
      sum + (x.paid ? (x.receivedAmount ?? installmentAmount(p, i)) : 0),
    0,
  );
  const operating = [
    "service",
    "maintenance",
    "insurance",
    "management",
    "other",
  ] as const;
  const ready = Object.values(data.costs).every((x) => x !== null);
  const expenses = operating.reduce((s, k) => s + (data.costs[k] ?? 0), 0);
  const investment =
    p.purchase + (data.costs.purchase ?? 0) + (data.costs.furniture ?? 0);
  return {
    contract,
    annual,
    received,
    outstanding: contract - received,
    gross: (annual / p.purchase) * 100,
    expenses,
    investment,
    net: ready ? ((annual - expenses) / investment) * 100 : null,
  };
}
export function validData(value: unknown): value is Data {
  if (!value || typeof value !== "object") return false;
  const d = value as Data;
  const nonneg = (x: unknown) =>
    typeof x === "number" && Number.isFinite(x) && x >= 0;
  const date = (x: unknown) =>
    typeof x === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(x) &&
    !Number.isNaN(Date.parse(x)) &&
    new Date(x).toISOString().slice(0, 10) === x;
  return (
    !!d.property &&
    ["project", "unit", "location", "id"].every(
      (k) => typeof d.property[k as keyof Property] === "string",
    ) &&
    (d.property.finish === undefined ||
      (typeof d.property.finish === "string" &&
        d.property.finish.length <= 80)) &&
    nonneg(d.property.purchase) &&
    d.property.purchase > 0 &&
    nonneg(d.property.rent) &&
    nonneg(d.property.area) &&
    d.property.area > 0 &&
    Number.isInteger(d.property.months) &&
    d.property.months > 0 &&
    d.property.months <= 120 &&
    date(d.property.start) &&
    (d.property.market === null || nonneg(d.property.market)) &&
    Array.isArray(d.payments) &&
    d.payments.length === d.property.months &&
    d.payments.every(
      (x) =>
        !!x &&
        typeof x === "object" &&
        typeof x.paid === "boolean" &&
        typeof x.received === "string" &&
        (x.receivedAmount === undefined || nonneg(x.receivedAmount)) &&
        (x.paid ? date(x.received) : x.received === ""),
    ) &&
    !!d.costs &&
    Object.keys(initial.costs).every(
      (k) => d.costs[k as CostKey] === null || nonneg(d.costs[k as CostKey]),
    ) &&
    (d.marketSeedVersion === undefined ||
      typeof d.marketSeedVersion === "string") &&
    (d.market === undefined ||
      (Array.isArray(d.market) && d.market.every(validMarketRecord))) &&
    Array.isArray(d.valuations) &&
    d.valuations.every(
      (x) =>
        !!x &&
        typeof x === "object" &&
        typeof x.id === "string" &&
        date(x.date) &&
        nonneg(x.amount) &&
        x.amount > 0,
    )
  );
}

export function contractEnd(start: string, months: number) {
  const end = new Date(dueDate(start, months) + "T12:00:00Z");
  end.setUTCDate(end.getUTCDate() - 1);
  return end.toISOString().slice(0, 10);
}

export function applyMarketSnapshot(data: Data): Data {
  if (
    data.property.id === initial.property.id &&
    data.property.finish === undefined
  )
    data = {
      ...data,
      property: { ...data.property, finish: initial.property.finish },
    };
  if (data.marketSeedVersion === marketSnapshotVersion) return data;
  return {
    ...data,
    market: mergeMarketRecords(data.market ?? [], suppliedMarketRecords),
    marketSeedVersion: marketSnapshotVersion,
  };
}
