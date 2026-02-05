import { describe, it, expect } from "vitest";
import { encodeInputs, decodeInputs } from "@/lib/sharing";
import type { CalculationInput } from "@/lib/calculate";

describe("sharing", () => {
  const input: CalculationInput = {
    grossEarnings: 127.5,
    activeHours: 6,
    totalHours: 8,
    totalMiles: 85,
    platforms: ["doordash", "ubereats"],
  };

  it("round-trips inputs through encode/decode", () => {
    const encoded = encodeInputs(input);
    const decoded = decodeInputs(encoded);
    expect(decoded).toEqual(input);
  });

  it("returns a non-empty string", () => {
    const encoded = encodeInputs(input);
    expect(encoded.length).toBeGreaterThan(0);
  });

  it("returns null for invalid encoded string", () => {
    const decoded = decodeInputs("not-valid-base64!!!");
    expect(decoded).toBeNull();
  });
});
