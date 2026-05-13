# Implementation Plan - Monochrome & Design Engineering Refactor

## Objective
Transition the 5to1r observability platform to a strict monochrome visual identity while integrating high-fidelity design engineering principles (Emil Kowalski).

## Design System
- **Palette**: Strict Black (#000000) and White (#FFFFFF). Zinc grays for borders and secondary text.
- **Radius**: 0px globally (sharp corners).
- **Typography**: 
  - Geist Pixel Square for logos.
  - Geist Mono for headers (H1, H2) and buttons.
  - Geist Sans for body text.
- **Motion**:
  - `active:scale(0.97)` for all interactive elements.
  - Custom easing: `cubic-bezier(0.23, 1, 0.32, 1)`.
  - Staggered entrances for list items and feature cards.

## Task Breakdown

### Phase 1: Core Foundation (COMPLETED)
- [x] Update `globals.css` with monochrome tokens.
- [x] Set global radius to `0px`.
- [x] Define custom easing variables.

### Phase 2: Component Refactor (COMPLETED)
- [x] **Button**: Implement `rounded-none`, `font-mono`, and `active:scale-[0.97]`.
- [x] **Card**: Implement `rounded-none`, strict monochrome borders.
- [x] **Dialog**: Implement `rounded-none`, monochrome overlay and background.
- [x] **Badge**: Implement `rounded-none`, `font-mono`, uppercase tracking.
- [x] **Input**: Implement `rounded-none`, `font-mono`, monochrome focus ring.

### Phase 3: Page Overhaul (COMPLETED)
- [x] **Landing Page**: 
  - Overhaul Hero with Geist Pixel logo and staggered animations.
  - Implement dot-grid background.
  - Refactor all sections to use the new Monochrome + Motion spec.
  - Fix Clerk imports (`SignedIn`, `SignedOut`).
- [x] **Dashboard**:
  - Implement staggered grid for project cards.
  - Remove all blue/indigo accents.
  - Update Sidebar with monochrome tokens and sharp corners.
- [x] **Clerk Appearance**: Apply global monochrome theme and 0px radius to Clerk components.

### Phase 4: Final Polish (IN PROGRESS)
- [x] Verify Clerk v7 (Core 3) compatibility (Replaced deprecated components with Show).
- [x] Ensure consistent spacing (4px/8px grid).
- [x] Audit for any remaining non-monochrome colors.
- [x] Successfully build production application (npm run build).
