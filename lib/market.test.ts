import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validMarketRecord,
  sourceUrlValid,
  mergeMarketRecords,
  transactionTrend,
  comparableRecords,
  median,
  type MarketRecord,
} from "./market.ts";
const fixture: MarketRecord = {
  id: "test-only",
  building: "Binghatti Apex",
  unit: null,
  category: "sale-transaction",
  bedrooms: 1,
  areaSqft: 900,
  amountAed: 1200000,
  rentalPeriod: null,
  finish: null,
  furnishing: "unknown",
  source: "dld",
  sourceUrl: "https://dubailand.gov.ae/",
  sourceRecordId: "test-reference",
  transactionDate: "2026-10-01",
  retrievedAt: "2026-11-01",
  verification: "verified",
};
test("source provenance prevents fake or unsafe links and category mixing", () => {
  assert.ok(validMarketRecord(fixture));
  for (const patch of [
    { source: "demo" },
    { sourceUrl: "javascript:alert(1)" },
    { sourceUrl: "https://dubailand.gov.ae.fake.example/" },
    { sourceRecordId: null },
    { areaSqft: 0 },
    { category: "sale-listing" },
    { transactionDate: "2026-02-31" },
    { retrievedAt: "2025-01-01" },
  ])
    assert.equal(validMarketRecord({ ...fixture, ...patch }), false);
  assert.equal(
    sourceUrlValid("bayut", "https://www.bayut.com/property/details-test.html"),
    true,
  );
  assert.equal(sourceUrlValid("bayut", "https://dubailand.gov.ae/"), false);
});
test("only comparable controlled DLD sales determine transaction trend", () => {
  const rows = [
    fixture,
    { ...fixture, id: "test-2", amountAed: 1500000 },
    {
      ...fixture,
      id: "test-unverified",
      verification: "unverified" as const,
      amountAed: 9000000,
    },
    {
      ...fixture,
      id: "test-listing",
      source: "bayut" as const,
      category: "sale-listing" as const,
      amountAed: 9000000,
    },
    { ...fixture, id: "other-building", building: "Other building" },
  ];
  const trend = transactionTrend(comparableRecords(rows, "Binghatti Apex"));
  assert.equal(trend.length, 1);
  assert.equal(trend[0].count, 2);
  assert.equal(trend[0].price, 1500);
});
test("reimport updates source reference without duplicating or changing stable ID", () => {
  const rows = mergeMarketRecords(
    [fixture],
    [{ ...fixture, id: "new-id", amountAed: 1300000 }],
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0].id, fixture.id);
  assert.equal(rows[0].amountAed, 1300000);
  assert.equal(median([]), null);
});

test("supplied snapshot retains all ten exact transactions and is not labelled DLD-verified", async () => {
  const { suppliedMarketRecords } = await import("./market.ts");
  assert.equal(suppliedMarketRecords.length, 10);
  assert.ok(suppliedMarketRecords.every(validMarketRecord));
  const sales = suppliedMarketRecords.filter(
      (v) => v.category === "sale-transaction",
    ),
    rents = suppliedMarketRecords.filter(
      (v) => v.category === "rent-transaction",
    );
  assert.equal(sales.length, 5);
  assert.equal(sales.find((v) => v.unit === "516")?.reportedPricePerSqft, 1431);
  assert.equal(rents.length, 5);
  assert.equal(sales.find((v) => v.unit === "1715")?.amountAed, 1416199);
  assert.equal(
    median(sales.map((v) => v.amountAed / v.areaSqft)),
    1150000 / 835,
  );
  assert.equal(median(rents.map((v) => v.amountAed)), 80000);
  assert.ok(
    suppliedMarketRecords.every(
      (v) =>
        v.source === "user" &&
        v.verification === "unverified" &&
        v.sourceUrl === null,
    ),
  );
});
test("snapshot migration preserves existing records and respects subsequent deletions", async () => {
  const { initial, applyMarketSnapshot, validData } =
    await import("./finance.ts");
  const d = {
    ...structuredClone(initial),
    market: [fixture],
    marketSeedVersion: undefined,
  };
  const updated = applyMarketSnapshot(d);
  assert.equal(updated.market?.length, 11);
  assert.ok(validData(updated));
  const edited = {
    ...updated,
    market: updated.market!.filter((v) => v.id !== fixture.id),
  };
  assert.deepEqual(applyMarketSnapshot(edited), edited);
  assert.equal(edited.market?.length, 10);
});
