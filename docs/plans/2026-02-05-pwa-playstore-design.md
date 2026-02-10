# PWA + Play Store Design

## Overview

Convert the existing Next.js calculator into a PWA with offline support, then package as a TWA (Trusted Web Activity) for Google Play Store.

## Architecture

The Play Store app is a thin native wrapper (TWA) that opens the Vercel-hosted site in full-screen Chrome. A service worker caches all assets for offline use. Updates deploy to Vercel — no Play Store resubmission needed.

## PWA Configuration

### Web App Manifest (`public/manifest.json`)

- name: "Dash of Reality: Gig Driver Profit Calculator"
- short_name: "Dash of Reality"
- theme_color: "#1c1c1c"
- background_color: "#ffffff"
- display: "standalone"
- start_url: "/en"
- scope: "/"
- Icons: 192x192, 384x384, 512x512 (generated from source icon)

### Service Worker

- Library: @serwist/next (modern next-pwa successor)
- Precache: all static pages (/en, /es, /en/shared, /es/shared)
- Cache strategy: cache-first for static assets, network-first for HTML
- 100% offline capable — no API dependencies

### Icon Sizes

Generated from `assets/play-store/icon-512.png`:
- `public/icons/icon-192.png`
- `public/icons/icon-384.png`
- `public/icons/icon-512.png`

## TWA Packaging

### Bubblewrap CLI

- Package name: `com.dashofreality.app`
- Host URL: Vercel deployment URL
- Signing: locally generated keystore
- Output: signed `.aab` for Play Store upload

### Digital Asset Links

- File: `public/.well-known/assetlinks.json`
- Contains package name + signing key fingerprint
- Must be live on Vercel before Play Store review
- Enables full-screen display (no browser URL bar)

## Play Store Listing

- Title: "Dash of Reality: Gig Driver Profit Calculator"
- Short description: "Find out what you really earn per hour after expenses, taxes, and mileage."
- Category: Finance
- Content rating: Everyone
- Assets: icon-512.png, feature-graphic.png, 2-3 mobile screenshots

## Implementation Order

1. Generate icon sizes from source image
2. Add manifest.json to Next.js public/
3. Add service worker with @serwist/next
4. Add PWA meta tags to locale layout
5. Deploy to Vercel
6. Run Bubblewrap to generate .aab
7. Add assetlinks.json, redeploy
8. Upload .aab + listing to Play Console
