# Admin hub design

## Goal

Give authorized dashboard users one clear Admin entry point that routes them to either the private section library or Payload CMS.

## Experience

- The dashboard Resources group exposes one item: **Admin** (`/admin`).
- `/admin` is protected with the existing shared library-access policy.
- The Admin hub presents two equal, descriptive actions:
  - **Admin Library** links to `/admin/library`.
  - **Payload CMS** links to `/cms`.
- Each destination retains its existing server-side protection. Users without access do not see the dashboard entry and cannot open the hub.

## Implementation

- Replace the two current admin-related sidebar items with one Admin item.
- Add a server-rendered `src/app/(frontend)/admin/page.tsx` that calls `requireLibraryAccess("/admin")` and renders the two links using the dashboard's monochrome, square-corner style.

## Verification

- Run focused ESLint, TypeScript, and diff-hygiene checks.
- Verify an authorized production session sees Admin in the dashboard, the hub exposes both choices, and each link navigates to its intended destination.
