"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlatformSelect } from "./platform-select";
import { ItemizePlaceholder } from "./itemize-placeholder";
import { calculate, type CalculationInput, type CalculationResult, type FilingStatus } from "@/lib/calculate";
import { saveInputs, loadInputs } from "@/lib/storage";

interface CalculatorFormProps {
  initialInputs?: CalculationInput | null;
  onResult: (result: CalculationResult, input: CalculationInput) => void;
}

export function CalculatorForm({ initialInputs, onResult }: CalculatorFormProps) {
  const t = useTranslations("form");

  const [earnings, setEarnings] = useState(initialInputs?.grossEarnings?.toString() ?? "");
  const [activeHours, setActiveHours] = useState(initialInputs?.activeHours?.toString() ?? "");
  const [totalHours, setTotalHours] = useState(initialInputs?.totalHours?.toString() ?? "");
  const [miles, setMiles] = useState(initialInputs?.totalMiles?.toString() ?? "");
  const [platforms, setPlatforms] = useState<string[]>(initialInputs?.platforms ?? []);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>(initialInputs?.filingStatus ?? "single");
  const [annualIncome, setAnnualIncome] = useState(initialInputs?.annualIncome?.toString() ?? "");
  const [optionalOpen, setOptionalOpen] = useState(false);

  useEffect(() => {
    if (!initialInputs) {
      const saved = loadInputs();
      if (saved) {
        setEarnings(saved.grossEarnings?.toString() ?? "");
        setActiveHours(saved.activeHours?.toString() ?? "");
        setTotalHours(saved.totalHours?.toString() ?? "");
        setMiles(saved.totalMiles?.toString() ?? "");
        setPlatforms(saved.platforms ?? []);
        if (saved.filingStatus) setFilingStatus(saved.filingStatus);
        if (saved.annualIncome) setAnnualIncome(saved.annualIncome.toString());
      }
    }
  }, [initialInputs]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const input: CalculationInput = {
      grossEarnings: parseFloat(earnings) || 0,
      activeHours: parseFloat(activeHours) || 0,
      totalHours: parseFloat(totalHours) || 0,
      totalMiles: parseFloat(miles) || 0,
      platforms,
      filingStatus,
      annualIncome: annualIncome ? parseFloat(annualIncome) : undefined,
    };

    const result = calculate(input);
    saveInputs(input);
    onResult(result, input);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
      <div className="space-y-2">
        <Label htmlFor="earnings">{t("earnings")}</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input
            id="earnings"
            type="number"
            step="0.01"
            min="0"
            placeholder={t("earningsPlaceholder")}
            value={earnings}
            onChange={(e) => setEarnings(e.target.value)}
            className="pl-7"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="activeHours">{t("activeHours")}</Label>
        <Input
          id="activeHours"
          type="number"
          step="0.25"
          min="0"
          placeholder={t("activeHoursPlaceholder")}
          value={activeHours}
          onChange={(e) => setActiveHours(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="totalHours">{t("totalHours")}</Label>
        <Input
          id="totalHours"
          type="number"
          step="0.25"
          min="0"
          placeholder={t("totalHoursPlaceholder")}
          value={totalHours}
          onChange={(e) => setTotalHours(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Label htmlFor="miles" className="cursor-help underline decoration-dotted">
                {t("miles")} ⓘ
              </Label>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{t("milesTooltip")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Input
          id="miles"
          type="number"
          step="0.1"
          min="0"
          placeholder={t("milesPlaceholder")}
          value={miles}
          onChange={(e) => setMiles(e.target.value)}
          required
        />
      </div>

      <PlatformSelect selected={platforms} onChange={setPlatforms} />

      <Collapsible open={optionalOpen} onOpenChange={setOptionalOpen}>
        <CollapsibleTrigger className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          {optionalOpen ? "▾" : "▸"} {t("optionalSection")}
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-3">
          <div className="space-y-2">
            <Label className="text-sm">{t("filingStatus")}</Label>
            <div className="flex gap-3">
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="radio"
                  name="filingStatus"
                  checked={filingStatus === "single"}
                  onChange={() => setFilingStatus("single")}
                />
                {t("single")}
              </label>
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="radio"
                  name="filingStatus"
                  checked={filingStatus === "married"}
                  onChange={() => setFilingStatus("married")}
                />
                {t("married")}
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="annualIncome">{t("annualIncome")}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="annualIncome"
                type="number"
                min="0"
                placeholder={t("annualIncomePlaceholder")}
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <ItemizePlaceholder />

      <Button type="submit" className="w-full text-lg py-6">
        {t("calculate")}
      </Button>
    </form>
  );
}
