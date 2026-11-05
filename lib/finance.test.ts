import { test } from "node:test";
import assert from "node:assert/strict";
import {
  initial,
  calculate,
  dueDate,
  contractEnd,
  validData,
} from "./finance.ts";
test("contract, extrapolation and no assumed receipts", () => {
  const f = calculate(initial);
  assert.equal(f.contract, 76500);
  assert.equal(f.annual, 102000);
  assert.equal(f.gross, 8.5);
  assert.equal(f.received, 0);
  assert.equal(f.outstanding, 76500);
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
  assert.equal(f.received, 8500);
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
