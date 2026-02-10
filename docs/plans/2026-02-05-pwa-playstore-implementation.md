# PWA + Play Store Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the Next.js calculator into a PWA with offline support and package it as a TWA for Google Play Store.

**Architecture:** Add Serwist for service worker / precaching, web app manifest with icons, then use Bubblewrap CLI to generate a signed .aab for Play Store upload. Digital Asset Links file verifies domain ownership for full-screen TWA display.

**Tech Stack:** @serwist/next, Bubblewrap CLI, sharp (icon generation)

---

### Task 1: Generate PWA Icon Sizes

**Files:**
- Create: `public/icons/icon-192.png`
- Create: `public/icons/icon-384.png`
- Create: `public/icons/icon-512.png`

**Step 1: Generate icons from source**

```bash
mkdir -p public/icons
npx sharp-cli resize 192 192 --input "assets/play-store/icon-512.png" --output public/icons/icon-192.png
npx sharp-cli resize 384 384 --input "assets/play-store/icon-512.png" --output public/icons/icon-384.png
cp "assets/play-store/icon-512.png" public/icons/icon-512.png
```

**Step 2: Also copy the icon as favicon**

```bash
npx sharp-cli resize 32 32 --input "assets/play-store/icon-512.png" --output public/favicon.ico
```

**Step 3: Verify files exist**

```bash
ls -la public/icons/
```

Expected: Three PNG files at correct sizes.

**Step 4: Commit**

```bash
git add public/icons/ public/favicon.ico
git commit -m "chore: generate PWA icon sizes from source image"
```

---

### Task 2: Add Web App Manifest

**Files:**
- Create: `public/manifest.json`
- Modify: `app/[locale]/layout.tsx` — add manifest link and PWA meta tags

**Step 1: Create manifest**

Create `public/manifest.json`:

```json
{
  "name": "Dash of Reality: Gig Driver Profit Calculator",
  "short_name": "Dash of Reality",
  "description": "Find out what you really earn per hour after expenses, taxes, and mileage.",
  "start_url": "/en",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#1c1c1c",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ]
}
```

**Step 2: Add PWA meta tags to locale layout**

In `app/[locale]/layout.tsx`, inside the `<head>` area (or via metadata export), add:

```tsx
// Add to generateMetadata return object:
manifest: "/manifest.json",
themeColor: "#1c1c1c",
appleWebApp: {
  capable: true,
  statusBarStyle: "default",
  title: "Dash of Reality",
},
```

Also add an apple-touch-icon link. In the layout JSX inside `<head>` or via metadata:

```tsx
icons: {
  apple: "/icons/icon-192.png",
},
```

**Step 3: Verify build**

```bash
npm run build
```

Expected: Build succeeds. manifest.json is accessible at /manifest.json.

**Step 4: Commit**

```bash
git add public/manifest.json app/[locale]/layout.tsx
git commit -m "feat: add web app manifest and PWA meta tags"
```

---

### Task 3: Add Service Worker with Serwist

**Files:**
- Modify: `package.json` — install serwist
- Create: `app/sw.ts` — service worker source
- Modify: `next.config.ts` — wrap with serwist plugin
- Modify: `tsconfig.json` — add webworker lib
- Modify: `app/[locale]/layout.tsx` — register service worker
- Modify: `.gitignore` — ignore generated sw files

**Step 1: Install Serwist**

```bash
npm install @serwist/next
npm install -D serwist
```

**Step 2: Create service worker source**

Create `app/sw.ts`:

```typescript
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry } from "serwist";
import { Serwist } from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
```

**Step 3: Update next.config.ts**

Replace `next.config.ts`:

```typescript
import createNextIntlPlugin from "next-intl/plugin";
import withSerwistInit from "@serwist/next";

const withNextIntl = createNextIntlPlugin();

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
});

const nextConfig = {};

export default withSerwist(withNextIntl(nextConfig));
```

**Step 4: Update tsconfig.json**

Add `"WebWorker"` to the `lib` array in compilerOptions. If there's no `lib` array, add:

```json
"compilerOptions": {
  "lib": ["dom", "dom.iterable", "esnext", "WebWorker"]
}
```

Also add `"@serwist/next/typings"` to the `types` array if one exists, or create it.

**Step 5: Update .gitignore**

Add these lines to `.gitignore`:

```
# Serwist generated service worker
public/sw.js
public/sw.js.map
public/swe-worker.js
public/swe-worker.js.map
```

**Step 6: Register service worker in locale layout**

In `app/[locale]/layout.tsx`, add a script tag inside `<body>` (after the closing `</NextIntlClientProvider>` or at the end of body):

```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register('/sw.js');
        });
      }
    `,
  }}
