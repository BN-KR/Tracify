<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

# Documentation Integrity & Memory

**CRITICAL RULE:** You MUST reference and update the project's markdown documentation files at the end of EVERY major task or phase. 
- **`memory.md`**: Update architecture decisions, tech stack changes, and "Recent Important Changes".
- **`task.md`**: Check off completed tasks and add upcoming sub-tasks for the next phase.
- **`implementation_plan.md`**: Update the current active plan or create a new one for the next feature.

Failure to update these files means the project "forgets" its state. ALWAYS read `memory.md` at the start of a session.
