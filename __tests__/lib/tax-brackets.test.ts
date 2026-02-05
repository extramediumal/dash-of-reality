import { describe, it, expect } from "vitest";
import { lookupIncomeTaxRate } from "@/lib/tax-brackets";

describe("lookupIncomeTaxRate", () => {
  it("returns 10% for single filer earning $10,000", () => {
    expect(lookupIncomeTaxRate(10000, "single")).toBe(0.10);
  });

  it("returns 12% for single filer earning $30,000", () => {
    expect(lookupIncomeTaxRate(30000, "single")).toBe(0.12);
  });

  it("returns 22% for single filer earning $60,000", () => {
    expect(lookupIncomeTaxRate(60000, "single")).toBe(0.22);
  });

  it("returns 12% for married filer earning $60,000", () => {
    expect(lookupIncomeTaxRate(60000, "married")).toBe(0.12);
  });

  it("returns 12% as default when no income provided", () => {
    expect(lookupIncomeTaxRate(undefined, undefined)).toBe(0.12);
  });
});
