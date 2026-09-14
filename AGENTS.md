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

### Visual Language: "Presence First" (Binding)

The product has exactly one organising idea, and every other visual decision is downstream of it.

- **Saturated Colour Means a Person.** The eight `--color-brand-presence-*` hues are the only saturated colour in the product, and they are assigned to people. Anything that is not a person — a status, a category, a button, a chart of counts — is set in ink, paper and the neutral scale.
- **Blue Belongs to the System, and Nothing Else.** `--color-brand-accent` is focus, selection and links. No presence hue is blue, so a warm saturated tone always means "someone" and a cool one always means "the interface is talking to you". The only other exceptions are `--color-brand-danger` for destructive intent and `--color-brand-warning` for attention.
- **Never Pick a Presence Hue by Hand.** Call `presenceVar(userId)` / `presenceTint(userId)` from `src/lib/presence.ts`. The hash guarantees one person keeps one colour across every surface and session, which is the only reason the colour is learnable. `getUserColor()` exists solely for CRDT awareness payloads, which must be theme-independent because a peer renders them on their own screen.
- **Tokens Read at Runtime MUST NOT Live in `@theme`.** Tailwind v4 only emits a theme variable whose name it can find spelled out in the source. `presenceVar()` composes names from a hash and `readChartPalette()` reads values with `getComputedStyle`, so both were silently tree-shaken out of the light build. They are declared as plain custom properties in the `:root` block below `@theme`; put any future runtime-read token there too.
- **One Structural Device: the Rail.** `<PresenceRail>` is a 3px edge that always answers "who?" — never status, never category, never decoration. It segments for multiple people. Do not invent a second ornament that carries the same job.
- **Elevation Is Rationed.** `--shadow-brand-*` is for surfaces that genuinely float: dialogs, menus, a card mid-drag. A resting card sits flat on a `border-brand-border` rule. When every card carries a hard shadow, the shadow stops meaning "raised" and starts meaning "card".
- **Two Voices, and Mono Is Not a Label Font.** Schibsted Grotesk is the product chrome; Newsreader (`font-brand-serif`) is scoped to the document canvas so a document reads like a document. `font-brand-mono` is for real data only — timestamps, ids, counters, tabular figures — and never for buttons, tabs, eyebrows or labels.
- **Sentence Case, No Tracked Caps.** `uppercase tracking-widest` on a label is banned; it made nine different pages share one silhouette. Write UI text the way a person would say it, and name an action by what it does ("Delete document", not "Confirm").
- **Motion Answers an Action.** Menus, dialogs and confirmations may animate because someone asked for them (`animate-pop-in`). The only unprompted motion in the product is the merge demo on the landing page. Do not reintroduce a staggered page-load cascade. Everything honours `prefers-reduced-motion`, and a component that animates must read the preference as a subscription (`useSyncExternalStore`), never with a `setState` inside an effect.
- **Role and Time Labels Come From One Place.** `WORKSPACE_ROLE_LABELS` in `src/schemas/workspace.ts` and the helpers in `src/lib/format-time.ts` are shared. Do not re-declare either inside a feature.

### Server/Client Module Boundaries for Shared Styles (Binding)

- **Style Constants Must Not Live in a `"use client"` Module.** `Button` needs `useFormStatus`, so it is a client component; when a server component imports a value from a client module the bundler returns a client reference and the value arrives `undefined`. This silently rendered every `<LinkButton>` with `class=""`. Shared class maps live in `src/components/ui/button-styles.ts`, which has no `"use client"` directive.

### Theming & Dark Mode Conventions (Binding)

