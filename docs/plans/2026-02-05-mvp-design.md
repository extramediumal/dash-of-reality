# Dash of Reality — MVP Design

## Overview

A mobile-first web calculator that shows gig delivery drivers their true hourly profit after real expenses. One page, no login, no backend. Built to be the "aha moment" that drivers share in Reddit threads and Facebook groups.

**Core principle:** Simple enough for anyone to use in 30 seconds. No jargon. English and Spanish from day one.

## Stack

- **Framework:** Next.js (SSG for SEO)
- **Styling:** Tailwind CSS + shadcn/ui
- **i18n:** next-intl (EN + ES)
- **Deployment:** Vercel (free tier)
- **Backend:** None. All calculations client-side. localStorage for persistence.

## Pages

| Route | Purpose |
|---|---|
| `/[locale]` | The calculator |
| `/[locale]/shared` | Same calculator, pre-filled from URL query params |

Both render the same component. `/shared` reads `?d=<base64>` on load and fills the form.

## Input Fields

### Required (always visible)

| Field | Label (EN) | Label (ES) | Type | Placeholder |
|---|---|---|---|---|
| Gross earnings | "What did the app say you earned?" | "Cuanto dice la app que ganaste?" | Currency input | $127.50 |
| Active hours | "Hours on deliveries" | "Horas en entregas" | Number | 6 |
| Total hours | "Total hours (including waiting)" | "Horas totales (incluyendo espera)" | Number | 8 |
| Total miles | "Miles you drove" | "Millas que manejaste" | Number | 85 |
| Platforms | "Which apps?" | "Cuales apps?" | Multi-select checkboxes | DoorDash, Uber Eats, Instacart, Amazon Flex, Other |

Tooltip on "Miles you drove": "Include driving to restaurants and back to your area, not just delivery miles"

### Optional (collapsed, tap to expand)

| Field | Label (EN) | Type | Default |
|---|---|---|---|
| Filing status | "Filing status" | Single / Married toggle | Single |
| Estimated annual income | "Rough annual income" | Currency input | $30,000 |

These refine the income tax estimate. Without them, we use 12% federal rate.

### Coming Soon Placeholder

A visible but disabled section: "Advanced: Itemize your costs" with a "Coming soon" badge. This is where itemized expenses (dead miles breakdown, instant pay fees, commercial insurance, health insurance, maintenance, phone/data) will live in a future release.

## Calculation Logic

Pure function. No side effects. Easy to test.

```
Inputs:
  grossEarnings, activeHours, totalHours, totalMiles,
  filingStatus?, annualIncome?

Constants:
  IRS_MILEAGE_RATE = 0.725  // 2026
  SE_TAX_RATE = 0.1413      // 15.3% * 92.35%
  DEFAULT_INCOME_TAX_RATE = 0.12

Calculation:
  mileageCost = totalMiles * IRS_MILEAGE_RATE
  netAfterMileage = grossEarnings - mileageCost
  seTax = netAfterMileage * SE_TAX_RATE
  incomeTaxRate = lookupBracket(annualIncome, filingStatus) || DEFAULT_INCOME_TAX_RATE
  incomeTax = netAfterMileage * incomeTaxRate
  totalDeductions = mileageCost + seTax + incomeTax
  netEarnings = grossEarnings - totalDeductions

Output:
  actualHourlyRate = netEarnings / totalHours
  activeHourlyRate = netEarnings / activeHours
  grossHourlyRate = grossEarnings / totalHours
  w2Equivalent = actualHourlyRate * 0.807
    // W-2 workers get employer FICA (7.65%) + ~15% benefits value
    // So $1 gig ≈ $0.807 W-2. This approximation keeps it simple.
  deductionBreakdown = { mileageCost, seTax, incomeTax }
  healthIndicator = "green" | "yellow" | "red"
    // green: actualHourlyRate >= 1.5 * federalMinWage
    // yellow: actualHourlyRate >= federalMinWage
    // red: actualHourlyRate < federalMinWage
```

