# Dash of Reality — MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a mobile-first gig driver profit calculator with EN/ES support, shareable results, and localStorage persistence.

**Architecture:** Next.js App Router with SSG. All calculation logic is client-side in a pure function. i18n via next-intl with `/en/` and `/es/` route prefixes. shadcn/ui components styled with Tailwind. No backend.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, next-intl, Vitest

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `app/layout.tsx`, `.gitignore`

**Step 1: Scaffold Next.js project**

Run from `C:\Users\alhar\Projects\dash-of-reality`:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src=no --import-alias="@/*" --use-npm
```

Accept overwriting existing files if prompted. This creates the base Next.js + Tailwind project.

**Step 2: Install dependencies**

```bash
npm install next-intl
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

**Step 3: Initialize shadcn/ui**

```bash
npx shadcn@latest init -d
```

When prompted, select defaults (New York style, Zinc color, CSS variables: yes).

**Step 4: Add shadcn components we need**

```bash
npx shadcn@latest add button input card checkbox collapsible badge tooltip
```

**Step 5: Create Vitest config**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

Create `vitest.setup.ts`:

```typescript
import "@testing-library/jest-dom/vitest";
```

**Step 6: Add test script to package.json**

Add to `scripts`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 7: Verify setup**

```bash
npm run build
```

Expected: Build succeeds with default Next.js page.

**Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js project with Tailwind, shadcn/ui, next-intl, Vitest"
```

---

### Task 2: Constants and Tax Bracket Lookup

**Files:**
- Create: `lib/constants.ts`
- Create: `lib/tax-brackets.ts`
- Create: `__tests__/lib/tax-brackets.test.ts`

**Step 1: Write the failing test**

Create `__tests__/lib/tax-brackets.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { lookupIncomeTaxRate } from "@/lib/tax-brackets";

