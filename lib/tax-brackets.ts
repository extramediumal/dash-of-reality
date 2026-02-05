import { DEFAULT_INCOME_TAX_RATE } from "./constants";

type FilingStatus = "single" | "married";

const BRACKETS_2026: Record<FilingStatus, { min: number; rate: number }[]> = {
  single: [
    { min: 0, rate: 0.10 },
    { min: 11925, rate: 0.12 },
    { min: 48475, rate: 0.22 },
    { min: 103350, rate: 0.24 },
    { min: 197300, rate: 0.32 },
    { min: 250525, rate: 0.35 },
    { min: 626350, rate: 0.37 },
  ],
  married: [
    { min: 0, rate: 0.10 },
    { min: 23850, rate: 0.12 },
    { min: 96950, rate: 0.22 },
    { min: 206700, rate: 0.24 },
    { min: 394600, rate: 0.32 },
    { min: 501050, rate: 0.35 },
    { min: 751600, rate: 0.37 },
  ],
};

export function lookupIncomeTaxRate(
  annualIncome?: number,
  filingStatus?: FilingStatus | undefined
): number {
  if (annualIncome === undefined || filingStatus === undefined) {
    return DEFAULT_INCOME_TAX_RATE;
  }

  const brackets = BRACKETS_2026[filingStatus];
  let rate = brackets[0].rate;

  for (const bracket of brackets) {
    if (annualIncome >= bracket.min) {
      rate = bracket.rate;
    } else {
      break;
    }
  }

  return rate;
}
