import {
  IRS_MILEAGE_RATE,
  SE_TAX_RATE,
  FEDERAL_MIN_WAGE,
  W2_EQUIVALENCE_FACTOR,
} from "./constants";
import { lookupIncomeTaxRate } from "./tax-brackets";

export type FilingStatus = "single" | "married";

export interface CalculationInput {
  grossEarnings: number;
  activeHours: number;
  totalHours: number;
  totalMiles: number;
  filingStatus?: FilingStatus;
  annualIncome?: number;
  platforms?: string[];
}

export interface CalculationResult {
  actualHourlyRate: number;
  activeHourlyRate: number;
  grossHourlyRate: number;
  w2Equivalent: number;
  netEarnings: number;
  deductions: {
    mileageCost: number;
    seTax: number;
    incomeTax: number;
    total: number;
  };
  healthIndicator: "green" | "yellow" | "red";
}

export function calculate(input: CalculationInput): CalculationResult {
  const { grossEarnings, activeHours, totalHours, totalMiles, filingStatus, annualIncome } = input;

  const mileageCost = totalMiles * IRS_MILEAGE_RATE;
  const netAfterMileage = Math.max(grossEarnings - mileageCost, 0);
  const seTax = netAfterMileage * SE_TAX_RATE;
  const incomeTaxRate = lookupIncomeTaxRate(annualIncome, filingStatus);
  const incomeTax = netAfterMileage * incomeTaxRate;
  const totalDeductions = mileageCost + seTax + incomeTax;
  const netEarnings = Math.max(grossEarnings - totalDeductions, 0);

  const actualHourlyRate = totalHours > 0 ? netEarnings / totalHours : 0;
  const activeHourlyRate = activeHours > 0 ? netEarnings / activeHours : 0;
  const grossHourlyRate = totalHours > 0 ? grossEarnings / totalHours : 0;
  const w2Equivalent = actualHourlyRate * W2_EQUIVALENCE_FACTOR;

  let healthIndicator: "green" | "yellow" | "red";
  if (actualHourlyRate >= FEDERAL_MIN_WAGE * 1.5) {
    healthIndicator = "green";
  } else if (actualHourlyRate >= FEDERAL_MIN_WAGE) {
    healthIndicator = "yellow";
  } else {
    healthIndicator = "red";
  }

  return {
    actualHourlyRate,
    activeHourlyRate,
    grossHourlyRate,
    w2Equivalent,
    netEarnings,
    deductions: {
      mileageCost,
      seTax,
      incomeTax,
      total: totalDeductions,
    },
    healthIndicator,
  };
}