## Results Display

### Primary (always visible, above the fold)

1. **Big number:** "You really made **$6.42/hr**" — color-coded green/yellow/red
2. **Visual bar:** Gross earnings on left, net on right. Colored bar shrinks from gross to net. No axis labels — the shrinkage tells the story.
3. **Comparison line:** "Minimum wage: $7.25/hr" (federal default)
4. **W-2 equivalent:** "At a regular job, this equals **$5.18/hr**" with (?) tooltip: "A regular job also pays part of your taxes and may include benefits"

### Expandable Breakdown (collapsed by default)

- Mileage cost (X miles x $0.725): -$XX.XX
- Self-employment tax (14.13%): -$XX.XX
- Estimated income tax (XX%): -$XX.XX
- **What you kept: $XX.XX**

### Per Active Hour (secondary stat)

- "Per delivery hour: $X.XX/hr" — shown smaller, below the breakdown. Drivers know the difference between active and total time; showing both validates their experience.

## Sharing

1. "Share my results" button below results
2. Encodes all inputs as base64 in a query param: `/shared?d=eyJ...`
3. Copies link to clipboard
4. Toast notification: "Link copied!" / "Enlace copiado!"
5. Recipient opens link -> form pre-fills -> auto-calculates on load

## localStorage

- Auto-save all inputs after each calculation
- On return visit, pre-fill form with last values
- No login, no accounts

## i18n

- next-intl with `/en/` and `/es/` route prefixes
- Browser language detection for default, manual toggle in header
- Language toggle: flag icons (US / MX flags), no text
- All UI strings in `messages/en.json` and `messages/es.json`
- SEO: separate meta tags and OG data per locale

## Project Structure

```
dash-of-reality/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx              # Calculator page
│   │   ├── shared/page.tsx       # Shared results (reads query params)
│   │   └── layout.tsx            # Shell, language toggle, meta tags
│   └── layout.tsx                # Root layout
├── components/
│   ├── calculator-form.tsx       # Input form
│   ├── results-display.tsx       # Big number + bar + breakdown
│   ├── platform-select.tsx       # Multi-select checkboxes
│   ├── share-button.tsx          # URL encoding + clipboard
│   ├── language-toggle.tsx       # EN/ES switch
│   └── itemize-placeholder.tsx   # Disabled "Coming soon" stub
├── lib/
│   ├── calculate.ts              # Pure calculation function
│   ├── constants.ts              # IRS rate, tax rates, etc.
│   ├── sharing.ts                # URL encode/decode helpers
│   └── tax-brackets.ts           # Federal tax bracket lookup
├── messages/
│   ├── en.json                   # English strings
│   └── es.json                   # Spanish strings
└── public/
    └── og-image.png              # Social share preview image
```

## SEO

- SSG pre-renders the empty calculator with full meta tags
- Title: "Gig Driver Profit Calculator — What You Really Make"
- Schema.org markup for a financial calculator
- OG image showing a sample result (for social sharing previews)
- Separate meta for `/es/`: "Calculadora de Ganancias para Repartidores"

## Design Principles

1. **One glance, one answer.** The big number is the product.
2. **Plain language.** "What did the app say you earned?" not "Enter gross earnings."
3. **Mobile-first.** 80%+ of users are on phones. Every element sized for thumbs.
4. **No jargon.** Tooltips for anything financial. Expand for detail, never force it.
5. **Bilingual from day one.** English and Spanish. No afterthought i18n.
6. **Honest.** This tool exists because the platforms won't show these numbers.

## Future Enhancements (Not in MVP)

- Itemized expense mode (toggle from IRS mileage rate to actual costs)
- Dead miles breakdown
- Instant pay fee tracking
- Commercial insurance / health insurance inputs
- State minimum wage auto-detection
- Real-time sticky results (update as you type, no "Calculate" button)
- Step-by-step wizard UX for first-time users
- Gas price lookup by ZIP (GasBuddy API)
- Weekly/monthly tracking over time
- Additional languages
