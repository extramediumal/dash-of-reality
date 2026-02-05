import { describe, it, expect } from "vitest";
import { calculate, type CalculationInput, type CalculationResult } from "@/lib/calculate";

describe("calculate", () => {
  const baseInput: CalculationInput = {
    grossEarnings: 127.5,
    activeHours: 6,
    totalHours: 8,
    totalMiles: 85,
  };

  it("calculates mileage cost correctly", () => {
    const result = calculate(baseInput);
    expect(result.deductions.mileageCost).toBeCloseTo(61.625); // 85 * 0.725
  });

  it("calculates self-employment tax on net after mileage", () => {
    const result = calculate(baseInput);
    // netAfterMileage = 127.5 - 61.625 = 65.875
    // seTax = 65.875 * 0.1413 = 9.31
    expect(result.deductions.seTax).toBeCloseTo(9.31, 1);
  });

  it("uses default 12% income tax when no income provided", () => {
    const result = calculate(baseInput);
    // incomeTax = 65.875 * 0.12 = 7.905
    expect(result.deductions.incomeTax).toBeCloseTo(7.905, 1);
  });

  it("calculates actual hourly rate based on total hours", () => {
    const result = calculate(baseInput);
    // net = 127.5 - 61.625 - 9.31 - 7.905 = 48.66
    // hourly = 48.66 / 8 = 6.08
    expect(result.actualHourlyRate).toBeCloseTo(6.08, 0);
  });

  it("calculates active hourly rate based on active hours", () => {
    const result = calculate(baseInput);
    expect(result.activeHourlyRate).toBeGreaterThan(result.actualHourlyRate);
  });

  it("calculates W-2 equivalent", () => {
    const result = calculate(baseInput);
    expect(result.w2Equivalent).toBeCloseTo(result.actualHourlyRate * 0.807, 2);
  });

  it("returns green when rate >= 1.5x min wage", () => {
    const highInput = { ...baseInput, grossEarnings: 500 };
    const result = calculate(highInput);
    expect(result.healthIndicator).toBe("green");
  });

  it("returns yellow when rate >= min wage but < 1.5x", () => {
    const midInput = { ...baseInput, grossEarnings: 150, totalMiles: 60 };
    const result = calculate(midInput);
    expect(result.healthIndicator).toBe("yellow");
  });

  it("returns red when rate < min wage", () => {
    const lowInput = { ...baseInput, grossEarnings: 50 };
    const result = calculate(lowInput);
    expect(result.healthIndicator).toBe("red");
  });

  it("uses provided tax bracket when annual income given", () => {
    const withIncome = { ...baseInput, annualIncome: 60000, filingStatus: "single" as const };
    const result = calculate(withIncome);
    // 22% bracket instead of 12%
    expect(result.deductions.incomeTax).toBeGreaterThan(
      calculate(baseInput).deductions.incomeTax
    );
  });

  it("handles zero miles (no mileage deduction)", () => {
    const noMiles = { ...baseInput, totalMiles: 0 };
    const result = calculate(noMiles);
    expect(result.deductions.mileageCost).toBe(0);
  });
});