describe("lookupIncomeTaxRate", () => {
  it("returns 10% for single filer earning $10,000", () => {
    expect(lookupIncomeTaxRate(10000, "single")).toBe(0.10);
  });

  it("returns 12% for single filer earning $30,000", () => {
    expect(lookupIncomeTaxRate(30000, "single")).toBe(0.12);
  });

  it("returns 22% for single filer earning $60,000", () => {
    expect(lookupIncomeTaxRate(60000, "single")).toBe(0.22);
  });

  it("returns 12% for married filer earning $60,000", () => {
    expect(lookupIncomeTaxRate(60000, "married")).toBe(0.12);
  });

  it("returns 12% as default when no income provided", () => {
    expect(lookupIncomeTaxRate(undefined, undefined)).toBe(0.12);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npx vitest run __tests__/lib/tax-brackets.test.ts
```

Expected: FAIL — module not found.

**Step 3: Write constants**

Create `lib/constants.ts`:

```typescript
export const IRS_MILEAGE_RATE = 0.725;
export const SE_TAX_RATE = 0.1413;
export const DEFAULT_INCOME_TAX_RATE = 0.12;
export const FEDERAL_MIN_WAGE = 7.25;
export const W2_EQUIVALENCE_FACTOR = 0.807;
```

**Step 4: Write tax bracket lookup**

Create `lib/tax-brackets.ts`:

```typescript
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
```

**Step 5: Run test to verify it passes**

```bash
npx vitest run __tests__/lib/tax-brackets.test.ts
```

Expected: All 5 tests PASS.

**Step 6: Commit**

```bash
git add lib/constants.ts lib/tax-brackets.ts __tests__/lib/tax-brackets.test.ts
git commit -m "feat: add constants and tax bracket lookup with tests"
```

---

### Task 3: Core Calculation Function

**Files:**
- Create: `lib/calculate.ts`
- Create: `__tests__/lib/calculate.test.ts`

**Step 1: Write the failing tests**

Create `__tests__/lib/calculate.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { calculate, type CalculationInput, type CalculationResult } from "@/lib/calculate";

describe("calculate", () => {
  const baseInput: CalculationInput = {
    grossEarnings: 127.5,
    activeHours: 6,
    totalHours: 8,
    totalMiles: 85,
  };

  it("calculates mileage cost correctly", () => {
    const result = calculate(baseInput);
    expect(result.deductions.mileageCost).toBeCloseTo(61.625); // 85 * 0.725
  });

  it("calculates self-employment tax on net after mileage", () => {
    const result = calculate(baseInput);
    // netAfterMileage = 127.5 - 61.625 = 65.875
    // seTax = 65.875 * 0.1413 = 9.31
    expect(result.deductions.seTax).toBeCloseTo(9.31, 1);
  });

  it("uses default 12% income tax when no income provided", () => {
    const result = calculate(baseInput);
    // incomeTax = 65.875 * 0.12 = 7.905
    expect(result.deductions.incomeTax).toBeCloseTo(7.905, 1);
  });

  it("calculates actual hourly rate based on total hours", () => {
    const result = calculate(baseInput);
    // net = 127.5 - 61.625 - 9.31 - 7.905 = 48.66
    // hourly = 48.66 / 8 = 6.08
    expect(result.actualHourlyRate).toBeCloseTo(6.08, 0);
  });

  it("calculates active hourly rate based on active hours", () => {
    const result = calculate(baseInput);
    expect(result.activeHourlyRate).toBeGreaterThan(result.actualHourlyRate);
  });

  it("calculates W-2 equivalent", () => {
    const result = calculate(baseInput);
    expect(result.w2Equivalent).toBeCloseTo(result.actualHourlyRate * 0.807, 2);
  });

  it("returns green when rate >= 1.5x min wage", () => {
    const highInput = { ...baseInput, grossEarnings: 500 };
    const result = calculate(highInput);
    expect(result.healthIndicator).toBe("green");
  });

  it("returns yellow when rate >= min wage but < 1.5x", () => {
    const midInput = { ...baseInput, grossEarnings: 150, totalMiles: 40 };
    const result = calculate(midInput);
    expect(result.healthIndicator).toBe("yellow");
  });

  it("returns red when rate < min wage", () => {
    const lowInput = { ...baseInput, grossEarnings: 50 };
    const result = calculate(lowInput);
    expect(result.healthIndicator).toBe("red");
  });

  it("uses provided tax bracket when annual income given", () => {
    const withIncome = { ...baseInput, annualIncome: 60000, filingStatus: "single" as const };
    const result = calculate(withIncome);
    // 22% bracket instead of 12%
    expect(result.deductions.incomeTax).toBeGreaterThan(
      calculate(baseInput).deductions.incomeTax
    );
  });

  it("handles zero miles (no mileage deduction)", () => {
    const noMiles = { ...baseInput, totalMiles: 0 };
    const result = calculate(noMiles);
    expect(result.deductions.mileageCost).toBe(0);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npx vitest run __tests__/lib/calculate.test.ts
```

Expected: FAIL — module not found.

**Step 3: Write the calculation function**

Create `lib/calculate.ts`:

```typescript
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
```

**Step 4: Run test to verify it passes**

```bash
npx vitest run __tests__/lib/calculate.test.ts
```

Expected: All 11 tests PASS.

**Step 5: Commit**

```bash
git add lib/calculate.ts __tests__/lib/calculate.test.ts
git commit -m "feat: add core calculation function with tests"
```

---

### Task 4: i18n Setup

**Files:**
- Create: `messages/en.json`
- Create: `messages/es.json`
- Create: `lib/i18n.ts`
- Create: `i18n/request.ts`
- Create: `i18n/routing.ts`
- Modify: `next.config.ts`
- Modify: `app/layout.tsx`
- Create: `app/[locale]/layout.tsx`
- Create: `app/[locale]/page.tsx`
- Create: `middleware.ts`

**Step 1: Create English translation file**

Create `messages/en.json`:

```json
{
  "meta": {
    "title": "Gig Driver Profit Calculator — What You Really Make",
    "description": "Find out what you actually earn per hour after expenses, taxes, and mileage. Free calculator for DoorDash, Uber Eats, Instacart drivers."
  },
  "header": {
    "title": "Dash of Reality"
  },
  "form": {
    "earnings": "What did the app say you earned?",
    "earningsPlaceholder": "127.50",
    "activeHours": "Hours on deliveries",
    "activeHoursPlaceholder": "6",
    "totalHours": "Total hours (including waiting)",
    "totalHoursPlaceholder": "8",
    "miles": "Miles you drove",
    "milesPlaceholder": "85",
    "milesTooltip": "Include driving to restaurants and back to your area, not just delivery miles",
    "platforms": "Which apps?",
    "optionalSection": "Tax details (optional)",
    "filingStatus": "Filing status",
    "single": "Single",
    "married": "Married",
    "annualIncome": "Rough annual income",
    "annualIncomePlaceholder": "30000",
    "calculate": "Calculate",
    "itemizeTitle": "Advanced: Itemize your costs",
    "comingSoon": "Coming soon"
  },
  "results": {
    "youReallyMade": "You really made",
    "perHour": "/hr",
    "minWage": "Minimum wage: {wage}/hr",
    "w2Equivalent": "At a regular job, this equals",
    "w2Tooltip": "A regular job also pays part of your taxes and may include benefits",
    "breakdown": "See the breakdown",
    "mileageCost": "Mileage ({miles} mi × $0.725)",
    "seTax": "Self-employment tax (14.13%)",
    "incomeTax": "Estimated income tax ({rate}%)",
    "kept": "What you kept",
    "activeRate": "Per delivery hour",
    "share": "Share my results",
    "linkCopied": "Link copied!"
  }
}
```

**Step 2: Create Spanish translation file**

Create `messages/es.json`:

```json
{
  "meta": {
    "title": "Calculadora de Ganancias para Repartidores",
    "description": "Descubre cuanto ganas realmente por hora despues de gastos, impuestos y millaje. Calculadora gratis para repartidores de DoorDash, Uber Eats, Instacart."
  },
  "header": {
    "title": "Dash of Reality"
  },
  "form": {
    "earnings": "Cuanto dice la app que ganaste?",
    "earningsPlaceholder": "127.50",
    "activeHours": "Horas en entregas",
    "activeHoursPlaceholder": "6",
    "totalHours": "Horas totales (incluyendo espera)",
    "totalHoursPlaceholder": "8",
    "miles": "Millas que manejaste",
    "milesPlaceholder": "85",
    "milesTooltip": "Incluye millas manejando al restaurante y de regreso a tu zona, no solo las de entrega",
    "platforms": "Cuales apps?",
    "optionalSection": "Detalles de impuestos (opcional)",
    "filingStatus": "Estado civil",
    "single": "Soltero/a",
    "married": "Casado/a",
    "annualIncome": "Ingreso anual aproximado",
    "annualIncomePlaceholder": "30000",
    "calculate": "Calcular",
    "itemizeTitle": "Avanzado: Desglosar tus costos",
    "comingSoon": "Proximamente"
  },
  "results": {
    "youReallyMade": "Realmente ganaste",
    "perHour": "/hr",
    "minWage": "Salario minimo: {wage}/hr",
    "w2Equivalent": "En un trabajo regular, esto equivale a",
    "w2Tooltip": "Un trabajo regular tambien paga parte de tus impuestos y puede incluir beneficios",
    "breakdown": "Ver el desglose",
    "mileageCost": "Millaje ({miles} mi × $0.725)",
    "seTax": "Impuesto de autoempleo (14.13%)",
    "incomeTax": "Impuesto estimado ({rate}%)",
    "kept": "Lo que te quedo",
    "activeRate": "Por hora de entrega",
    "share": "Compartir mis resultados",
    "linkCopied": "Enlace copiado!"
  }
}
```

**Step 3: Configure next-intl**

Create `i18n/routing.ts`:

```typescript
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en",
});
```

Create `i18n/request.ts`:

```typescript
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "en" | "es")) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

**Step 4: Create middleware for locale detection**

Create `middleware.ts`:

```typescript
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/", "/(en|es)/:path*"],
};
```

**Step 5: Update next.config.ts**

Modify `next.config.ts` to add the next-intl plugin:

```typescript
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig = {};

export default withNextIntl(nextConfig);
```

**Step 6: Create locale layout**

Create `app/[locale]/layout.tsx`:

```tsx
import { NextIntlClientProvider, useMessages } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
```

**Step 7: Create placeholder page**

Create `app/[locale]/page.tsx`:

```tsx
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

export default function Home({ params }: { params: Promise<{ locale: string }> }) {
  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <h1 className="text-2xl font-bold">Dash of Reality</h1>
      <p>Calculator coming next...</p>
    </main>
  );
}
```

Remove or replace the default `app/page.tsx` — the `[locale]` route handles the root now.

**Step 8: Verify build**

```bash
npm run build
```

Expected: Build succeeds. Visiting `/en` and `/es` both render. Root `/` redirects to `/en`.

**Step 9: Commit**

```bash
git add -A
git commit -m "feat: configure next-intl with EN/ES translations and locale routing"
```

---

### Task 5: URL Sharing and localStorage Helpers

**Files:**
- Create: `lib/sharing.ts`
- Create: `lib/storage.ts`
- Create: `__tests__/lib/sharing.test.ts`
- Create: `__tests__/lib/storage.test.ts`

**Step 1: Write failing tests for sharing**

Create `__tests__/lib/sharing.test.ts`:

```typescript
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
```

**Step 2: Run test to verify it fails**

```bash
npx vitest run __tests__/lib/sharing.test.ts
```

Expected: FAIL — module not found.

**Step 3: Implement sharing helpers**

Create `lib/sharing.ts`:

```typescript
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
```

**Step 4: Run sharing tests**

```bash
npx vitest run __tests__/lib/sharing.test.ts
```

Expected: All 3 tests PASS.

**Step 5: Write failing tests for storage**

Create `__tests__/lib/storage.test.ts`:

```typescript
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
```

**Step 6: Run test to verify it fails**

```bash
npx vitest run __tests__/lib/storage.test.ts
```

Expected: FAIL — module not found.

**Step 7: Implement storage helpers**

Create `lib/storage.ts`:

```typescript
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
```

**Step 8: Run all tests**

```bash
npx vitest run __tests__/lib/storage.test.ts
```

Expected: All 2 tests PASS.

**Step 9: Commit**

```bash
git add lib/sharing.ts lib/storage.ts __tests__/lib/sharing.test.ts __tests__/lib/storage.test.ts
git commit -m "feat: add URL sharing encoder/decoder and localStorage helpers with tests"
```

---

### Task 6: Calculator Form Component

**Files:**
- Create: `components/calculator-form.tsx`
- Create: `components/platform-select.tsx`
- Create: `components/itemize-placeholder.tsx`

**Step 1: Build the platform multi-select**

Create `components/platform-select.tsx`:

```tsx
"use client";

import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const PLATFORMS = [
  { id: "doordash", label: "DoorDash" },
  { id: "ubereats", label: "Uber Eats" },
  { id: "instacart", label: "Instacart" },
  { id: "amazonflex", label: "Amazon Flex" },
  { id: "other", label: "Other" },
];

interface PlatformSelectProps {
  selected: string[];
  onChange: (platforms: string[]) => void;
}

export function PlatformSelect({ selected, onChange }: PlatformSelectProps) {
  const t = useTranslations("form");

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((p) => p !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <fieldset>
      <legend className="text-sm font-medium mb-2">{t("platforms")}</legend>
      <div className="flex flex-wrap gap-3">
        {PLATFORMS.map((p) => (
          <label key={p.id} className="flex items-center gap-1.5 text-sm">
            <Checkbox
              checked={selected.includes(p.id)}
              onCheckedChange={() => toggle(p.id)}
            />
            {p.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
```

**Step 2: Build the coming-soon placeholder**

Create `components/itemize-placeholder.tsx`:

```tsx
"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

export function ItemizePlaceholder() {
  const t = useTranslations("form");

  return (
    <div className="mt-4 rounded-lg border border-dashed border-muted-foreground/30 p-4 opacity-50">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{t("itemizeTitle")}</span>
        <Badge variant="secondary">{t("comingSoon")}</Badge>
      </div>
    </div>
  );
}
```

**Step 3: Build the main calculator form**

Create `components/calculator-form.tsx`:

```tsx
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
```

**Step 4: Verify it builds**

```bash
npm run build
```

Expected: Build succeeds (components exist but aren't wired to a page yet — that's Task 8).

**Step 5: Commit**

```bash
git add components/calculator-form.tsx components/platform-select.tsx components/itemize-placeholder.tsx
git commit -m "feat: add calculator form, platform multi-select, and itemize placeholder components"
```

---

### Task 7: Results Display and Share Button

**Files:**
- Create: `components/results-display.tsx`
- Create: `components/share-button.tsx`

**Step 1: Build the share button**

Create `components/share-button.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { encodeInputs } from "@/lib/sharing";
import type { CalculationInput } from "@/lib/calculate";

interface ShareButtonProps {
  input: CalculationInput;
  locale: string;
}

export function ShareButton({ input, locale }: ShareButtonProps) {
  const t = useTranslations("results");
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const encoded = encodeInputs(input);
    const url = `${window.location.origin}/${locale}/shared?d=${encoded}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select and copy
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Button variant="outline" className="w-full" onClick={handleShare}>
      {copied ? t("linkCopied") : t("share")}
    </Button>
  );
}
```

**Step 2: Build the results display**

Create `components/results-display.tsx`:

```tsx
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

  const incomeTaxPercent = input.annualIncome
    ? Math.round(result.deductions.incomeTax / Math.max(input.grossEarnings - result.deductions.mileageCost, 1) * 100)
    : 12;

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
```

**Step 3: Verify build**

```bash
npm run build
```

Expected: Build succeeds.

**Step 4: Commit**

```bash
git add components/results-display.tsx components/share-button.tsx
git commit -m "feat: add results display with gross-to-net bar, breakdown, and share button"
```

---

### Task 8: Wire Up the Pages

**Files:**
- Modify: `app/[locale]/page.tsx`
- Create: `app/[locale]/shared/page.tsx`
- Create: `components/language-toggle.tsx`
- Modify: `app/[locale]/layout.tsx`

**Step 1: Build the language toggle**

Create `components/language-toggle.tsx`:

```tsx
"use client";

import { useRouter, usePathname } from "next/navigation";

interface LanguageToggleProps {
  locale: string;
}

export function LanguageToggle({ locale }: LanguageToggleProps) {
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: string) {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  }

  return (
    <button
      onClick={() => switchLocale(locale === "en" ? "es" : "en")}
      className="text-sm px-2 py-1 rounded border hover:bg-muted transition-colors"
      aria-label={locale === "en" ? "Cambiar a Espanol" : "Switch to English"}
    >
      {locale === "en" ? "🇲🇽 ES" : "🇺🇸 EN"}
    </button>
  );
}
```

**Step 2: Update locale layout with header**

Modify `app/[locale]/layout.tsx` to include the language toggle in a header:

```tsx
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { LanguageToggle } from "@/components/language-toggle";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <header className="flex items-center justify-between p-4 border-b">
        <h1 className="text-lg font-bold">Dash of Reality</h1>
        <LanguageToggle locale={locale} />
      </header>
      {children}
    </NextIntlClientProvider>
  );
}
```

**Step 3: Wire up the main calculator page**

Replace `app/[locale]/page.tsx`:

```tsx
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
```

**Step 4: Create the shared page**

Create `app/[locale]/shared/page.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { CalculatorForm } from "@/components/calculator-form";
import { ResultsDisplay } from "@/components/results-display";
import { decodeInputs } from "@/lib/sharing";
import { calculate, type CalculationResult, type CalculationInput } from "@/lib/calculate";

