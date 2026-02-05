import { describe, it, expect, beforeEach } from "vitest";
import { saveInputs, loadInputs } from "@/lib/storage";
import type { CalculationInput } from "@/lib/calculate";

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const input: CalculationInput = {
    grossEarnings: 127.5,
    activeHours: 6,
    totalHours: 8,
    totalMiles: 85,
  };

  it("saves and loads inputs", () => {
    saveInputs(input);
    expect(loadInputs()).toEqual(input);
  });

  it("returns null when nothing saved", () => {
    expect(loadInputs()).toBeNull();
  });
});