/>
```

**Step 7: Update build script for webpack**

Serwist requires webpack (not Turbopack). Update `package.json` scripts:

```json
"build": "next build --webpack"
```

**Step 8: Verify build with service worker**

```bash
npm run build
```

Expected: Build succeeds. `public/sw.js` is generated. Check it exists:

```bash
ls -la public/sw.js
```

**Step 9: Run all tests**

```bash
npm run test
```

Expected: All 21 tests still pass (service worker doesn't affect unit tests).

**Step 10: Commit**

```bash
git add -A
git commit -m "feat: add Serwist service worker for offline PWA support"
```

---

### Task 4: Deploy to Vercel

**Files:**
- None (deployment only)

**Step 1: Push to GitHub**

```bash
git push origin master
```

**Step 2: Connect to Vercel**

If not already connected:

```bash
npx vercel --prod
```

Or connect via Vercel dashboard at vercel.com — import the GitHub repo `extramediumal/dash-of-reality`. Vercel auto-detects Next.js and deploys.

IMPORTANT: Vercel uses Turbopack by default. Since our build script now uses `--webpack`, verify Vercel respects the package.json build script. If not, override the build command in Vercel project settings to `next build --webpack`.

**Step 3: Verify deployment**

- Visit the Vercel URL
- Check `/manifest.json` loads
- Check `/sw.js` loads
- Open Chrome DevTools > Application > Service Workers — verify service worker is registered
- Open Chrome DevTools > Application > Manifest — verify manifest loads with correct icons

**Step 4: Note the production URL**

Save the Vercel production URL (e.g., `dash-of-reality.vercel.app` or custom domain). This is needed for the TWA in Task 5.

---

### Task 5: Package as TWA with Bubblewrap

**Files:**
- Create: `twa/` directory (generated by Bubblewrap)
- Create: `public/.well-known/assetlinks.json`

**Step 1: Install Bubblewrap**

```bash
npm install -g @nicedayz/nicedayz.github.io
```

If that fails, use:

```bash
npm install -g @nicedayz/nicedayz.github.io || npm install -g @nicedayz/nicedayz-github-io
```

Actually, the correct package is:

```bash
npm install -g @nicedayz/nicedayz.github.io
```

If Bubblewrap is not available as a standalone, use PWABuilder instead (web-based, no install):
1. Go to https://www.pwabuilder.com/
2. Enter your Vercel URL
3. Click "Package for stores" > Android
4. Download the generated `.aab` and signing info

**Step 2: Initialize TWA project (if using Bubblewrap CLI)**

```bash
mkdir twa && cd twa
bubblewrap init --manifest https://YOUR-VERCEL-URL/manifest.json
```

When prompted:
- Package name: `com.dashofreality.app`
- App name: `Dash of Reality: Gig Driver Profit Calculator`
- Short name: `Dash of Reality`
- Use the defaults for everything else

This generates:
- A signing key (save the keystore file and passwords securely!)
- The Android project
- An `assetlinks.json` content snippet

**Step 3: Build the .aab**

```bash
bubblewrap build
```

Output: `app-release-bundle.aab` — this is what you upload to Play Store.

**Step 4: Get the assetlinks.json content**

Bubblewrap prints the Digital Asset Links JSON. It looks like:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.dashofreality.app",
    "sha256_cert_fingerprints": ["XX:XX:XX:...your signing key fingerprint..."]
  }
}]
```

**Step 5: Add assetlinks.json to the web app**

Create `public/.well-known/assetlinks.json` with the content from Step 4.

**Step 6: Redeploy**

```bash
cd .. # back to project root
git add public/.well-known/assetlinks.json
git commit -m "feat: add Digital Asset Links for TWA verification"
git push origin master
```

Wait for Vercel to redeploy. Verify `https://YOUR-VERCEL-URL/.well-known/assetlinks.json` returns the correct JSON.

---

### Task 6: Upload to Google Play Store

**This is a manual task — not automated.**

**Step 1: Go to Google Play Console**

https://play.google.com/console

**Step 2: Create new app**

- App name: Dash of Reality: Gig Driver Profit Calculator
- Default language: English (US)
- App or game: App
- Free or paid: Free

**Step 3: Fill in store listing**

- Title: Dash of Reality: Gig Driver Profit Calculator
- Short description: "Find out what you really earn per hour after expenses, taxes, and mileage."
- Full description: "Are you really making $20/hour delivering for DoorDash, Uber Eats, or Instacart? Dash of Reality shows you what you actually take home after mileage costs, self-employment tax, and income tax. Enter your earnings, hours, and miles — get your true hourly rate in seconds. Available in English and Spanish."
- App icon: Upload `assets/play-store/icon-512.png`
- Feature graphic: Upload `assets/play-store/feature-graphic.png`
- Screenshots: Upload 2-3 phone screenshots (capture from Chrome DevTools mobile view of the calculator)
- Category: Finance
- Contact email: your email

**Step 4: Content rating questionnaire**

Complete the questionnaire. For a calculator app with no user-generated content, no ads (yet), no personal data collection, this should get an "Everyone" rating.

**Step 5: Upload the .aab**

Go to Release > Production > Create new release. Upload `app-release-bundle.aab`.

**Step 6: Submit for review**

Google review typically takes 1-3 days for new apps.

---

## Summary

| Task | What | Automated? |
|------|------|-----------|
| 1 | Generate icon sizes | Yes |
| 2 | Add manifest.json + PWA meta | Yes |
| 3 | Add Serwist service worker | Yes |
| 4 | Deploy to Vercel | Semi (CLI) |
| 5 | Package TWA with Bubblewrap | Semi (CLI) |
| 6 | Upload to Play Store | Manual |

**Tasks 1-3** are code changes we can automate with subagents.
**Tasks 4-6** require your interaction (Vercel login, signing keys, Play Console).
