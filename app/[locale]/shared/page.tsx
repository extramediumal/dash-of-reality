"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { CalculatorForm } from "@/components/calculator-form";
import { ResultsDisplay } from "@/components/results-display";
import { decodeInputs } from "@/lib/sharing";
import { calculate, type CalculationResult, type CalculationInput } from "@/lib/calculate";

function SharedContent() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [lastInput, setLastInput] = useState<CalculationInput | null>(null);
  const [initialInputs, setInitialInputs] = useState<CalculationInput | null>(null);

  useEffect(() => {
    const encoded = searchParams.get("d");
    if (encoded) {
      const decoded = decodeInputs(encoded);
      if (decoded) {
        setInitialInputs(decoded);
        const result = calculate(decoded);
        setResult(result);
        setLastInput(decoded);
      }
    }
  }, [searchParams]);

  function handleResult(result: CalculationResult, input: CalculationInput) {
    setResult(result);
    setLastInput(input);
  }

  return (
    <>
      <CalculatorForm initialInputs={initialInputs} onResult={handleResult} />
      {result && lastInput && (
        <ResultsDisplay result={result} input={lastInput} locale={locale} />
      )}
    </>
  );
}

export default function SharedPage() {
  return (
    <main className="flex flex-col items-center gap-6 p-4 pb-16">
      <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
        <SharedContent />
      </Suspense>
    </main>
  );
}
