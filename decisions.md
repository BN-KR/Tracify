# Design & Architectural Decisions

## Landing Page Narrative (2026-05-13)
- **Rejection of Generic SaaS Patterns:** Rejected the "Features" and "HowItWorks" sections entirely. They were found to be redundant and felt like standard SaaS marketing fluff.
- **Decision:** Move `DebugStream` (Terminal) directly after `Problem`.
- **Rationale:** The terminal simulation acts as the "emotional proof" of the problem. Placing it immediately after the Problem section validates the user's pain with high-fidelity evidence.
- **Decision:** Move `FirstTrace` (Quickstart) directly after `DebugStream`.
- **Rationale:** Provides "immediate relief" after the terminal shock. It shows the user exactly how to fix the problem they just witnessed.
- **Decision:** Move `Use Cases` after `FirstTrace`.
- **Rationale:** Relevance proof should come *after* the user understands both the pain and the solution.
- **Restored Flow:** Hero -> Problem -> DebugStream -> FirstTrace -> WhatYouGet -> UseCases -> PricingTeaser -> FinalCTA.

## SDK Quickstart (FirstTrace)
- **Status:** Rebuilt.
- **Decision:** Previous "Two lines to first trace" version felt like filler documentation.
- **New Narrative:** "Catch the next one."
- **Implementation:** Show a before/after code diff (+ @trace_agent) and a "next run captured" receipt.
- **Result:** Explicitly connects the previous "wasted run" ($18.42) to a "visible run" ($1.12), proving that future waste is catchable.

## Pricing Teaser (PricingTeaser)
- **Status:** Added / Updated.
- **Decision:** Reverted to 50,000 spans/month for the free tier (from 10k) to align with the core business/build documentation "Source of Truth."
- **Decision:** Set Free team members to 1 (per Build Plan) despite Business Plan mentions of "unlimited," to prioritize system enforcement over marketing prose.
- **Decision:** Restructured layout to place **Pro, Team, and Enterprise** in the primary top row (3 columns), with **Free** as a secondary full-width row below.
- **Decision:** Updated **Team** plan to include **10 team seats** (previously unlimited) to better align with the Pro -> Team upgrade path and monetization potential of extra seats ($29/mo).
- **Decision:** Show **Enterprise** as "Custom" in the teaser to signal scalability for high-volume and security-sensitive organizations without creating a full pricing page yet.
- **Decision:** Implement annual billing as "3 months free" (9 months paid), displayed as effective monthly pricing.
- **Visuals:** Square product-style panels, Geist Mono for data, no blue accents, no rounded corners.

## Concrete Product Output (WhatYouGet)
- **Status:** Added.
- **Decision:** After the pain (DebugStream) and the setup (FirstTrace), the user needs to see exactly what "observability" looks like in 5to1r.
- **Rationale:** The section proves that every run becomes inspectable, breaking it down into four technical primitives: Trace, Cost, Retries, and Failure.
- **Visuals:** Strict technical matrix, no marketing cards, no blue. Uses red/amber only for status indicators (error/retry).
- **Layout:** Hero -> Problem -> DebugStream -> FirstTrace -> WhatYouGet -> UseCases.

## Final CTA (FinalCTA)
- **Status:** Replaced generic banner.
- **Decision:** The final CTA should feel like a final command, not a marketing banner.
- **Decision:** Avoid repeating pricing or features (handled by PricingTeaser).
- **Decision:** Use "Run your first trace" as the headline because the page narrative builds toward immediate activation.
- **Visuals:** Compact terminal-command snippet (`pip install`, `run-agent`, `trace ready`) instead of a generic SaaS banner. Strictly monochrome, no rounded corners.

## Marketing Navbar (Navbar)
- **Status:** Integrated.
- **Decision:** Do not use the provided component template blindly; it required adaptation for 5to1r's strict monochrome and 0px radius design system.
- **Decision:** Use Geist Mono for top-level nav links and Geist Sans for menu item descriptions to maintain technical hierarchy.
- **Decision:** Implement hover-based dropdowns for desktop to minimize click depth for product discovery.
- **Visuals:** Dark backdrop (#0A0A0A with 0.85 opacity), border-bottom (#2A2A2A), no rounded corners even on dropdown panels.

## Custom Auth Pages (AuthShell)
- **Status:** Integrated.
- **Decision:** Remove generic "testimonial" and "floating path" marketing from the auth flow. Auth should feel like entering a production workspace, not a sales pitch.
- **Decision:** Replace testimonials with a looping terminal panel that signals product capability (trace capture, cost awareness) through a technical visual.
- **Decision:** Use Clerk `<SignIn />` and `<SignUp />` with strict appearance overrides to ensure the 0px radius and monochrome palette are maintained in the complex auth UI.
- **Visuals:** Split-screen (45/55), Geist Mono for terminal and form inputs, Geist Pixel for the logo. Zero rounded corners globally.

## Landing Page Navigation Wiring
- **Status:** Integrated.
- **Decision:** Replace all placeholder `#` and `SignUpButton` wrappers with explicit Next.js `Link` components to ensure SEO-friendly, direct routing to `/sign-in` and `/sign-up`.
- **Decision:** Route all "Start free" and "Run your first trace" CTAs to the `/sign-up` page to consolidate the conversion funnel.
- **Decision:** Encode pricing plan selection directly into the URL using query parameters (e.g., `/sign-up?plan=pro`) to allow the onboarding flow to pre-select the user's intent.
- **Decision:** Use an anchor link (`#workspace-terminal`) for the Hero's "View live demo" CTA to keep users on the landing page for initial product education.
