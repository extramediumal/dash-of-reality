import type { CalculationInput } from "./calculate";

export function encodeInputs(input: CalculationInput): string {
  const json = JSON.stringify(input);
  return btoa(json);
}

export function decodeInputs(encoded: string): CalculationInput | null {
  try {
    const json = atob(encoded);
    return JSON.parse(json) as CalculationInput;
  } catch {
    return null;
  }
}