export default function SharedPage() {
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
    <main className="flex flex-col items-center gap-6 p-4 pb-16">
      <CalculatorForm initialInputs={initialInputs} onResult={handleResult} />
      {result && lastInput && (
        <ResultsDisplay result={result} input={lastInput} locale={locale} />
      )}
    </main>
  );
}
```

**Step 5: Remove old default page if it exists**

Delete `app/page.tsx` if it still exists (the `[locale]` route handles root now).

**Step 6: Verify full app works**

```bash
npm run dev
```

Visit `http://localhost:3000/en`, fill in values, click Calculate. Verify:
- Form renders with English labels
- Results show with colored bar
- Breakdown expands
- Switch to `/es` — labels are in Spanish
- Share button copies a URL
- Opening that URL pre-fills and auto-calculates

**Step 7: Build check**

```bash
npm run build
```

Expected: Build succeeds.

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: wire calculator form, results display, language toggle, and shared page"
```

---

### Task 9: SEO and Meta Tags

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/[locale]/layout.tsx`

**Step 1: Update root layout with base HTML structure**

Modify `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://dashofreality.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

Note: The `lang` attribute on `<html>` should be set dynamically. Update `app/[locale]/layout.tsx` if next-intl doesn't handle it automatically — check the next-intl docs for the App Router approach.

**Step 2: Add Schema.org markup to the locale layout**

Add a JSON-LD script to the locale layout's `generateMetadata`:

```tsx
// Inside generateMetadata in app/[locale]/layout.tsx, add:
other: {
  "script:ld+json": JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Dash of Reality — Gig Driver Profit Calculator",
    "description": t("description"),
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Any",
    "offers": { "@type": "Offer", "price": "0" },
  }),
},
```

**Step 3: Verify meta tags render**

```bash
npm run build
```

Check the built HTML in `.next/server/app/en.html` for correct `<title>`, `<meta>` description, and OG tags.

**Step 4: Commit**

```bash
git add app/layout.tsx app/[locale]/layout.tsx
git commit -m "feat: add SEO meta tags, OG data, and Schema.org markup"
```

---

### Task 10: Final Polish and Full Test Run

**Files:**
- All test files
- Possibly minor fixes to any file

**Step 1: Run all tests**

```bash
npm run test
```

Expected: All tests pass (tax brackets, calculate, sharing, storage).

**Step 2: Run build**

```bash
npm run build
```

Expected: Clean build, no warnings.

**Step 3: Manual smoke test**

```bash
npm run dev
```

Test checklist:
- [ ] `/en` loads, form renders with English
- [ ] `/es` loads, form renders with Spanish
- [ ] Enter values, click Calculate — big number appears
- [ ] Color is red when hourly rate < $7.25
- [ ] Color is green when hourly rate > $10.88
- [ ] Breakdown expands/collapses
- [ ] W-2 equivalent shows with tooltip
- [ ] Share button copies URL to clipboard
- [ ] Open shared URL — form pre-fills and auto-calculates
- [ ] Close and reopen `/en` — form remembers last inputs
- [ ] Language toggle switches between EN/ES
- [ ] Mobile viewport (Chrome DevTools) — everything fits, buttons are thumb-sized
- [ ] "Advanced: Itemize your costs" section is visible but disabled

**Step 4: Fix any issues found**

Address any bugs from the smoke test.

**Step 5: Final commit**

```bash
git add -A
git commit -m "chore: final polish and smoke test fixes"
```

---

## Summary

| Task | What it builds | Tests |
|------|---------------|-------|
| 1 | Project scaffolding | Build check |
| 2 | Constants + tax brackets | 5 unit tests |
| 3 | Core calculation function | 11 unit tests |
| 4 | i18n (EN/ES) with routing | Build check |
| 5 | URL sharing + localStorage | 5 unit tests |
| 6 | Calculator form components | Build check |
| 7 | Results display + share | Build check |
| 8 | Wire pages together | Dev server check |
| 9 | SEO meta tags | Build check |
| 10 | Polish + full test run | All tests + manual |

**Total: 10 tasks, ~21 automated tests, full manual smoke test at the end.**
