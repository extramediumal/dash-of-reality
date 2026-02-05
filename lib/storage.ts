import type { CalculationInput } from "./calculate";

const STORAGE_KEY = "dash-of-reality-inputs";

export function saveInputs(input: CalculationInput): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(input));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function loadInputs(): CalculationInput | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CalculationInput;
  } catch {
    return null;
  }
}
