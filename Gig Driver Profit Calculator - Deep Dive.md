## **The Problem (Bigger Than It Seems)**

Gig delivery drivers see their gross earnings constantly \- the DoorDash app shows "$127.50 today\!" \- but have almost no visibility into their actual profit. The mental math required is complex enough that most drivers actively avoid it:

* **Vehicle depreciation** (IRS standard mileage rate is $0.70/mile for 2025, but most drivers just think "gas")  
* **Actual gas costs** (varies by vehicle MPG and local prices)  
* **Increased insurance costs** (many don't realize personal insurance doesn't cover commercial delivery)  
* **Maintenance acceleration** (oil changes, tire wear, brake replacements happen 2-3x faster)  
* **Self-employment tax** (15.3% that W-2 employees never see)  
* **Income tax** (federal and state)  
* **Unpaid time** (waiting for orders, driving to hotspots, returns to stores)

A driver who thinks they made "$25/hour" often made closer to $8-12/hour after these factors. This isn't a minor calculation error \- it's the difference between viable income and exploitative labor.

## **Why Demand Is Massive**

**Active user base:** DoorDash alone has 7+ million active "Dashers" globally. Add Uber Eats, Instacart, Grubhub, Amazon Flex, Shipt \- the gig delivery workforce is enormous and growing.

**High-frequency pain point:** This isn't a once-a-year tax question. Drivers wonder "is this worth it?" constantly:

* After a particularly bad shift  
* When comparing to other job opportunities  
* When deciding whether to continue as primary income  
* When explaining their work to skeptical family members

**Search behavior shows desperation:**

* "Is DoorDash worth it" \- 18,000+ monthly searches  
* "Uber Eats driver pay after expenses" \- growing search trend  
* "Gig driver profit calculator" \- low competition, direct intent  
* Reddit threads asking this question get 200+ comments of confused drivers comparing notes

**Emotional decision point:** People use this calculator when considering life-changing decisions \- quit their gig work, take on more hours, switch platforms. This creates high engagement and sharing potential.

## **Why Competition Is Surprisingly Low**

**Existing solutions are inadequate:**

1. **Spreadsheet templates** \- Require downloading, too much friction, intimidating for non-spreadsheet users  
2. **Platform-specific tools** \- DoorDash provides earnings summaries but deliberately obscures true costs  
3. **Generic business calculators** \- Don't account for gig-specific factors like active vs. waiting time  
4. **Articles with formulas** \- People want to input numbers and get answers, not do math themselves

**Gig platforms have zero incentive** to build this tool. DoorDash benefits when drivers underestimate their costs and continue working at unprofitable rates. They will never create an honest profit calculator.

**Personal finance apps miss the mark** \- Mint, YNAB, etc. track expenses but don't frame them in the "effective hourly wage" context that gig workers need.

**Current SEO landscape is weak:** Search "DoorDash profit calculator" and you'll find blog posts, not functioning tools. The few calculators that exist are buried in gig driver forums or poorly designed. A clean, Google-ranking tool would face minimal established competition.

## **The MVP (Buildable in a Weekend)**

### **Core Input Fields:**

**Earnings Section:**

* Gross earnings (from platform): $\_\_\_\_\_\_  
* Active hours (actually driving/delivering): \_\_\_  
* Total hours (including waiting/positioning): \_\_\_  
* Platform (DoorDash/Uber Eats/Instacart/Other) \- affects defaults

**Vehicle Section:**

* Miles driven this period: \_\_\_\_\_\_  
* Vehicle type dropdown:  
  * Sedan (30 MPG average)  
  * SUV (22 MPG average)  
  * Custom (enter your MPG: \_\_\_)  
* Local gas price: $\_\_\_\_/gallon (auto-populate based on ZIP code using GasBuddy API)

**Optional Advanced Inputs (collapsed by default):**

* Commercial insurance premium: $\_\_\_ /month  
* Recent maintenance costs: $\_\_\_  
* Phone/accessories costs: $\_\_\_

### **Output Display:**

**The Truth Section (big, bold):**

```
Your ACTUAL hourly rate: $12.47/hour

Breakdown:
Gross earnings:           $185.00
- Gas costs:              -$28.50
- Vehicle wear (IRS rate): -$63.00  
- Self-employment tax:    -$26.27
- Income tax (est):       -$18.50
= Net profit:             $48.73

÷ Total hours worked: 8.5 hours
= $5.73/hour effective wage

If counting only active hours (5.2 hours): $9.37/hour
```

**Comparison Context:**

* "Your state minimum wage is $15.00/hour"  
* "A retail job at Target would pay $16.50/hour in your area"  
* "To make $15/hour actual profit, you'd need to earn $31.50/hour gross"

**Visual Impact:**

* Progress bar showing gross → net  
* Color coding (green if above minimum wage, yellow if close, red if below)  
* Annual projection: "At this rate, you'd net $12,492/year working 40hr/week"

### **Key UX Decisions:**

**Default to IRS mileage rate, not actual gas:** Most drivers underestimate total vehicle costs. The IRS rate ($0.70/mile) accounts for everything \- gas, depreciation, maintenance, insurance. Use this by default, with option to customize.

**Show "active hours" vs "total hours" wage:** Drivers often only count active delivery time, ignoring the 40% of hours spent waiting. Show both rates so they see the full picture.

**Mobile-first design:** 80%+ of gig drivers will access this on their phones between deliveries or at end of shift.

