"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { CalculatorForm } from "@/components/calculator-form";
import { ResultsDisplay } from "@/components/results-display";
import type { CalculationResult, CalculationInput } from "@/lib/calculate";

export default function Home() {
  const locale = useLocale();
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [lastInput, setLastInput] = useState<CalculationInput | null>(null);

  function handleResult(result: CalculationResult, input: CalculationInput) {
    setResult(result);
    setLastInput(input);
  }

  return (
    <main className="flex flex-col items-center gap-6 p-4 pb-16">
      <CalculatorForm onResult={handleResult} />
      {result && lastInput && (
        <ResultsDisplay result={result} input={lastInput} locale={locale} />
      )}
    </main>
  );
}