- **Two Palettes, One Component Tree**: Dark mode is a restatement of token _values_ under `[data-theme="dark"]` in `src/app/globals.css`, never a second set of styles. Do NOT use Tailwind's `dark:` variant, and do not branch component markup on the theme — if a surface needs a `dark:` class, the colour it uses should have been a token.
- **Every New Token Needs Both Values**: A `--color-brand-*` added to the `@theme` block MUST also be given a dark value in the `[data-theme="dark"]` block. A token defined in only one place silently breaks one theme.
- **Text on Saturated Fills Uses `--color-brand-on-fill`**: The dark palette's accent and danger are lighter than the light palette's, so white text on them fails contrast. Never hardcode `text-white` on a filled element.
- **The Theme Is Resolved Before Paint**: `THEME_INIT_SCRIPT` in `src/lib/theme.ts` runs synchronously in `<head>` and is the only thing that decides the initial theme. `<html>` keeps `suppressHydrationWarning` because that script rewrites the server-rendered attribute.
- **Never Derive Theme State From the DOM During Render**: `ThemeProvider` reads the preference via `useSyncExternalStore` with a server snapshot so the hydrating render matches the server. Reading `localStorage` or `document.documentElement` in a render (or seeding `useState` from them) reintroduces the hydration mismatch this is built to avoid.
- **Theme Writes Happen Outside the Render Cycle**: A preference change writes `data-theme` synchronously in the handler, before React re-renders. Anything reading resolved tokens back out of the cascade during render would otherwise be one frame stale.
- **Colour Read in JavaScript Takes the Theme as an Argument**: `readChartPalette(theme)` — the resolved theme is an explicit input with a per-theme fallback, so memoising on it declares a real dependency instead of an unused one.

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

### Codebase Consistency & Import Conventions (Binding)

All TypeScript/React source files MUST strictly follow these ordering and naming rules:

1. **Import Order (Top → Bottom)**:
    - **Group 1: External Libraries**: `react` / `react-dom` first, followed by third-party packages alphabetically (`@prisma/*`, `bcryptjs`, `next/*`, `zod`, etc.).
    - **Group 2: Absolute Imports**: Project aliases (`@/...`) sorted alphabetically.
    - **Group 3: Relative Imports**: Parent directories (`../`) before same-directory (`./`), sorted alphabetically.
    - **Group 4: Side-Effect Imports**: CSS styles (`./globals.css`), `server-only`, polyfills always last.
    - Leave **exactly one blank line** between each import group.
    - Sort imports **alphabetically** within each group.
    - Group React hooks together in the React import.
    - Prefer named imports over default imports where available.
    - Avoid deep relative paths; prefer project aliases (`@/...`).
    - Use `import type` for TypeScript-only imports.

2. **Naming & Props Conventions**:
    - Props interfaces/types MUST be named consistently as `<ComponentName>Props` (e.g., `WorkspaceCardProps`, `UserDropdownProps`).
    - File and folder names MUST strictly use `kebab-case`.
    - Components, interfaces, and types MUST strictly use `PascalCase`.
    - Maintain naming consistency across component, file, folder, interface, type, and export names.

### Database Client Singleton Convention (Binding)

- **Single Canonical Client (`db`)**: Always import `db` from `@/lib/db` (`import { db } from "@/lib/db"`).
- **No Duplicate Connection Pools**: Never create secondary `PrismaClient` instances or raw unextended clients. The singleton `db` client in `@/lib/db` manages connection pooling via `@prisma/adapter-pg` and `pg.Pool` (or `prisma://` Accelerate URL) with lazy singleton instantiation.
- **Auth.js Compatibility**: `@auth/prisma-adapter` natively accepts the extended `db` client (`PrismaAdapter(db)`).

### TypeScript & End-to-End Type Safety (Binding)

- **Zero Unsafe Assertions**: Never use `as Type`, `as unknown as`, or non-null assertions `!` to bypass type safety.
- **Runtime Validation First**: Parse unvalidated input (`FormData`, URL search params, request bodies) with Zod schemas (`schema.safeParse(Object.fromEntries(formData.entries()))`) before using data.
- **Discriminated Unions**: All Server Actions and asynchronous procedures must return strictly discriminated unions (`{ success: true, data: ... } | { success: false, error: string }`) to prevent `!` and `as` in client components.
- **DOM Event Narrowing**: Use `event.target instanceof Node` and `e.currentTarget` instead of `event.target as Node` / `as HTMLInputElement`.
- **NextAuth Augmentations**: Extend `Session`, `User`, and `JWT` interfaces in `src/types/next-auth.d.ts` rather than casting `(token.id as string)`.

