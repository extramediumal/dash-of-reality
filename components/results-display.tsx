"use client";

import { useTranslations } from "next-intl";
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
import { Card, CardContent } from "@/components/ui/card";
import { ShareButton } from "./share-button";
import type { CalculationResult, CalculationInput } from "@/lib/calculate";
import { FEDERAL_MIN_WAGE } from "@/lib/constants";

interface ResultsDisplayProps {
  result: CalculationResult;
  input: CalculationInput;
  locale: string;
}

function formatMoney(n: number): string {
  return "$" + n.toFixed(2);
}

const healthColors = {
  green: { bg: "bg-green-500", text: "text-green-600" },
  yellow: { bg: "bg-yellow-500", text: "text-yellow-600" },
  red: { bg: "bg-red-500", text: "text-red-600" },
};

export function ResultsDisplay({ result, input, locale }: ResultsDisplayProps) {
  const t = useTranslations("results");
  const colors = healthColors[result.healthIndicator];

  const barPercent = result.grossHourlyRate > 0
    ? Math.round((result.actualHourlyRate / result.grossHourlyRate) * 100)
    : 0;

  const incomeTaxPercent = Math.round(result.incomeTaxRate * 100);

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-6 space-y-4">
        {/* Big number */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{t("youReallyMade")}</p>
          <p className={`text-5xl font-bold ${colors.text}`}>
            {formatMoney(result.actualHourlyRate)}
            <span className="text-2xl">{t("perHour")}</span>
          </p>
        </div>

        {/* Gross-to-net bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatMoney(result.grossHourlyRate)}/hr</span>
            <span>{formatMoney(result.actualHourlyRate)}/hr</span>
          </div>
          <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${colors.bg}`}
              style={{ width: `${barPercent}%` }}
            />
          </div>
        </div>

        {/* Min wage comparison */}
        <p className="text-sm text-center text-muted-foreground">
          {t("minWage", { wage: formatMoney(FEDERAL_MIN_WAGE) })}
        </p>

        {/* W-2 equivalent */}
        <div className="text-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="cursor-help">
                <p className="text-sm text-muted-foreground">
                  {t("w2Equivalent")}{" "}
                  <span className="font-semibold text-foreground">
                    {formatMoney(result.w2Equivalent)}/hr
                  </span>
                  {" "}ⓘ
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{t("w2Tooltip")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Expandable breakdown */}
        <Collapsible>
          <CollapsibleTrigger className="w-full text-sm text-muted-foreground hover:text-foreground text-center transition-colors">
            {t("breakdown")} ▾
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>{t("mileageCost", { miles: input.totalMiles })}</span>
              <span className="text-red-500">-{formatMoney(result.deductions.mileageCost)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("seTax")}</span>
              <span className="text-red-500">-{formatMoney(result.deductions.seTax)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("incomeTax", { rate: incomeTaxPercent })}</span>
              <span className="text-red-500">-{formatMoney(result.deductions.incomeTax)}</span>
            </div>
            <hr />
            <div className="flex justify-between font-semibold">
              <span>{t("kept")}</span>
              <span>{formatMoney(result.netEarnings)}</span>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Active hour rate */}
        <p className="text-xs text-center text-muted-foreground">
          {t("activeRate")}: {formatMoney(result.activeHourlyRate)}/hr
        </p>

        {/* Share */}
        <ShareButton input={input} locale={locale} />
      </CardContent>
    </Card>
  );
}
