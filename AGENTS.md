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