---

### Workflow Rules

- **Always Read Skills**: Before executing complex tool workflows (like Git operations), you MUST check the `Available skills` list and read the corresponding `SKILL.md` file. You are bound by the instructions within those skills.

---

### Multi-Session Document Concurrency & Read-Only Lock Convention (Binding)

- **Single Active Editor per Account**: A user cannot edit the same document simultaneously from multiple sessions (tabs, windows, or devices) using the same account.
- **Real-Time Read-Only Mode**: When a second session opens a document already active in another tab for that user, it is automatically placed into Read-Only Mode (`editor.setEditable(false)`, disabled title input, disabled toolbar) while continuing to receive live CRDT updates.
- **Session Takeover Protocol**: Read-only sessions display `<ReadOnlyBanner>` allowing the user to click "Take Over Editing", which updates awareness timestamps, promoting that session to active editor and cleanly demoting earlier sessions to read-only.
- **Autosave Suppression**: Secondary/read-only sessions must NEVER trigger autosaves or write to the database to prevent stale overwrites.

### Realtime Chat & Notification Conventions (Binding)

- **PostgreSQL Is the Source of Truth for Chat**: A chat message MUST be persisted by `sendMessageAction` _before_ it is appended to the shared `Y.Array`. The CRDT room (`chat:<workspaceId>`) is a fan-out channel, never the system of record. Clients de-duplicate by database id so the server-rendered history and the CRDT replay converge.
- **One Collaboration Server**: Chat and documents share the standalone Yjs WebSocket server and the `NEXT_PUBLIC_COLLAB_WS_URL` variable. Do NOT introduce a second realtime transport or a bespoke JSON WebSocket protocol.
- **Notifications Are Best-Effort**: All notification emission goes through `notify()` in `src/features/notification/lib/notify.ts`, which writes one row per recipient and then publishes to `notificationBus`. `notify()` logs and swallows its own failures — a notification problem must NEVER fail the mutation that triggered it, so never wrap a mutation's success path in its error handling.
- **Never Notify the Actor**: Every trigger must exclude the user who caused it, via `excludeUserIds` or an explicit `recipientIds` list.
- **Task Notifications Are Centralized**: Every task write path (create, update, move/drag) MUST emit through `notifyTaskChange()` in `src/features/task/lib/notify-task-change.ts` so a task reaching `DONE` or landing on someone's plate is announced identically regardless of entry point.
- **SSE Recipients Come From the Session**: `/api/notifications/stream` MUST derive the recipient from `auth()`, never from a query parameter or header. The stream must send an opening frame, heartbeat regularly, and unsubscribe on `request.signal` abort.
- **Realtime State Must Not Break Hydration**: Client hooks that create a provider only in the browser MUST seed their connection status to a constant (e.g. `"connecting"`) rather than deriving it from the provider. Deriving it produces a server/client mismatch that makes React discard and re-render the tree, which silently drops in-flight user input. See `useWorkspaceChat`.

### Billing, Subscriptions & Stripe Conventions (Binding)

