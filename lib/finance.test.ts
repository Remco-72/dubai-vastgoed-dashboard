import { test } from "node:test";
import assert from "node:assert/strict";
import {
  initial,
  calculate,
  installmentAmount,
  preserveReceipts,
  dueDate,
  contractEnd,
  validData,
} from "./finance.ts";
test("contract, extrapolation and no assumed receipts", () => {
  const f = calculate(initial);
  assert.equal(f.contract, 73950);
  assert.equal(f.annual, 102000);
  assert.equal(f.gross, 8.5);
  assert.equal(f.received, 0);
  assert.equal(f.outstanding, 73950);
  assert.equal(f.net, null);
});
test("confirmed receipt and full-cost net yield", () => {
  const d = structuredClone(initial);
  d.payments[0] = { paid: true, received: "2026-11-10" };
  d.costs = {
    service: 12000,
    maintenance: 2000,
    insurance: 1000,
    management: 5000,
    other: 0,
    purchase: 60000,
    furniture: 20000,
  };
  const f = calculate(d);
  assert.equal(f.received, 5950);
  assert.equal(f.outstanding, 68000);
  assert.equal(f.net, (82000 / 1280000) * 100);
  assert.ok(validData(d));
});
test("dates cross years and clamp month ends", () => {
  assert.equal(dueDate(initial.property.start, 8), "2027-07-10");
  assert.equal(dueDate("2027-01-31", 1), "2027-02-28");
});
test("reject malformed saved or imported financial data", () => {
  assert.ok(validData(initial));
  assert.equal(validData({}), false);
  const d = structuredClone(initial);
  d.property.purchase = 0;
  assert.equal(validData(d), false);
});

test("contract ends the day before next period begins", () =>
  assert.equal(contractEnd("2026-11-10", 9), "2027-08-09"));

test("invalid dates and malformed payment entries are rejected", () => {
  const d = structuredClone(initial);
  d.property.start = "2026-02-31";
  assert.equal(validData(d), false);
  const payload = {
    ...initial,
    payments: [null, ...initial.payments.slice(1)],
  };
  assert.equal(validData(payload), false);
});

test("November 10–30 is 21 inclusive days, subsequent installments remain full", () => {
  assert.equal(installmentAmount(initial.property, 0), 5950);
  assert.equal(installmentAmount(initial.property, 1), 8500);
  assert.equal(calculate(initial).contract, 73950);
  const p = { ...initial.property, start: "2028-02-10", rent: 2900 };
  assert.equal(installmentAmount(p, 0), 2000);
});
test("legacy confirmed receipts survive migration while outstanding is corrected", () => {
  const d = structuredClone(initial);
  d.payments[0] = { paid: true, received: "2026-11-10" };
  const migrated = preserveReceipts(d);
  assert.equal(calculate(migrated).received, 8500);
  assert.equal(calculate(migrated).outstanding, 65450);
  assert.deepEqual(preserveReceipts(migrated), migrated);
  assert.ok(validData(migrated));
});

test("Premium Plus is retained and safely added to older local records", async () => {
  const { applyMarketSnapshot } = await import("./finance.ts");
  assert.equal(initial.property.finish, "Premium Plus");
  const old = structuredClone(initial);
  delete old.property.finish;
  old.property.market = 1300000;
  const updated = applyMarketSnapshot(old);
  assert.equal(updated.property.finish, "Premium Plus");
  assert.equal(updated.property.market, 1300000);
  assert.deepEqual(updated.payments, old.payments);
  assert.ok(validData(updated));
  assert.deepEqual(applyMarketSnapshot(updated), updated);
});