**No login required:** Every barrier reduces usage. Make it instantly usable.

**Save/share functionality:** "Share this calculation" button generates a URL so drivers can show family/friends their actual earnings. Viral potential.

### **Technical Implementation:**

* Pure frontend \- HTML/CSS/JavaScript  
* GasBuddy or AAA API for auto-populating gas prices by ZIP  
* LocalStorage to save last calculation (convenience for repeat users)  
* URL parameters for sharing calculations  
* Deploy on Vercel/Netlify for free  
* Domain: GigDriverProfit.com or DeliveryDriverCalculator.com

## **Monetization Strategy (Realistic Numbers)**

### **Primary: Display Advertising**

**Target audience:** Gig workers are 18-35, mobile-heavy, financially stressed **Session duration:** 5-7 minutes (they're doing real math, comparing scenarios) **RPM estimate:** $8-15 (lower than tech workers but engagement compensates)

**Traffic projection:**

* Month 1: 1,000 visits (organic \+ Reddit/Facebook groups)  
* Month 3: 10,000 visits (SEO starting to work)  
* Month 6: 50,000 visits (ranking for "DoorDash calculator" type queries)  
* Month 12: 200,000 visits (established authority)

**Revenue at 200K monthly visits:** $1,600-3,000/month from ads alone

### **Secondary: Affiliate Links (Higher Intent)**

**Car expense tracking apps:**

* Everlance, Hurdlr, Stride Tax \- apps that track mileage automatically  
* Commission: $5-15 per signup, conversion rate 2-3%  
* 200K visitors × 2.5% × $10 \= $50,000/year potential

**Gas rebate cards:**

* Upside app (gas cashback) \- extremely relevant  
* GetUpside pays $2-5 per referred driver  
* High conversion because it directly reduces their biggest expense

**Gig worker tax software:**

* Keeper Tax, TurboTax Self-Employed  
* Commission: $20-50 per signup  
* Seasonal spike during tax season

**Auto insurance for gig workers:**

* Progressive, State Farm gig policies  
* High payouts ($50-100 per quote)  
* Lower conversion but extremely high value

**Alternative income opportunities:**

* "Your effective rate is $8/hour. See these alternatives:"  
* Warehouse jobs, retail positions, local gigs  
* Indeed, ZipRecruiter affiliate programs

### **Tertiary: Email Capture for Content**

**Lead magnet:** "The Complete Gig Driver Tax Guide (Free PDF)"

**Email sequence:**

* Day 1: Tax deduction checklist for gig workers  
* Day 3: How to negotiate better rates with customers  
* Day 7: Alternative gig platforms paying higher rates  
* Day 14: Case study of driver who doubled earnings by switching platforms

**Monetization of list:**

* Affiliate promotions for relevant products/services  
* Sponsored content from gig-adjacent companies  
* List value: $1-3 per subscriber/month

### **Revenue Projection (Conservative, Year 1):**

* Display ads: $30,000  
* Affiliate commissions: $15,000  
* Email monetization: $5,000 **Total: $50,000/year** from a weekend project

## **Growth Strategy**

### **SEO (Primary Channel):**

**Target keywords by platform:**

* "DoorDash profit calculator"  
* "Uber Eats earnings calculator"  
* "Instacart driver pay after expenses"  
* "Is \[platform\] worth it calculator"

**Long-tail city-specific:**

* "DoorDash profit calculator Los Angeles"  
* "Uber Eats worth it NYC"

**Programmatic SEO opportunity:** Create city-specific landing pages that pre-populate local gas prices and minimum wage comparisons. Template-based content works because the calculation is location-dependent.

### **Community Seeding (Fast Initial Growth):**

**Reddit:**

* r/doordash\_drivers (200K members)  
* r/UberEATS (100K members)  
* r/InstacartShoppers (80K members)  
* Post titled "Built a calculator that shows your ACTUAL hourly rate after expenses"

**Facebook Groups:**

* DoorDash Driver groups (500K+ combined members)  
* Uber Eats Driver communities  
* Share as genuinely helpful tool, not spam

**TikTok/YouTube Shorts:**

* "I thought I made $25/hour delivering for DoorDash... I was wrong"  
* Show the calculator revealing true earnings  
* Viral potential in personal finance / side hustle content niche

### **Partnership Opportunities:**

**Gig driver advocacy groups:** Organizations fighting for driver rights would promote an honest calculator

**Personal finance influencers:** Graham Stephan, Andrei Jikh types who make "side hustle reality check" content

**Tax preparation services:** CPAs serving gig workers could recommend as client resource

## **Why This Wins**

**You're on the driver's side.** DoorDash will never build this. You have no conflict of interest. That authenticity matters.

**The truth is shocking enough to share.** When someone discovers they actually make $9/hour instead of $22/hour, they tell people. The calculator becomes the conversation.

**It solves a repeated problem.** Drivers will bookmark and return after every shift, every week, when considering other jobs. Recurring usage, not one-time.

**Mobile-native execution beats desktop relics.** Most gig driver tools were built in 2018 and feel dated. A modern, fast, mobile-first calculator immediately feels better.

**You can build it this weekend.** No backend. No complex logic. Just a clean interface and honest math that nobody else is willing to provide.

The opportunity exists because the platforms creating the problem benefit from drivers not knowing the answer. You build the tool that tells the truth.

