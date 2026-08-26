<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

### Project Documentation & Context Rules

- **README.md Currency**: At the end of every feature or significant change, you MUST update `README.md` to reflect the latest project state.
- **AGENTS.md Currency**: You MUST keep `AGENTS.md` updated with any new context, rules, or environment changes so future agent chat sessions inherit the full historical context.

---

### Architecture Specification (Binding)

The file `docs/architecture-review.md` is the **authoritative technical specification** for this project.

**All AI agents MUST:**

1. **Read `docs/architecture-review.md` before writing feature code.**
2. **Follow the folder structure (Section 13).** Features go in `src/features/<feature-name>/`.
3. **Use `proxy.ts` (Never `middleware.ts`).**
4. **Always `await` params, cookies(), and headers().**
5. **Validate all inputs with Zod schemas.**

---

### Styling Conventions (Binding)

- **Design System First**: DO NOT use raw Tailwind color classes directly in components (e.g., `bg-blue-500`, `text-red-600`).
- **Semantic Tokens**: You MUST use semantic brand tokens defined in the design system (e.g., `bg-brand-accent`, `text-brand-danger`).
- **Extending the System**: If a required color or design token does not exist, you must first define it in `src/app/globals.css` inside the `@theme` block as a `--color-brand-*` variable (or similar brand token), and then consume it in the UI.

---

### Reusable Components & DRY Architecture (Binding)

- **Reuse Before Create**: Check existing UI primitives in `src/components/ui/` and layout components in `src/components/layout/` before creating new components.
- **Extend Backward-Compatibly**: If an existing component is missing a capability, extend its props in a backward-compatible manner rather than duplicating similar UI or logic.
- **Single Source of Truth**: Shared navigation, tab bars, forms, dialogs, and headers must consume centralized primitives (such as `<NavTabs>`) across all feature pages.

---

### Real-Time Server-Side Authorization & Cache Invalidation (Binding)

- **Strict Server-Side RBAC**: Authorization must always be validated dynamically on the server on every request. Never rely on stale client router cache.
- **Force Dynamic on Protected Layouts**: Workspace layouts and protected routes must specify `export const dynamic = "force-dynamic"` and `export const revalidate = 0`.
- **Query Authorization Guards**: Database queries (such as `getWorkspace`) must independently enforce caller permissions via `getWorkspaceRole` so unauthorized data can never leak.
- **Layout Invalidation on Membership Changes**: All membership and visibility mutations must call `revalidatePath` with `"layout"` across affected route hierarchies (`revalidatePath("/[workspaceId]", "layout")`, `revalidatePath("/dashboard", "layout")`).

---

### Workflow Rules

- **Always Read Skills**: Before executing complex tool workflows (like Git operations), you MUST check the `Available skills` list and read the corresponding `SKILL.md` file. You are bound by the instructions within those skills.
