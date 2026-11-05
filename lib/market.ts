/** Future adapters must retain provenance; asking prices are not transactions. */
export type MarketRecord = {
  id: string;
  building: string;
  unit: string | null;
  category:
    "sale-listing" | "sale-transaction" | "rent-listing" | "rent-transaction";
  bedrooms: number;
  areaSqft: number;
  amountAed: number;
  rentalPeriod: "annual" | null;
  finish: string | null;
  furnishing: "furnished" | "unfurnished" | "unknown";
  source: "demo" | "bayut" | "dld";
  sourceUrl: string | null;
  sourceRecordId: string | null;
  transactionDate: string | null;
  retrievedAt: string | null;
  verification: "demonstration" | "unverified" | "verified";
};
export interface MarketProvider {
  name: string;
  load(building: string): Promise<MarketRecord[]>;
}
export const demoRecords: MarketRecord[] = [
  {
    id: "demo-sale-listing",
    unit: "Voorbeeld A",
    category: "sale-listing",
    areaSqft: 895,
    amountAed: 1350000,
    finish: "Premium",
    furnishing: "unfurnished",
    rentalPeriod: null,
  },
  {
    id: "demo-sale-transaction",
    unit: "Voorbeeld B",
    category: "sale-transaction",
    areaSqft: 930,
    amountAed: 1280000,
    finish: "Standaard",
    furnishing: "unfurnished",
    rentalPeriod: null,
  },
  {
    id: "demo-rent-listing",
    unit: "Voorbeeld C",
    category: "rent-listing",
    areaSqft: 905,
    amountAed: 108000,
    finish: "Premium",
    furnishing: "furnished",
    rentalPeriod: "annual",
  },
  {
    id: "demo-rent-transaction",
    unit: "Voorbeeld D",
    category: "rent-transaction",
    areaSqft: 920,
    amountAed: 99000,
    finish: "Standaard",
    furnishing: "furnished",
    rentalPeriod: "annual",
  },
].map((v) => ({
  ...v,
  building: "Binghatti Apex",
  bedrooms: 1,
  source: "demo",
  sourceUrl: null,
  sourceRecordId: null,
  transactionDate: null,
  retrievedAt: null,
  verification: "demonstration",
})) as MarketRecord[];