- **Stripe Is the Source of Truth for Entitlement**: The `Subscription` row is a projection of Stripe state, never the origin of it. Plan changes are written by the webhook (`syncSubscriptionToWorkspace` / `downgradeWorkspaceToFree`), never by a client-triggered action optimistically flipping a workspace to `PRO`.
- **Never Trust the Return URL**: A Checkout success URL proves nothing. Attribution comes from the `workspaceId` stamped into the session metadata, the subscription metadata, and `client_reference_id`, and the checkout branch re-fetches the subscription from Stripe rather than trusting the session snapshot.
- **Webhooks Verify the Raw Body**: The handler must read `await request.text()` and pass those exact bytes to `stripe.webhooks.constructEventAsync`. Parsing to JSON first invalidates the signature. `api/webhooks` must stay excluded from the `proxy.ts` matcher so Stripe is never redirected to `/login`.
- **Webhook Delivery Is At-Least-Once**: Every event id is claimed in `StripeWebhookEvent` before any work is done; a duplicate returns 200 without re-applying. A handler failure must release the claim and return 500 so Stripe retries.
- **Entitlement Is Resolved Server-Side, Every Request**: Gate features through `resolveEffectivePlan()` (plan + status), never on `plan === "PRO"` alone, and never on a client-supplied value. A search param that requests a paid capability (e.g. `?range=90d`) must fall back on the server, not merely be hidden in the UI.
- **One Plan Catalog**: Plan names, prices, copy, and per-plan limits live only in `src/features/billing/lib/plans.ts`. UI and entitlement checks both read from it, so a new limit is added in one place.
- **Read Subscription Fields From the Pinned API Version, Not From Memory**: On the version stripe-node pins here (`2026-08-26.dahlia`), the billing period lives on `subscription.items.data[].current_period_end`, and a cancellation booked through the billing portal arrives as a `cancel_at` timestamp with `cancel_at_period_end` still `false`. Both are handled in `sync-subscription.ts`; check the shipped `.d.ts` before trusting an older field name.
- **Stripe Config Is Optional at Boot**: `src/lib/env.ts` keeps the Stripe variables optional and `getStripeContext()` returns a discriminated union. The app must start, build, and run without billing configured — surfaces degrade with a readable notice instead of throwing.

### Analytics & Charting Conventions (Binding)

- **Charts Read the Design System**: ECharts colors come from `readChartPalette()`, which reads the `--color-brand-chart-*` tokens out of the cascade at runtime. Never hardcode hex values in a chart option; add a token in `globals.css` first, exactly as with Tailwind classes.
- **ECharts Is Always Dynamically Imported**: The library loads inside `src/features/dashboard/components/echart.tsx` via `import("echarts")` so its payload never reaches routes that draw nothing. Charts are created once per mount; option changes go through `setOption(option, true)`.
- **Every Chart Carries a Text Summary**: Charts render as `role="img"` with an `aria-label` stating the actual numbers, and headline figures are duplicated in server-rendered `<StatTile>`s so the page is useful before (and without) hydration.
- **Aggregation Queries Guard Themselves**: `getWorkspaceAnalytics` re-checks membership via `getWorkspaceRole` and returns `null` for non-members, independently of the page's own guard.

### Server & Monorepo Build Isolation Convention (Binding)

- **Standalone `server/` Directory**: The Node.js Express collaboration server lives in `server/` with its own `package.json` and `tsconfig.json`.
- **Root `tsconfig.json` Exclusion**: The root `tsconfig.json` MUST exclude `"server"` so Next.js / Vercel builds do not attempt to typecheck Express/Helmet/CORS dependencies from the root Next.js build environment.

---

### Dependency Hygiene (Binding)

- **Install With `--legacy-peer-deps`**: Tiptap's strict `@tiptap/core` peer range means a plain `npm install` fails. Every install in this repo uses `--legacy-peer-deps`.
- **Peer Dependencies Must Be Explicit**: `--legacy-peer-deps` prunes hoisted peers that nothing declares directly. `y-prosemirror` and `highlight.js` were silently removed by an unrelated install and broke the document editor build, so both are now explicit `dependencies`. If an install reports "removed N packages", check the lockfile diff before moving on.

### API Design & Refactoring Instructions

- **Document API Payload Refactoring (Pending)**: In future refactors, update document-related schemas (e.g., `updateDocumentSchema`, `deleteDocumentSchema`, `saveDocumentStateSchema`) to only require the `documentId` (renaming the ambiguous `id` field to `documentId`) and remove `workspaceId` from the client payload. The server should fetch the document by `documentId` to determine its `workspaceId` and verify permissions dynamically. This simplifies the API payload and prevents the client from ever sending mismatched IDs.
