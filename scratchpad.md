# Implementation Scratchpad

## SDK Quickstart (FirstTrace) Rebuild
- **Status:** Completed.
- **Narrative:** "Catch the next one" (Connects wasted run to visible run).
- **Visuals:** 
    - Left: Code diff (+ @trace_agent) with green-tinted background for addition.
    - Right: Next run receipt (visible status).
    - Bottom: Subtle comparison line (wasted $18.42 vs visible).
- **Animation:** Under 1.5s (400ms diff -> 600ms values -> visible status).
- **Styling:** Strict monochrome, zero-radius, no blue UI.

## Verified
- Narrative flow: Pain → Proof → Relief → Relevance.
- FirstTrace follows DebugStream (Terminal shock).
- Contrast between $18.42 (wasted) and next run is clear.

## What You Get (WhatYouGet)
- **Status:** Completed.
- **Purpose:** Proof of product value (Trace, Cost, Retries, Failure).
- **Visuals:** 
    - Left: Headline ("Every run becomes inspectable") and subtext.
    - Right: Technical matrix (rows for TRACE, COST, RETRIES, FAILURE).
- **Animation:** Subtle scanning highlight pass (1.5s duration, 0.6s delay).
- **Design:** Grayscale, 0px radius, red/amber restricted to technical status.

## Pricing Teaser (PricingTeaser)
- **Status:** Completed.
- **Purpose:** Remove pricing anxiety and show clear path from prototype (Free) to scale (Team/Enterprise).
- **Visuals:** 
    - Top row: Pro / Team / Enterprise (3-column grid).
    - Bottom row: Free (full-width horizontal container).
    - Team panel uses a slightly stronger border (#3A3A3A) to draw focus.
- **Pricing:** 
    - Pro: $49/mo (Monthly) -> $36.75/mo (Effective Annual).
    - Team: $299/mo (Monthly) -> $224.25/mo (Effective Annual). 10 seats included.
    - Enterprise: Custom.
    - Free: $0/mo.
- **Math Logic:**
    - Pro Annual: 49 × 9 = 441, 441 / 12 = 36.75.
    - Team Annual: 299 × 9 = 2691, 2691 / 12 = 224.25.
    - Pro Extra Seat: 19 (Monthly) -> 14.25 (Annual).
    - Team Extra Seat: 29 (Monthly) -> 21.75 (Annual).
- **Design:** Strict monochrome, 0px radius, white/black high-contrast buttons.

## Final CTA (FinalCTA)
- **Status:** Completed.
- **Goal:** Direct action ("Run your first trace") after the user has been educated on pricing.
- **Implementation:** 
    - Moved from inline `page.tsx` section to dedicated `src/components/marketing/final-cta.tsx`.
    - Removed old generic copy ("Start observing your agents today").
    - Added compact terminal visual with appear-animations (under 900ms).
    - Uses Geist Mono for headline and code, Geist Sans for subtext.
    - Semantic green (`#34D399`) used for "trace ready" status in terminal.
- **Verification:**
    - Zero rounded corners.
    - Zero blue UI accents.
    - Primary CTA "Start free" (White/Black).
    - Secondary CTA "Read the docs" (Transparent/Border).

## Marketing Navbar (Navbar)
- **Status:** Completed.
- **Goal:** Replace static navbar with a high-fidelity dropdown navigation that exposes product depth.
- **Implementation:** 
    - Created `DropdownNavigation` with `framer-motion` (opacity + 4px y-shift).
    - Created `Navbar` with 5to1r product structure (Trace Viewer, Cost Dashboard, etc.).
    - Used `lucide-react` icons (monochrome #999999).
    - Fixed backdrop blur and translucent background.
- **Verification:**
    - Zero rounded corners on dropdown panels or hover states.
    - Zero blue UI accents.
    - Hover opens dropdowns reliably.
    - Mobile: Navbar exists but center nav is hidden (following standard responsive pattern).

## Custom Auth Pages
- **Status:** Completed.
- **Goal:** Create a 5to1r-specific auth experience using Clerk.
- **Implementation:** 
    - Created `AuthShell` for the 45/55 split-screen layout.
    - Created `AuthTerminalPanel` with a looping tracer simulation (red/green/amber highlights).
    - Configured `CLERK_APPEARANCE` to enforce 0px radius and monochrome colors.
    - Added routes for `sign-in` and `sign-up` using route groups `(auth)`.
- **Verification:**
    - Zero rounded corners on Clerk inputs, buttons, and cards.
    - Zero blue UI accents (verified `colorPrimary` is `#FFFFFF`).
    - "Home" back-link correctly positioned in top-left.
    - Social buttons (Google, GitHub, Apple) are Clerk-managed and monochrome.

## Landing Page Navigation Wiring
- **Status:** Completed.
- **Goal:** Fix all button/link destinations to route to real auth and app pages.
- **Files Checked:**
    - `src/app/page.tsx` (Footer links)
    - `src/components/marketing/navbar.tsx` (Sign in, Start free)
    - `src/components/marketing/hero.tsx` (Start free, Live demo)
    - `src/components/marketing/pricing-teaser.tsx` (Pro, Team, Free, Enterprise)
    - `src/components/marketing/final-cta.tsx` (Start free, Docs)
    - `src/components/marketing/debug-stream.tsx` (Added anchor ID)
- **Placeholders Replaced:**
    - `SignUpButton` -> `Link href="/sign-up"` or `Link href="/sign-in"`
    - `document.getElementById('debug-demo')?.scrollIntoView` -> `Link href="#workspace-terminal"`
    - `#` in navbar/footer -> real routes or intended paths.
- **Verification:**
    - All conversion CTAs lead to `/sign-up`.
    - Sign-in buttons lead to `/sign-in`.
    - Pricing plan params are correctly appended (`?plan=pro`, `?plan=team`).
    - No visual or styling changes were made during the wiring.

## Custom Auth Implementation (Clerk)
- **Status:** Integrated & Polished.
- **Components:**
    - `src/components/auth/auth-shell.tsx` (Split-screen layout).
    - `src/components/auth/auth-terminal-panel.tsx` (Trace sequence).
    - `src/components/auth/clerk-appearance.ts` (Monochrome, 0px radius, Geist Mono).
- **Social Providers:**
    - Clerk is configured to support Google, GitHub, and Apple.
    - **TODO:** Verify that Apple is enabled/configured in the Clerk Dashboard.
- **Branding Removal:**
    - **IMPORTANT:** Remove "Secured by Clerk" branding in Clerk Dashboard → Settings → Branding. This may require a paid Clerk plan.
- **Routes:**
    - `/sign-in` → `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
    - `/sign-up` → `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
