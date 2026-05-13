# Conventions

- **React / Next.js**: Use Server Components by default. Keep Client Components at the leaf nodes. Follow Vercel's React performance best practices.
- **Styling**: Tailwind CSS with standard `shadcn/ui` components. Use `clsx` and `tailwind-merge` for conditional classes.
- **Data Access**: 
  - Convex for real-time reads and transactional writes (UI state).
  - Tinybird for high-volume reads and writes (Telemetry/Analytics).
- **File Structure**: Feature-based colocation where possible inside `src/app`. Keep lib utilities in `src/lib`.
- **Typing**: Strict TypeScript. Always define input/output types.
