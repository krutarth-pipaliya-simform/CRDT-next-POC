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
- **Semantic Tokens**: You MUST use the Paddock tokens (e.g., `bg-paddock-lime`, `text-paddock-danger`, `border-paddock-rule`). The older `--color-brand-*` tokens remain only for the v1 showcase at `/design-system` and the v1 primitives in `src/components/ui/`; do not use them in product surfaces.
- **Extending the System**: If a required color or design token does not exist, you must first define it in `src/app/globals.css` in the Paddock `@theme` block as a `--color-paddock-*` variable, give it a dark value in the Paddock `[data-theme="dark"]` block, and then consume it in the UI.

### Visual Language: "Paddock" (Binding)

The product's design language is Paddock: paper `#F4F4ED`, olive ink, one acid-lime accent, faint contour lines, two-voice headings (Instrument Serif caps over heavy wide Mona Sans caps), notched cards and a hand-drawn scribble. `/design-system/v2` renders every primitive. It replaced "Presence First" when the product was reskinned page by page from the "Converge — every page in the Paddock style" design canvas; `/design-system` (v1) is kept as a record of the previous direction.

- **Build From the Paddock Primitives.** Product UI is composed from `src/components/paddock/` (buttons, fields, dialogs, cards, tabs, avatars, pills, chat, notification rows, plan cards) and the shell in `src/components/layout/`. The v1 primitives in `src/components/ui/` are not used by product pages. `ThemeToggle` is the exception: it lives in `ui/` and is Paddock-styled, with `surface="paper" | "night"`.
- **Every Route Is Inside `<PaddockRoot>`.** The root layout wraps all routes (and the toaster) in it, which attaches the two Paddock fonts and turns on the scoped `.paddock-*` classes. Do not add a second root.
- **The Shell Is Shared.** `SiteHeader` (wordmark, `WorkspaceSwitcher`, `NotificationBell`, avatar, `AppMenu` burger + `MenuOverlay`), `WorkspaceNav` (`WorkspaceTabs` + the team's `AvatarStack`) and `PageHeader` (the contour-backed two-voice hero, props `serif` / `heavy` / `eyebrow` / `description` / `meta` / `action`) are the only page chrome. Workspace sections come from `workspaceSections()` in `workspace-sections.ts`, so the tab bar and the menu cannot disagree. `PageHeader` is full-bleed: render it outside the page's `PAGE_CONTAINER` column.
- **Lime Is the System.** Lime is primary actions, selection and the focus ring. It is a fill with `paddock-on-fill` text, or text on `night` / `deep` grounds only. Lime is about 1.1:1 on paper, so the focus ring is lime with an ink outline outside it (`--paddock-focus-edge` switches that edge to lime on night grounds). `--color-paddock-danger` is destructive intent and `--color-paddock-warning` is attention.
- **Two Kinds of Dark.** `paddock-ink` / `paddock-inverse` flip with the theme; use them for text, strokes and selected fills. `paddock-night` / `paddock-deep` stay dark in both themes; use them for inverted bands, the menu and the toolbar. Never put lime text on an ink fill, because ink turns light in dark mode.
- **People Keep Their Colour.** Paddock has four people hues (coral, amber, cyan, violet), assigned by `paddockPresenceVar(userId)` / `paddockPresenceTint()` / `paddockCaretVar()` in `src/components/paddock/paddock-presence.ts`, never by hand. `PaddockAvatar` / `AvatarStack` render a person (with their uploaded photo when there is one). Statuses, priorities, categories and charts of counts are not people, so they use ink, neutrals and lime. With more than four people two will share a hue; that is accepted. `getUserColor()` in `src/lib/presence.ts` still exists solely for CRDT awareness payloads, which must be theme-independent because a peer renders them on their own screen.
- **Tokens Read at Runtime MUST NOT Live in `@theme`.** Tailwind v4 only emits a theme variable whose name it can find spelled out in the source. Names composed from a hash (`--color-paddock-presence-*`, `--color-paddock-caret-*`) and values read with `getComputedStyle` (chart colours) are declared as plain custom properties in `:root`, outside `@theme`; put any future runtime-read token there too.
- **Uppercase Is CSS, Never Source.** Tags and display headings are uppercase through `text-transform` (`.paddock-tag`, `.paddock-serif`, `.paddock-heavy`). Write the source in sentence case, so a screen reader hears words, not letters, and tests can select by the sentence. A two-voice heading's accessible name is "serif heavy" ("Your" + "workspaces" = "Your workspaces").
- **Mono Is for Real Data.** `.paddock-mono` (Geist Mono) is for timestamps, ids, counters and tabular figures, never for buttons, tabs or labels.
- **Elevation Is Rationed.** `--shadow-paddock-*` is for surfaces that genuinely float: dialogs, menus, dropdowns, a card mid-drag. Cards use a notch or a hairline rule, not a shadow.
- **Motion Stops on Request.** Paddock's menu reveal, rising menu items, drifting recent-document columns, scribbles, marquee and word reveal may move unprompted, but every one of them stops under `prefers-reduced-motion`, and anything that loops longer than five seconds has a pause control (WCAG 2.2.2). Read the preference with `usePrefersReducedMotion` (`src/hooks/`), never with a `setState` inside an effect.
- **Scoped, Unlayered CSS.** The `.paddock-*` voices, devices and keyframes only apply under `.paddock-root`. They are unlayered on purpose: the global `:focus-visible`, `::selection` and theme-transition rules are unlayered, and an unlayered rule beats any layered utility. These classes never set `font-size`, so a size utility on the same element never competes with them.
- **Modals Use `useModalDialog`.** It drives a native `<dialog>` as a controlled modal: inert background, Escape, backdrop click, scroll lock via `useScrollLock`, and focus returned to the trigger. `PaddockDialog` and `MenuOverlay` are built on it; use it for any new modal instead of hand-rolling a focus trap.
- **Current Is Not Hover.** A selected item gets a marker hover never produces: the current `WorkspaceTabs` tab is a lime pill with `paddock-on-fill` text and ignores hover, and the hand-drawn scribble answers hover and focus on the other tabs only.
- **Every Page Has a Way Out.** A page below a top-level section passes `back` to `PageHeader` (or renders `BackLink`) pointing at a real parent route, resolved on the server; links to Profile go through `profileHref(pathname)` so it can link back. Missing pages and errors render inside the shell through `ShellNotice` / `RouteError` from the `not-found.tsx` / `error.tsx` files at the root, `(dashboard)` and `[workspaceId]` levels. In this Next version `error.tsx` receives `retry`.
- **Role and Time Labels Come From One Place.** `WORKSPACE_ROLE_LABELS` in `src/schemas/workspace.ts` and the helpers in `src/lib/format-time.ts` are shared. Do not re-declare either inside a feature.

### Server/Client Module Boundaries for Shared Styles (Binding)

- **Style Constants Must Not Live in a `"use client"` Module.** When a server component imports a value from a client module the bundler returns a client reference and the value arrives `undefined`. This once silently rendered every `<LinkButton>` with `class=""`. Shared class maps live in modules with no `"use client"` directive: `src/components/paddock/paddock-styles.ts` (which also holds the `CssVariableStyle` type), `src/components/layout/layout-styles.ts` (`PAGE_CONTAINER`), `src/components/layout/workspace-sections.ts`, and v1's `src/components/ui/button-styles.ts`.

### Theming & Dark Mode Conventions (Binding)

- **Two Palettes, One Component Tree**: Dark mode is a restatement of token _values_ under `[data-theme="dark"]` in `src/app/globals.css`, never a second set of styles. Do NOT use Tailwind's `dark:` variant, and do not branch component markup on the theme — if a surface needs a `dark:` class, the colour it uses should have been a token.
- **Every New Token Needs Both Values**: A `--color-paddock-*` added to the Paddock `@theme` (or `:root`) block MUST also be given a dark value in the Paddock `[data-theme="dark"]` block. A token defined in only one place silently breaks one theme.
- **Text on Lime and People Hues Uses `--color-paddock-on-fill`**: It stays dark in both themes because lime and the people hues stay light in both. Text on `paddock-inverse` uses `paddock-on-inverse`; text on danger uses `paddock-on-danger`. Never hardcode `text-white` or `text-black` on a filled element.
- **The Theme Is Resolved Before Paint**: `THEME_INIT_SCRIPT` in `src/lib/theme.ts` runs synchronously in `<head>` and is the only thing that decides the initial theme. `<html>` keeps `suppressHydrationWarning` because that script rewrites the server-rendered attribute.
- **Never Derive Theme State From the DOM During Render**: `ThemeProvider` reads the preference via `useSyncExternalStore` with a server snapshot so the hydrating render matches the server. Reading `localStorage` or `document.documentElement` in a render (or seeding `useState` from them) reintroduces the hydration mismatch this is built to avoid.
- **Theme Writes Happen Outside the Render Cycle**: A preference change writes `data-theme` synchronously in the handler, before React re-renders. Anything reading resolved tokens back out of the cascade during render would otherwise be one frame stale.
- **Colour Read in JavaScript Takes the Theme as an Argument**: `readChartPalette(theme)` — the resolved theme is an explicit input with a per-theme fallback, so memoising on it declares a real dependency instead of an unused one.
- **The Toaster Is Themed Through Sonner's Variables**: `AppToaster` maps Sonner's `--normal-*` / `--error-*` variables onto Paddock tokens and sits inside `<PaddockRoot>` so toasts inherit the fonts.

---

### Reusable Components & DRY Architecture (Binding)

- **Reuse Before Create**: Check the Paddock primitives in `src/components/paddock/` and the shell in `src/components/layout/` before creating new components.
- **Extend Backward-Compatibly**: If an existing component is missing a capability, extend its props in a backward-compatible manner rather than duplicating similar UI or logic.
- **Single Source of Truth**: Shared navigation, tab bars, forms, dialogs, and headers must consume centralized primitives (such as `<WorkspaceTabs>`, `<PageHeader>` and `<PaddockDialog>`) across all feature pages.

---

### Real-Time Server-Side Authorization & Cache Invalidation (Binding)

- **Strict Server-Side RBAC**: Authorization must always be validated dynamically on the server on every request. Never rely on stale client router cache.
- **The Proxy Is Only the Optimistic Check**: `proxy.ts` redirects signed-out visitors early, but every protected page must also check the session itself: `requireUserId(returnTo)` from `src/features/auth/lib/session.ts` for account pages, `verifyWorkspaceRole()` (which calls it) for workspace pages, and `auth()` in every Server Action. Never put the only auth check in a layout; layouts do not re-run on navigation.
- **Server Actions Answer Their Own Auth Failures**: `proxy.ts` does not redirect a POST carrying the `Next-Action` header, because a redirect to `/login` is not a valid action result and drops the page into its error boundary with no explanation. Every action therefore MUST check `auth()` (or a guard that does) and return a readable error; the only unguarded actions are the public auth flows.
- **A Session Outlives Nothing**: the `jwt` callback in `auth.ts` re-checks at most once a minute that the token's user still exists and returns `null` (clearing the cookie) when it does not; a failed lookup keeps the session. An action that discovers a missing user (Prisma `P2003` on the user foreign key) calls `signOut({ redirect: false })` before returning, so its "Log in" link is not bounced back by the proxy.
- **Failures Say Why**: an action's error names the cause and what to do next, separates field errors from request errors, logs unexpected errors with `console.error`, and returns what was typed so the form can keep it (as `defaultValue`, never by remounting the field, which loses focus).
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

### Kanban Drag-and-Drop Conventions (Binding)

- **The Preview Is the Promise.** The task lands exactly where its ghost was shown: the drop index comes from the same `arrayMove` the sortable strategy previews with, and a cross-column move happens in `onDragOver`, mid-drag, so the ghost and the column outline are in the target column. A drag that ends where it started writes nothing.
- **Overlap Picks the Column.** Target selection lives in `columnOverlapCollision` and arrow-key movement in `boardKeyboardCoordinates` (`src/features/task/lib/board-dnd.ts`); extend those rather than swapping in a built-in strategy. Each `SortableContext` has `id={status}`, which is how a card is tied to its column.
- **Keys and Ids.** Space picks a card up and Enter opens it. `DndContext` gets a stable `useId()` so its `aria-describedby` ids match across hydration.

### Debouncing & Editor Rendering (Binding)

- **Debounce Through `src/hooks/`.** Use `useDebouncedValue` / `useDebouncedCallback` (with `flushOnUnmount` for writes the user expects to land). A control that repeats a write (the priority badge) updates its label per click and saves the final target value once.
- **The Editor Re-Renders on Selected State Only.** `useEditor` runs with `shouldRerenderOnTransaction: false`; anything that shows editor state reads it through `useEditorState` with a selector (toolbar and bubble menu share `selectFormatState`).
- **Autosave Is Single-Flight.** `performSave` joins an in-flight save, clears the dirty flag only if no edit arrived during it, and flushes on unmount and on page hide.
- **One Refresher per Page.** The header bell's notification stream refreshes the router (debounced); any other `useNotificationStream` consumer passes `refreshOnNotification: false`.

### Realtime Chat & Notification Conventions (Binding)

- **PostgreSQL Is the Source of Truth for Chat**: A chat message MUST be persisted by `sendMessageAction` _before_ it is appended to the shared `Y.Array`. The CRDT room (`chat:<workspaceId>`) is a fan-out channel, never the system of record. Clients de-duplicate by database id so the server-rendered history and the CRDT replay converge.
- **One Collaboration Server**: Chat and documents share the standalone Yjs WebSocket server and the `NEXT_PUBLIC_COLLAB_WS_URL` variable. Do NOT introduce a second realtime transport or a bespoke JSON WebSocket protocol.
- **Notifications Are Best-Effort**: All notification emission goes through `notify()` in `src/features/notification/lib/notify.ts`, which writes one row per recipient and then publishes to `notificationBus`. `notify()` logs and swallows its own failures — a notification problem must NEVER fail the mutation that triggered it, so never wrap a mutation's success path in its error handling.
- **Never Notify the Actor**: Every trigger must exclude the user who caused it, via `excludeUserIds` or an explicit `recipientIds` list.
- **Task Notifications Are Centralized**: Every task write path (create, update, move/drag) MUST emit through `notifyTaskChange()` in `src/features/task/lib/notify-task-change.ts` so a task reaching `DONE` or landing on someone's plate is announced identically regardless of entry point.
- **SSE Recipients Come From the Session**: `/api/notifications/stream` MUST derive the recipient from `auth()`, never from a query parameter or header. The stream must send an opening frame, heartbeat regularly, and unsubscribe on `request.signal` abort.
- **Realtime State Must Not Break Hydration**: Client hooks that create a provider only in the browser MUST seed their connection status to a constant (e.g. `"connecting"`) rather than deriving it from the provider. Deriving it produces a server/client mismatch that makes React discard and re-render the tree, which silently drops in-flight user input. See `useWorkspaceChat`.

### Billing, Subscriptions & Stripe Conventions (Binding)

- **Stripe Is the Source of Truth for Entitlement**: The `Subscription` row is a projection of Stripe state, never the origin of it. Plan changes are written through `syncSubscriptionToWorkspace` / `downgradeWorkspaceToFree` from a subscription Stripe returned (the webhook, or the response to an in-place plan change), never by a client-triggered action optimistically flipping a workspace to a paid plan.
- **Never Trust the Return URL**: A Checkout success URL proves nothing. Attribution comes from the `workspaceId` stamped into the session metadata, the subscription metadata, and `client_reference_id`, and the checkout branch re-fetches the subscription from Stripe rather than trusting the session snapshot.
- **Webhooks Verify the Raw Body**: The handler must read `await request.text()` and pass those exact bytes to `stripe.webhooks.constructEventAsync`. Parsing to JSON first invalidates the signature. `api/webhooks` must stay excluded from the `proxy.ts` matcher so Stripe is never redirected to `/login`.
- **Webhook Delivery Is At-Least-Once**: Every event id is claimed in `StripeWebhookEvent` before any work is done; a duplicate returns 200 without re-applying. A handler failure must release the claim and return 500 so Stripe retries.
- **Entitlement Is Resolved Server-Side, Every Request**: Gate features through `resolveEffectivePlan()` (plan + status), never on `plan === "PRO"` alone, and never on a client-supplied value. A search param that requests a paid capability (e.g. `?range=90d`) must fall back on the server, not merely be hidden in the UI.
- **One Plan Catalog**: Plan names, prices, copy, and per-plan limits live only in `src/features/billing/lib/plans.ts`. UI and entitlement checks both read from it, so a new limit is added in one place.
- **Read Subscription Fields From the Pinned API Version, Not From Memory**: On the version stripe-node pins here (`2026-08-26.dahlia`), the billing period lives on `subscription.items.data[].current_period_end`, and a cancellation booked through the billing portal arrives as a `cancel_at` timestamp with `cancel_at_period_end` still `false`. Both are handled in `sync-subscription.ts`; check the shipped `.d.ts` before trusting an older field name.
- **The Plan Comes From the Price**: `syncSubscriptionToWorkspace` sets `plan` from `planForPriceId(stripePriceId)`; never from what the client asked for. Paid plans are `PRO` and `ENTERPRISE` (`paidPlanSchema`); entitlement for both goes through `resolveEffectivePlan()`.
- **Paying Workspaces Change Plan In Place**: Checkout is only for a Free workspace. Switching Pro ⇄ Enterprise uses `changeSubscriptionPlanAction` and cancellation uses `setCancelAtPeriodEndAction`; both write the row from the subscription Stripe returns, which the webhook later writes again identically. Billing mutations and reads share the `getManagedSubscription()` guard (session, admin role, Stripe config).
- **Billing History Is Read Live**: invoices and payments come from Stripe on each visit (`getBillingHistory`); nothing about them is stored locally.
- **Stripe Config Is Optional at Boot**: `src/lib/env.ts` keeps the Stripe variables optional and `getStripeContext()` returns a discriminated union. The app must start, build, and run without billing configured — surfaces degrade with a readable notice instead of throwing.

### Analytics & Charting Conventions (Binding)

- **Charts Read the Design System**: ECharts colors come from `readChartPalette()`, which reads the `--color-paddock-chart-*` tokens (declared in the Paddock `:root` block, each with a dark value) out of the cascade at runtime. Charts sit on a `paddock-night` band, so the chart tokens are tuned for night in both themes and use only lime, paper and neutrals — counts are not people. Never hardcode hex values in a chart option; add a token in `globals.css` first, exactly as with Tailwind classes.
- **ECharts Is Always Dynamically Imported**: The library loads inside `src/features/dashboard/components/echart.tsx` via `import("echarts")` so its payload never reaches routes that draw nothing. Charts are created once per mount; option changes go through `setOption(option, true)`.
- **Every Chart Carries a Text Summary**: Charts render as `role="img"` with an `aria-label` stating the actual numbers, and headline figures are duplicated in server-rendered `<StatTile>`s so the page is useful before (and without) hydration.
- **Time Series Zoom, Every Chart Exports**: a chart with a date axis uses `timeSeriesZoom(palette)` and leaves `SLIDER_SPACE` at the bottom of its grid. Pass `exportable={{ title, csv }}` to `EChart` so the chart gets PNG and CSV buttons; build CSV with `toCsv()` from `chart-export.ts`, which guards against spreadsheet formula injection. A translucent token colour is made with `withAlpha(token, alpha)`, never a literal.
- **Aggregation Queries Guard Themselves**: `getWorkspaceAnalytics` re-checks membership via `getWorkspaceRole` and returns `null` for non-members, independently of the page's own guard.

### Headless CMS Content (Binding)

- **Strapi v5 REST Is the Source of Truth for Marketing Content**: blog articles, announcements, docs and release notes come from `src/features/cms/`; never hardcode such content. Config is optional at boot: `getCmsContext()` (server-only, over the pure `resolveCmsContext`) returns a discriminated union and pages render `ContentNotice` instead of throwing.
- **One Client**: every CMS call goes through `fetchCollection` / `fetchBySlug` in `lib/cms-client.ts` (token server-side only, `next: { revalidate, tags: ["cms", "cms:<collection>"] }`, Zod-validated envelope, `CmsResult` union with `notConfigured`). New content types add a schema in `schemas/content.ts`, a collection id in `CMS_COLLECTIONS` and a query in `queries/get-content.ts`, and a `cms/schemas/<name>/schema.json` definition.
- **Caching Uses the Pre-Cache-Components Model**: `cacheComponents` is not enabled, so use `fetch` `next.revalidate` / `next.tags` and `revalidateTag(tag, "max")`; do not add `use cache` here without enabling it app-wide.
- **Rich Text Is Blocks JSON Rendered by React**: `BlocksRenderer` never injects HTML. Every CMS URL passes `safeLinkUrl` / `safeImageUrl`. Do not add `dangerouslySetInnerHTML` for CMS content.
- **Public Paths Live in `src/lib/routes.ts`**: `publicRoutePrefixes` + `isPublicPath()` cover `/blog`, `/docs`, `/changelog`, `/announcements` and their children. `api/cms` is excluded in the `proxy.ts` matcher so the Strapi webhook is never redirected to `/login`; the route authenticates with `CMS_REVALIDATE_SECRET` (constant-time compare).
- **Content Sections Come From One List**: `CONTENT_SECTIONS` (`lib/content-sections.ts`) drives the section tabs, landing header/footer and menu footer links.
- **E2E Uses a Fixture CMS**: `e2e/fixtures/cms-server.mjs` (port 4103, `E2E_CMS_PORT`) is a second Playwright `webServer`; the config passes `CMS_API_URL` / `CMS_API_TOKEN` / `CMS_REVALIDATE_SECRET` to Next. The app never references the fixture.

### Server & Monorepo Build Isolation Convention (Binding)

- **Standalone `server/` Directory**: The Node.js Express collaboration server lives in `server/` with its own `package.json` and `tsconfig.json`.
- **Root `tsconfig.json` Exclusion**: The root `tsconfig.json` MUST exclude `"server"` so Next.js / Vercel builds do not attempt to typecheck Express/Helmet/CORS dependencies from the root Next.js build environment.

---

### Account Recovery & Email Links (Binding)

- **Reset Tokens Are Hashed and Namespaced**: password reset tokens live in `VerificationToken` with identifier `password-reset:<email>` and the SHA-256 of the emailed token; only `src/features/auth/lib/password-reset-tokens.ts` reads or writes them. Redemption claims the token with a conditional delete in the same transaction that sets the password.
- **No Account Enumeration**: the forgot-password action answers the same way for unknown addresses, during the cooldown, and on success.
- **Email Links Come From `APP_URL`**: `getAppUrl()` prefers `APP_URL` over the `Host` header. Set it in every deployed environment.
- **Dev-Only Links Stay Dev-Only**: a reset link is returned to the browser only when `NODE_ENV !== "production"`, regardless of SMTP configuration.

### Kanban Columns (Binding)

- **`COLUMN_ORDER` Is the Board**: Backlog, To Do, In Progress, Review, Completed. Status labels, select options, pills and chart ordering read from `TASK_STATUS_LABELS` / `COLUMN_ORDER` (`src/features/task/types.ts`); `DONE` is the completion state that notifications and analytics key on.

### Local Testing

- **The Dev Server Must Restart After a Schema Change**: `@prisma/client` is loaded once per process, so after `prisma db push` + `prisma generate` a running `next dev` rejects new enum values until restarted.
- **E2E on Another Port**: `E2E_PORT=3001 npm run test:e2e` targets a server on that port. The collab server also reads `PORT`, so a custom port is passed to `next dev --port`, never through `PORT`.

### Dependency Hygiene (Binding)

- **Install With `--legacy-peer-deps`**: Tiptap's strict `@tiptap/core` peer range means a plain `npm install` fails. Every install in this repo uses `--legacy-peer-deps`.
- **Peer Dependencies Must Be Explicit**: `--legacy-peer-deps` prunes hoisted peers that nothing declares directly. `y-prosemirror` and `highlight.js` were silently removed by an unrelated install and broke the document editor build, so both are now explicit `dependencies`. If an install reports "removed N packages", check the lockfile diff before moving on.

### API Design & Refactoring Instructions

- **Document API Payload Refactoring (Pending)**: In future refactors, update document-related schemas (e.g., `updateDocumentSchema`, `deleteDocumentSchema`, `saveDocumentStateSchema`) to only require the `documentId` (renaming the ambiguous `id` field to `documentId`) and remove `workspaceId` from the client payload. The server should fetch the document by `documentId` to determine its `workspaceId` and verify permissions dynamically. This simplifies the API payload and prevents the client from ever sending mismatched IDs.
