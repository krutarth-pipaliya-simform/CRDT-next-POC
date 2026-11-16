# CRDT Next.js POC

An enterprise-grade collaborative SaaS workspace built with Next.js 16 and React 19.

## Project Tooling & Architecture

- **Framework**: Next.js 16.3.1 (App Router), React 19
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 with the custom "Presence First" design system (see below)
- **Database**: PostgreSQL with Prisma ORM
- **Billing**: Stripe Checkout + Billing Portal, verified webhooks at `/api/webhooks/stripe`
- **Charts**: Apache ECharts, dynamically imported on the analytics route only
- **Typography**: Schibsted Grotesk for product chrome, Newsreader for the document canvas, Geist Mono for data
- **Authentication**: NextAuth v5 (Auth.js) supporting Google OAuth & Email/Password Credentials
- **Formatting**: Prettier (4 spaces, enforced via `.prettierrc`)
- **Git Hooks**: Husky & lint-staged (Formats code, checks types on commit, runs build on push)
- **Workflow**: Strict Git Flow (`feature/`, `chore/`, `docs/`, `bugfix/` branch from `develop`)
- **AI Tooling**: Uses custom Antigravity skills (`.agents/skills/`) for automated branch management, UI design, and agent tuning.

## Design System: "Paddock"

Every page of the product is built in Paddock: off-white paper, olive ink, one acid-lime accent, faint contour-line backgrounds, two-voice display headings (Instrument Serif caps over heavy wide Mona Sans caps), notched-corner cards and a hand-drawn scribble. The pages follow the "Converge — every page in the Paddock style" design canvas, one artboard per route. `/design-system/v2` renders every primitive; `/design-system` (v1) is kept as a record of the previous "Presence First" direction, which Paddock replaced.

| Where                                         | What                                                                                                                                                                                                                                                                                                 |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/layout.tsx`                          | Wraps every route (and the toaster) in `<PaddockRoot>`, which attaches the Paddock fonts and turns on the scoped `.paddock-*` classes                                                                                                                                                                |
| `src/components/paddock/`                     | The primitives: Wordmark, DisplayHeading, Tag, buttons, `BackLink`, fields, RadioCardGroup, NotchedCard, ContourBackground, Scribble, WorkspaceTabs, PillTabs, MenuOverlay, avatars, pills, dialog and more                                                                                          |
| `src/components/layout/`                      | The shell: `SiteHeader` (wordmark, workspace switcher, notification bell, avatar, burger + full-screen menu), `WorkspaceNav` (section tabs + the team), `PageHeader` (the contour hero, with an optional `back` link), and `ShellNotice` / `RouteError` (404, 403 and error panels inside the shell) |
| `src/components/layout/workspace-sections.ts` | The one list of workspace sections, shared by the tab bar and the menu                                                                                                                                                                                                                               |
| `src/app/globals.css` (Paddock block)         | `--color-paddock-*` (with dark values), `--font-paddock-*`, `--radius-paddock*`, `--shadow-paddock-*`, runtime-read people and chart colours in `:root`, and the `.paddock-*` devices                                                                                                                |
| `src/hooks/`                                  | `usePrefersReducedMotion`, `useScrollLock`, `useModalDialog` (native `<dialog>` as a controlled modal; a `data-autofocus` field takes first focus), `useCurrentWorkspace`, and `useDebouncedValue` / `useDebouncedCallback` (trailing debounce, with `flush` / `cancel`)                             |

- **Lime is the system.** Primary actions, selection and the focus ring (lime with an ink outline, because lime is about 1.1:1 on paper). Lime is a fill with dark `on-fill` text, or text on the always-dark `night` / `deep` grounds only.
- **People keep their colour.** Four people hues (coral, amber, cyan, violet), hashed from the user id by `paddockPresenceVar()`, appear on avatars, card rails, chat rails and collaborator carets. Statuses, priorities and charts of counts use ink, neutrals and lime instead.
- **Uppercase is CSS.** Tags and display headings are uppercased by `text-transform`; source text stays in sentence case, so screen readers and tests read words.
- **Motion stops on request.** The menu reveal, drifting recent documents, scribbles, marquee and word reveal all stop under `prefers-reduced-motion`, and the marquee has a pause control.
- **Where you are never looks like where you could go.** The current workspace tab is a lime pill (lime is selection) and ignores hover; the hand-drawn scribble only answers hover and focus on the other tabs.
- **Every page has a way out.** Pages below a top-level section carry a `BackLink` to a real parent route (never browser history): the editor back to Documents, a workspace's overview back to All workspaces, and Profile back to the page it was opened from (`/profile?from=…`, validated server-side as a same-origin path in a workspace the caller can still open). Missing pages and errors render inside the shell (`not-found.tsx` / `error.tsx` at the root, `(dashboard)` and `[workspaceId]` levels) with links out.
- **Charts sit on a night band.** Analytics reads `--color-paddock-chart-*` (lime, paper and neutrals) through `readChartPalette(theme)`.

> **Note on tokens read at runtime.** Tailwind v4 only emits an `@theme` variable whose name appears literally in the source. The people and chart palettes are composed or read at runtime (`paddockPresenceVar()`, `readChartPalette()`), so they are declared as plain custom properties in `:root`, outside `@theme`. Any future runtime-read token belongs there too.

## Current State / Implemented Features

1. **Design System & Component Library**
    - Built a robust, centralized design system utilizing Tailwind v4 `@theme` block in `globals.css`.
    - **Strict Styling Convention**: Usage of raw Tailwind colors (e.g. `bg-blue-500`) is prohibited. All UI must be styled using semantic brand tokens (e.g. `bg-brand-accent`). New colors must be added to the design system first.
    - **Light & Dark Themes**: Every colour is a semantic token, so dark mode is a second set of token values rather than a second set of components — no `dark:` variants anywhere in the tree. `src/app/globals.css` defines the light palette in `@theme` and restates only the values under `[data-theme="dark"]`.
    - Base primitives (Button, LinkButton, Input, FormField, Card, Badge, Alert, Dialog, NavTabs, etc.) established in `src/components/ui/`.
    - **Reusable Navigation Primitive (`NavTabs`)**: Extracted a unified, accessible, and fully configurable navigation tabs component (`src/components/ui/nav-tabs.tsx`) serving as the single source of truth for tabbed routing, workspace sections, settings sub-navigation, and dashboard workspace filter bars with automatic `usePathname()` route matching, explicit `activeValue` support, and WAI-ARIA compliance.

2. **Authentication Flow (Frontend & Backend)**
    - Custom `login` and `register` pages carrying the "Presence First" design language.
    - Robust Next.js 16 Server Actions (`loginAction`, `registerAction`) for handling credentials securely.
    - Full email verification flow using Nodemailer, generating secure 24-hour verification tokens. Users cannot log in until their email is verified.
    - Route protection established via `proxy.ts` (Next.js 16 middleware replacement).
    - Zod validation at both the client layer and server boundaries.
    - Password hashing with `bcryptjs`.

3. **Database (Prisma)**
    - Configured `schema.prisma` for NextAuth integration (User, Account, Session, VerificationToken) alongside the domain models (Workspace, WorkspaceMember, WorkspaceInvitation, Document, Task, Message, Notification) and the billing models (Subscription, StripeWebhookEvent).

4. **User Profile & Account Settings**
    - Comprehensive profile page at `/profile` for users to manage personal details and account preferences.
    - Features Profile Picture Upload (local file storage) supporting JPEG, PNG, and WebP up to 5MB, with image preview before uploading, and removal behind a confirmation dialog.
    - Supports modifying the user's Full Name.
    - Secure Change Password functionality with current password validation.
    - Built with Server Actions and Zod validation.

5. **Universal Landing Page & Navigation**
    - Created a universal marketing landing page at `/` accessible by both authenticated and unauthenticated users.
    - Relocated the authenticated Workspace Selector to `/dashboard`.
    - Enhanced the global navigation bar with a responsive `UserDropdown` component for quick access to Profile Settings and Logout.
    - Built a reusable `LinkButton` component in the design system to ensure all links styled as buttons adhere to the project's aesthetic constraints.

6. **Workspace Management & Collaboration (FR-5 to FR-8)**
    - **Workspace Lifecycle (FR-5)**: Full CRUD support to create, update, and permanently delete workspaces via Server Actions and responsive UI.
    - **Workspace Membership & RBAC (FR-6)**: Automatic `ADMIN` role assignment for workspace creators, with strict Server Action, data layer, query, and layout RBAC verification.
    - **Member Removal & Real-Time Access Revocation (FR-6)**: Workspace Admins can remove existing members from the workspace via an accessible confirmation `<Dialog>` modal, guarded against self-removal. Role badges (`ADMIN`, `MEMBER`) are positioned at the end of the line on every row, and the dialog pattern eliminates row layout shifts (zero CLS). When a user is removed from a private workspace, their access is immediately revoked across all routes (`/[workspaceId]`, `/documents`, etc.), redirecting to the 403 Access Denied page without relying on stale client caches.
    - **Workspace Visibility Settings**: Workspaces can be toggled between **Private** (members only) and **Public** (open access).
    - **Public Workspace Discovery, Search, Pagination & Self-Join**: Public workspaces are discoverable by all users on `/dashboard?tab=public` with real-time keyword search and URL-synchronized pagination. Any authenticated user can view public workspaces as a guest or join with one click, immediately gaining `MEMBER` status and having the workspace pinned to their **"My Workspaces"** dashboard and switcher.
    - **Team Invitations (FR-7)**: Secure invite link generation with tokenized URLs (`/invite/[token]`) for onboarding team members with the `MEMBER` role.
    - **Invitation Expiration & Single-Use (FR-8)**: 24-hour expiration on invitation links with single-use enforcement in database transactions.
    - **Workspace Navigation & Switcher**: Comprehensive top navigation inside workspaces (`WorkspaceNav`) featuring active tab indicators (Overview, Documents, Tasks, Chat, Analytics, Settings) and quick workspace switcher dropdown.
    - **Leave Workspace & Admin Ownership Transfer**:
        - Any regular workspace member (`MEMBER`, `GUEST`) can leave a workspace at any time via an accessible confirmation dialog, immediately revoking their access and removing the workspace from their dashboard and switcher.
        - **Admin Ownership Transfer Guard**: Workspace Admins cannot leave without appointing another active member as the new Admin. The server action enforces this atomically using a database `$transaction` (`db.workspaceMember.update` + `db.workspaceMember.delete`).
        - **Sole Member Edge Case Handling**: If an Admin is the sole member of a workspace, they are prevented from leaving and shown a clear validation dialog prompting them to either invite collaborators first or delete the workspace from the Danger Zone.
        - **Cache Invalidation & Redirection**: All affected route hierarchies (`/[workspaceId]`, `/[workspaceId]/settings`, `/dashboard`, with layout scope) are invalidated upon departure and users are cleanly redirected back to `/dashboard`.
    - **E2E Test Suite**: Comprehensive Playwright test coverage (`e2e/workspace.spec.ts`) validating creation, settings management, deletion confirmation, member removal, immediate private workspace access revocation, visibility toggling (private/public), public workspace search & pagination, self-joining, invitation expiration, member workspace leaving, sole admin leave prevention, and admin ownership transfer leave.

7. **Codebase Consistency & Architectural Hygiene**
    - Standardized 100% of codebase imports across `src/`, `prisma/`, and `e2e/` adhering to strict 4-tier grouping: External Libraries (React first) → Absolute Project Imports (`@/...`) → Relative Imports (`../` before `./`) → Side-Effect Imports (always last).
    - Alphabetical sorting within import groups and unified TypeScript `import type` usage.
    - Normalized all component props interfaces to `<ComponentName>Props` with strict `kebab-case` file naming and `PascalCase` component/type exports.
    - **Unified Database Client Singleton**: Consolidated all database operations across the repository to the canonical `db` client exported from `src/lib/db.ts` (extended with `withAccelerate()` and backed by `@prisma/adapter-pg` with `pg.Pool`), eliminating duplicate connection pools and unextended `rawDb` client instances.
    - **DRY & Reusable Abstractions (Anti-Copy-Paste Protocol)**:
        - Extracted `UserAvatar` (`src/components/ui/user-avatar.tsx`) with centralized initials generation and image fallback logic.
        - Extracted `EmptyState` (`src/components/ui/empty-state.tsx`) and `PageHeader` (`src/components/layout/page-header.tsx`) unifying all workspace and dashboard sub-pages.
        - Extracted `useOutsideClick` (`src/hooks/use-outside-click.ts`) eliminating duplicated DOM event listeners across navigation dropdowns.
        - Extracted `SocialAuthButtons` and `DevVerifyQuickLink` (`src/features/auth/components/`) unifying OAuth sign-in and development verification links across login and registration flows.
        - Unified `WorkspaceCard` (`src/features/workspace/components/workspace-card.tsx`) to support both my-workspaces and public discovery cards seamlessly.
        - Extracted `getAppUrl` (`src/lib/url.ts`) for centralized server-side base URL resolution from request headers.
        - Added dedicated `dry-and-reusability` agent skill (`.agents/skills/dry-and-reusability/SKILL.md`).

8. **Collaborative Document Editor (FR-8, FR-9, FR-10)**
    - **Rich Text Editing Engine (FR-8)**: TipTap v2 over ProseMirror with structured schema support for headings (H1–H4), lists (bullet, ordered, and nested task list / checklist with interactive checkboxes), blockquotes, horizontal rules, inline formatting (bold, italic, underline, strikethrough, inline code, highlight, links), syntax-highlighted code blocks (`lowlight`), and resizable/aligned images.
    - **Interactive UI & Keyboard Navigation**:
        - Fixed formatting toolbar with active state reflection and accessible ARIA roles.
        - Selection-aware floating bubble menu (`EditorBubbleMenu`) for instant inline formatting.
        - Slash Command menu (`/` trigger) supporting keyboard navigation and instant block insertion.
        - Contextual table controls for dynamic row/col insertion, deletion, and header toggling.
        - Live word and character counter in the editor status bar.
    - **Real-Time Multiplayer Collaboration (FR-9)**:
        - Conflict-free collaborative CRDT editing powered by `yjs`, `@tiptap/extension-collaboration`, and `@tiptap/extension-collaboration-cursor`.
        - **Scalable Express 5 Collaboration Server (`server/`)**: Production-ready, modular Express 5 architecture providing:
            - **Layered Architecture**: Encapsulated WebSocket service (`ws-service.ts`), controllers (`health-controller.ts`, `collab-controller.ts`, `info-controller.ts`), and modular routes (`/health`, `/api/collab/stats`, `/`).
            - **Security & Middlewares**: Security headers via `helmet`, configurable CORS via `cors`, structured request logging, and centralized error/404 handling.
            - **Config & Health Probes**: Validated environment configuration via `zod` (`src/config/env.ts`), supporting `/health` diagnostics (uptime, memory, active rooms, connection count) as well as `/health/liveness` and `/health/readiness` probes.
            - **Live CRDT Multiplexing & Observability**: Real-time room multiplexing, sync steps 1/2, awareness broadcasting, and live `/api/collab/stats` room tracking.
            - **Graceful Shutdown**: Intercepts `SIGTERM` / `SIGINT` signals to cleanly drain WebSocket connections and close HTTP servers without data loss.
        - Live Presence Bar displaying active collaborator avatars, deterministic high-contrast user colors, online/offline status, live participant counts, and live remote carets with user name tags.
        - **Multi-Session Document Edit Lock & Read-Only Enforcement**: Prevents simultaneous conflicting edits from multiple tabs or sessions using the same user account. If a document is already open in one session, secondary sessions for that user automatically switch to **Read-Only Mode** (disabling the editor canvas, title input, and formatting toolbar) while continuing to receive live CRDT updates. Includes a prominent `<ReadOnlyBanner>` with an instant **"Take Over Editing"** action and automatic promotion when earlier sessions close.
        - **Document Image Upload & Embedding**: Dedicated `<ImageDialog>` supporting local device image uploads (PNG, JPG, WebP, GIF, SVG up to 5MB) with drag-and-drop, live thumbnail preview, file size metadata, server-side storage at `/api/uploads/documents/`, and web URL embedding with alt text.
        - Offline-first local durability via `y-indexeddb` (`IndexeddbPersistence`), allowing unimpeded editing during network disconnects and commutative merge on reconnect.
    - **Autosave & Persistence (FR-10)**:
        - 5-second dirty-checked autosave interval persisting Yjs binary state snapshots to PostgreSQL via the `saveDocumentAction` Server Action (strictly suppressed during read-only sessions to prevent accidental overwrites). Only one save runs at a time, edits typed while a save is in flight stay dirty for the next one, and pending edits are flushed when the editor unmounts or the page is hidden.
        - The editor does not re-render on every ProseMirror transaction (`shouldRerenderOnTransaction: false`); the toolbar and bubble menu subscribe to one shared `selectFormatState` selector via `useEditorState`, and the word count recounts after a 300 ms pause in typing.
        - Live save status indicator reflecting `Saved`, `Saving...`, `Offline (saved locally)`, and `Failed (retry)` states.
        - In-place collaborative document title editing with real-time propagation.
    - **Workspace Document Management**: Search, filtering, creation modal, and document deletion with accessible confirmation dialogs.
    - **E2E Test Suite**: Comprehensive Playwright test coverage (`e2e/document.spec.ts`) validating document creation, rich text editor mounting, real-time typing, title editing, autosave persistence, workspace listing, multi-session edit prevention, read-only mode enforcement, and session takeover.

9. **Task Management & Kanban Board (Phase 4 / FR-11, FR-12)**
    - **Kanban Board Workflow Engine**: Three-column workflow board (`To Do`, `In Progress`, `Done`) powered by `@dnd-kit/core` and `@dnd-kit/sortable` with droppable column containers, drag overlays, and status indicators.
    - **Drag-and-Drop That Lands Where It Shows**: The target column is the one under most of the dragged card (each column counts as a full-height lane), wherever the card was grabbed; inside it the nearest card picks the slot (`columnOverlapCollision` in `src/features/task/lib/board-dnd.ts`). The card moves between columns mid-drag, so the target column is outlined and the card's ghost sits at the insertion point while the source column closes up. The drop position is computed with the same `arrayMove` the preview uses, saved through `moveTaskAction` with fractional positions (`Float`), applied instantly, and rolled back with a toast if the server refuses. A drag that ends where it started writes nothing, and Escape restores the board.
    - **Keyboard and Screen Readers**: Space picks a card up, arrows move it (Left/Right between columns, Up/Down within one), Space or Enter drops it, Escape cancels; Enter on a resting card opens it. Live-region announcements use task titles and column names. `DndContext` takes a stable `useId()` so its `aria-describedby` ids survive hydration.
    - **Priority Cycling**: One-click priority cycling (`LOW` → `MEDIUM` → `HIGH` → `URGENT` → `LOW`) via `<PriorityBadge>`. The label moves on every click, but only where the clicking stops is saved (`setTaskPriorityAction`, 500 ms debounce): Low to Urgent is three clicks and one request, and a full circle sends none.
    - **Task CRUD & Modal Lifecycle**:
        - Create task modal with key-based form reset and pending state management via `useActionState`.
        - Detailed task inspection and field-level updates in `<TaskDetailDialog>` (title, description, column, priority, assignee, due date).
        - Workspace member assignment with avatar resolution via `<AssigneePicker>`.
        - Task deletion with confirmation safety banner.
    - **Real-Time Search & Filtering**: Fast client-side filtering by task title, description, or assigned collaborator.
    - **Strict Role-Based Access Control (RBAC)**: Admins and Members can create, edit, move, and delete tasks; Guests are restricted to view-only mode with disabled drag, non-interactive badges, and hidden action triggers.
    - **E2E Test Suite**: Comprehensive Playwright test suite (`e2e/task.spec.ts`) with 8 scenarios verifying empty state, task creation, priority cycling, detail editing, search filtering, drag-and-drop column transition, deletion confirmation, and guest RBAC enforcement. `e2e/task-dnd.spec.ts` adds 5 drag scenarios: a cross-column drop between two cards (outline, ghost and stored order), a same-column move landing where the preview showed it, column choice by overlap when grabbed near the card's edge, a drag ending on its own slot writing nothing, and a keyboard move between columns.

10. **Team Chat, Presence & Notifications (Phase 5 / FR-13, FR-14)**
    - **Realtime Workspace Chat**: A `#general` channel per workspace at `/[workspaceId]/chat`, backed by the same standalone Yjs collaboration server as the document editor (room `chat:<workspaceId>`). PostgreSQL is the source of truth — `sendMessageAction` persists the message first, then the author appends it to a shared `Y.Array` that fans it out to every connected client. Messages are de-duplicated by database id, so the server-rendered history and the CRDT replay converge on one list.
    - **Optimistic Message Delivery**: Messages render immediately in a `sending` state, swap to the persisted row on success, and fall back to an inline `Not sent / Retry` affordance on failure — no message is ever silently lost.
    - **Online Presence & Typing Indicators**: Yjs awareness drives a live participant bar (deterministic per-user colors via the shared `getUserColor` palette, overflow chip, and connection status) plus a debounced typing indicator. Typing flags are re-derived on a timer so a peer who goes quiet expires correctly instead of appearing stuck.
    - **Composer Ergonomics**: Auto-growing textarea, `Enter` to send / `Shift+Enter` for a newline, a 2000-character limit with a counter that appears near the threshold, and `@mention` support.
    - **SSE Notification Stream**: `GET /api/notifications/stream` is an authenticated Server-Sent Events route handler. The recipient is taken from the session — never the request — so a client cannot subscribe to another user's notifications. It sends an opening `ready` frame, 25-second heartbeat comments to defeat proxy buffering, and unsubscribes cleanly on `request.signal` abort. The client reconnects automatically on error, backing off from 5 s to a minute. A burst of notifications triggers one `router.refresh()` (750 ms debounce), and only the header bell refreshes, so the activity page's second stream does not double it.
    - **Notification Bell & Activity Feed**: A bell in the site header shows a live unread badge, a dropdown of recent notifications with a per-item read state, `Mark all read`, and a live-connection dot. Each workspace also has an `/[workspaceId]/activity` feed listing that user's workspace activity, read and unread alike.
    - **Notification Triggers**: `TASK_ASSIGNED` (on creation and on reassignment, never to the actor), `TASK_COMPLETED` (any path into the `Done` column, including a drag), `DOCUMENT_CREATED`, `MEMBER_JOINED` (invite link and public self-join), and `MENTION` (chat `@mentions` resolved against workspace display names and email handles).
    - **Best-Effort Delivery**: `notify()` fans out one persisted row per recipient and then publishes to an in-process bus. Failures are logged and swallowed, so a notification problem can never fail the mutation that triggered it.
    - **Strict RBAC**: Admins and Members can post; Guests read the channel with the composer replaced by a join prompt. `getWorkspaceMessages` and `getWorkspaceActivity` each re-verify membership independently of the calling page.
    - **E2E Test Suite**: Playwright coverage (`e2e/chat.spec.ts`) with 8 scenarios verifying channel rendering, message persistence across reloads, Enter/Shift+Enter behaviour, guest read-only mode, cross-session realtime broadcast, cross-session typing indicators, SSE-driven mention notifications reaching the bell and the activity feed, and workspace-scoped `Mark all read`.

11. **Billing & Analytics Dashboard (Phase 6 / FR-15, FR-16)**
    - **Stripe Checkout (Free / Pro)**: Each workspace carries its own subscription. `createCheckoutSessionAction` (admin-only) creates or reuses the workspace's Stripe customer, then opens a hosted Checkout Session for the Pro price. The workspace id is stamped into the session metadata, the subscription metadata, and `client_reference_id`, so the payment is attributed server-side rather than from the success URL.
    - **Stripe Billing Portal**: Once a workspace has a Stripe customer, admins get a `Manage Billing` action that opens the hosted portal for card updates, invoices, and cancellation. Cancellations return as webhooks.
    - **Webhook Handler (`POST /api/webhooks/stripe`)**: Verifies the `stripe-signature` header against the raw request body (`await request.text()` — parsing first would invalidate the signature). It handles `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`; the checkout branch re-fetches the subscription from Stripe rather than trusting the session snapshot. `api/webhooks` is excluded from the `proxy.ts` matcher so Stripe is never redirected to `/login`.
    - **Verified Against Live Test-Mode Stripe**: The full lifecycle was exercised end to end — hosted Checkout paid with test card `4242…`, `checkout.session.completed` flipping the workspace to `PRO/ACTIVE`, a portal-booked cancellation landing as `customer.subscription.updated`, and an immediate cancellation landing as `customer.subscription.deleted` and dropping the workspace back to Free with the 90-day analytics range re-locked.
    - **Replay-Safe by Construction**: Every event id is claimed in the `StripeWebhookEvent` table before any work happens, so Stripe's retries become no-ops; if a handler throws, the claim is released and a 500 invites Stripe to retry.
    - **Entitlement Is Server-Resolved**: `resolveEffectivePlan()` collapses plan + status into the plan a workspace may actually use, so a `PAST_DUE` or `CANCELED` Pro workspace silently reads as Free everywhere. `getWorkspaceSubscription` re-verifies membership independently of the calling page.
    - **ECharts Analytics Dashboard**: `/[workspaceId]/analytics` renders a completion-rate gauge, a daily activity series (tasks created, tasks completed, documents, messages), a status donut, a priority bar chart, and a contributor leaderboard. ECharts is imported dynamically inside the chart host, so its ~300KB payload only loads on this route, and each chart is a `role="img"` with a summary label for assistive technology.
    - **Design-System-Driven Charts**: Chart colors are read out of the `--color-brand-chart-*` tokens at runtime via `readChartPalette()` instead of being hardcoded, so the charts follow the design system rather than duplicating it.
    - **Plan Gating on Analytics History**: Free workspaces get the 7-day window; the 30- and 90-day tabs render disabled with a `Pro` badge. A hand-typed `?range=90d` is refused on the server and falls back to 7 days, so the gate is not merely a UI affordance.
    - **E2E Test Suite**: Playwright coverage (`e2e/billing.spec.ts`) with 7 scenarios verifying the Free plan view with its upgrade path, an active Pro subscription with a portal entry point, non-admin lockout from billing settings, analytics tiles plus all five ECharts widgets reaching a ready state, Free-plan range locking with server-side fallback, the 90-day range unlocked on Pro, and the empty-activity state.

12. **Theming & Dark Mode**
    - **Three-State Preference**: A header control offers Light, Dark, and System. `system` is a first-class stored choice, not a hidden default, and follows the OS live — changing the system appearance while `system` is selected re-themes the open page without a reload.
    - **No Flash Before Hydration**: `THEME_INIT_SCRIPT` (`src/lib/theme.ts`) runs synchronously in `<head>`, reading `localStorage` and stamping `data-theme` on `<html>` before the browser paints, following the Next.js 16 [preventing-flash-before-hydration](./node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md) guide. `<html>` carries `suppressHydrationWarning` because the script changes the attribute the server rendered.
    - **Hydration-Safe State**: `ThemeProvider` reads the preference through `useSyncExternalStore` with a server snapshot, so the hydrating render matches the server exactly and the real value is adopted immediately afterwards — no `setState` in an effect, no mismatch.
    - **Theme Applied Outside the Render Cycle**: A change writes `data-theme` to the document synchronously in the event handler before React re-renders, so consumers that read resolved tokens back out of the cascade during render (the ECharts widgets) never paint one frame behind.
    - **Charts Follow the Theme**: `readChartPalette(theme)` takes the resolved theme as an explicit input and carries a per-theme fallback set, so every chart re-derives its colours from the live tokens when the theme flips.
    - **Cross-Surface Coverage**: Sonner toasts receive the resolved theme explicitly (`AppToaster`); Kanban column tints, task priority badges, the collaborative editor, code blocks (which stay dark in both themes to match the bundled highlight.js theme), and hard-edged shadows all have dark values. Shadows are tokenised via `--color-brand-shadow` so the "Machined Precision" hard shadow stays visible on a dark ground.
    - **Cross-Tab Sync**: A change in one tab propagates through the `storage` event; other tabs re-theme without a reload.
    - **E2E Test Suite**: Playwright coverage (`e2e/theme.spec.ts`) with 6 scenarios verifying OS-default resolution in both directions, switching and persistence across a hard reload, an explicit choice overriding the OS, the init script shipping inside `<head>` ahead of any body content, returning to `system` and picking up a live OS change, and the control exposing an accessible radio group.

13. **PRD Gap Closure (Password Reset, Five-Column Board, Enterprise Billing, Analytics Export)**
    - **Password Reset (FR-3)**: `/forgot-password` emails a one-hour, single-use link to `/reset-password`. Tokens reuse the Auth.js `VerificationToken` table under a `password-reset:<email>` identifier and are stored as SHA-256 hashes, so neither a database read nor a verification token can be redeemed as a reset. The request form answers identically whether or not the address has an account and rate-limits to one email a minute; redemption deletes the token inside the transaction that sets the password, so two concurrent redemptions cannot both succeed. Following the link also verifies an unverified email. Accounts created with Google or GitHub can use it to set a first password. The development quick link is never returned in production.
    - **`APP_URL`**: links in emails and Stripe return URLs are built from `APP_URL` when set, instead of the client-controlled `Host` header (which would let an attacker point a victim's reset link at another site).
    - **Five Kanban Columns (FR-15)**: Backlog → To Do → In Progress → Review → Completed (`TaskStatus` gained `BACKLOG` and `REVIEW`; `DONE` keeps its value and is labelled "Completed"). Columns, status pills, the status donut and keyboard movement all derive from `COLUMN_ORDER`.
    - **Enterprise Plan & Plan Changes (FR-19, FR-21)**: Free / Pro / Enterprise. Enterprise unlocks a 12-month analytics range and is sold through `STRIPE_ENTERPRISE_PRICE_ID` (optional; without it the plan is listed but not for sale). A paying workspace switches between Pro and Enterprise in place (`changeSubscriptionPlanAction`: an upgrade is invoiced for the prorated difference immediately, a downgrade credits the next invoice) and can cancel at period end or take the cancellation back (`setCancelAtPeriodEndAction`) behind a confirmation dialog. The webhook now reads the plan off the subscription's Stripe price (`planForPriceId`), so a portal plan switch also lands correctly.
    - **Invoice & Payment History (FR-21)**: the billing page lists the workspace's last 24 invoices (number, period, amount, status, hosted page and PDF) and payments (card, amount, refunds, receipt), read live from Stripe for admins only.
    - **Analytics Zoom, Export & User Growth (FR-17, FR-18)**: time-series charts zoom by wheel, pinch, drag or a slider; every chart has PNG and CSV download buttons (CSV cells that would run as spreadsheet formulas are neutralised); a new **Member growth** chart plots members over time from `WorkspaceMember.joinedAt`. The legend toggles series, and the date range remains the server-enforced filter.
    - **Monitoring (FR-23)**: `@sentry/nextjs` 11 (the line whose peer range covers Next 16) tracks frontend exceptions, API failures and performance. Everything is optional: with no `NEXT_PUBLIC_SENTRY_DSN` the SDK is never initialised and the app starts, builds and runs exactly as before; without `SENTRY_AUTH_TOKEN` source-map upload is skipped silently. Browser init lives in `src/instrumentation-client.ts` (page-load and navigation spans, web vitals, optional error-only Session Replay behind `NEXT_PUBLIC_SENTRY_REPLAY`); Node and edge init run from `src/instrumentation.ts`, whose `onRequestError` captures Server Component, Route Handler and Server Action errors. The `error.tsx` boundaries (through `RouteError`) and the new `global-error.tsx` report browser errors once (errors with a digest were already captured on the server). The unexpected-failure `catch` blocks in Server Actions and route handlers call `reportError()` from `src/lib/report-error.ts`, which logs and captures; validation errors, auth refusals and "Stripe not configured" are never reported. Tracing defaults to a 10% sample (`NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`). Privacy: no cookies, headers, request bodies, query strings or automatic user fields are collected; the user is the opaque id (set by `SentryScope` in the dashboard layout) and the workspace id is a tag.
    - **E2E**: `e2e/password-reset.spec.ts` (3 scenarios) plus new billing/analytics scenarios for Enterprise history, plan-card actions, the cancel dialog, billing history, and CSV/PNG export. `E2E_PORT=3001 npm run test:e2e` runs the suite against a server on another port.
    - **Headless CMS Content (PRD 11)**: blog articles, product announcements, documentation and release notes are read from a Strapi v5 REST API (`src/features/cms/`), not hardcoded. Public pages: `/blog`, `/blog/[slug]`, `/announcements`, `/docs`, `/docs/[slug]` (grouped by section), `/changelog`; a latest-announcement strip appears on the landing page and dashboard. Bodies are Strapi Blocks JSON rendered by React (no raw HTML; unsafe link schemes are dropped). Responses are Zod-validated, cached for five minutes and tagged `cms`; `POST /api/cms/revalidate` (shared secret `CMS_REVALIDATE_SECRET`) lets a Strapi publish webhook refresh them. Content-type definitions and setup steps live in `cms/`.

## Getting Started

1. **Environment Setup**
   Copy `.env.example` to `.env` and fill in your database credentials and `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.

2. **Database Migration**

    ```bash
    npx prisma db push
    npx prisma generate
    ```

3. **Run the Development & Collaboration Servers**

    `npm run dev` starts both the Next.js app and the collaboration WebSocket server (port 1234) via `concurrently`. The collaboration server backs both the document editor and workspace chat, so real-time features need it running.

    ```bash
    # Runs Next.js and the collaboration WebSocket server together
    npm run dev

    # Or run them separately
    npm run dev:next
    npm run collab:dev
    ```

    Point the browser at the collaboration server with `NEXT_PUBLIC_COLLAB_WS_URL` (defaults to `ws://<current-host>:1234` when unset).

4. **Billing (Stripe)**

    Checkout, the billing portal, and the webhook stay disabled until all three variables are set in `.env`:

    ```bash
    STRIPE_SECRET_KEY="sk_test_..."
    STRIPE_WEBHOOK_SECRET="whsec_..."   # printed by `stripe listen`
    STRIPE_PRO_PRICE_ID="price_..."     # a recurring price on the Pro product
    STRIPE_ENTERPRISE_PRICE_ID="price_..."  # optional: a recurring price for Enterprise
    ```

    Forward webhooks to the app while developing:

    ```bash
    stripe listen --forward-to localhost:3000/api/webhooks/stripe
    ```

    Without these, the billing page renders a "Stripe is not configured" notice and the upgrade button is disabled — the rest of the app is unaffected.

5. **Headless CMS (Strapi)**

    Optional. Set `CMS_API_URL` and `CMS_API_TOKEN` (and `CMS_REVALIDATE_SECRET` for the publish webhook) in `.env`; see `cms/README.md` for the content types and token. Without them the content pages show a "Content is not set up" notice and everything else works. No Strapi instance? Run the fixture: `node e2e/fixtures/cms-server.mjs` and use `CMS_API_URL="http://localhost:4103"`, `CMS_API_TOKEN="fixture-token"`. `npm run test:e2e` starts the fixture on port 4103 automatically (`E2E_CMS_PORT` overrides it).

6. **Monitoring (Sentry, optional)**

    Set `NEXT_PUBLIC_SENTRY_DSN` (see `.env.example` for the rest). To verify in development, open `/sentry-test` (404 in production) and press the buttons: a client error, a render error and a server route error each appear as an issue in your Sentry project within a minute, and page loads appear under Performance when traced. `NEXT_PUBLIC_*` values are inlined at build time, so rebuild after changing them. With `tunnelRoute` active, browser events go through `/monitoring` on this origin, which `proxy.ts` excludes from the login redirect.

Open [http://localhost:3000](http://localhost:3000) with your browser. You will be automatically redirected to the `/login` screen due to the `proxy.ts` auth guard.

## Known Limitations (Headless CMS)

- **Verified against a fixture, not a live Strapi.** The response shape and query syntax follow Strapi's v5 REST docs (flat attributes plus `documentId`, `meta.pagination`, `sort[0]`, `pagination[page]`, `filters[slug][$eq]`), but only `e2e/fixtures/cms-server.mjs` was exercised. The Blocks list `format` values (`ordered` / `unordered`) and block field names come from `@strapi/blocks-react-renderer`, whose README does not spell them all out.
- **Unknown or malformed blocks are skipped silently** rather than failing the page.
- **Missing slugs return HTTP 200** with the not-found page, because the route group streams a loading skeleton first (the page carries `noindex`). Remove `(content)/loading.tsx` if a true 404 status matters more than the skeleton.
- **No cover images, localisation, draft preview or search.** Body images work; articles have no cover field.
- **Changes appear within five minutes** unless the revalidation webhook is wired up. The webhook invalidates every CMS response, not just the entry that changed.
- **The CMS is a single origin trusted for content**: `ctaUrl` and links are restricted to http(s), mailto and site-relative paths, but content authors are assumed to be staff.

## Known Limitations (Monitoring)

- **Verified against a local stand-in, not a real Sentry project.** A browser error, a server route error and server/browser spans were confirmed arriving as envelopes at a local HTTP listener used as the DSN host. Issue grouping, source-map upload and the `/monitoring` tunnel rewrite (which needs a real `*.ingest.sentry.io` DSN) were not exercised.
- **The standalone collab server in `server/` is not instrumented.** It has its own package and runtime; add `@sentry/node` there if its errors matter.
- **Chat and notification code paths still use `console.error`** (`src/features/chat/**`, `notify.ts`, the notification bus): they were being edited elsewhere. Swap them to `reportError` when convenient.
- **No root `error.tsx`.** Only the `(dashboard)` and `[workspaceId]` boundaries and `global-error.tsx` exist; errors on public pages fall through to `global-error.tsx`.
- Sentry 11 has no `sendDefaultPii`; privacy is configured through `dataCollection` (`SENTRY_DATA_COLLECTION` in `src/lib/sentry-config.ts`).

## Known Limitations (PRD Gap Closure)

- **Sessions for deleted accounts end within a minute**, not instantly: the `jwt` callback re-checks the user at most once a minute to avoid a database read on every `auth()` call. Creating a workspace in that window reports "Your session has ended" and signs the session out.

- **A password reset does not sign other devices out.** Sessions are JWTs, so a token issued before the reset stays valid until it expires. Revoking them needs a per-user token version checked in the `jwt` callback.
- **Reset requests have a small timing difference.** An existing account takes longer to answer (token write and email send) than an unknown one; the copy is identical, but the timing is not padded.
- **`joinedAt` was backfilled to the date of the schema push**, so member growth is only accurate for people who joined afterwards. Members who leave disappear from the series rather than being subtracted on their leave date.
- **"Professional" is labelled "Pro"** in the product, as before.
- **Enterprise cannot be bought until `STRIPE_ENTERPRISE_PRICE_ID` is set**; no Enterprise price was created in the Stripe account.
- **Zoom is pointer-only.** The ECharts slider cannot be operated from the keyboard; the same data is available through the CSV export and each chart's text label.

## Known Limitations (Design System)

- **Document cards show no editors.** A document card carries no presence rail because the schema records no author or last-editor on `Document` — only `updatedAt`. Adding `lastEditedById` (written on save) would let a document wear the hues of the people who touched it, which is the one place the language is currently silent.
- **The workspace nav shows the roster, not live presence.** The avatars in the workspace bar are everyone with access, not everyone currently online, because workspace-wide awareness would mean a second CRDT connection on every route. Live presence is shown where it is real: the document editor and chat.
- **Carets are coloured on the viewer's screen.** Awareness payloads stay theme-independent (`getUserColor()`), but the editor draws each peer's caret and selection in that person's Paddock hue, looked up from the user id in the payload, so the caret matches their avatar. A payload without an id falls back to the colour it carried.

## Known Limitations (Paddock)

- Paddock has four people colours. With more than four people, two will share a colour.
- Some artboard details have no data behind them yet and were left out rather than faked: plan names and edit times on workspace cards, faces on discover-public cards, collaborators and live counts on document cards, the editor's "next deadline", the chat's "mentioned in this chat" panel and its formatting tools, and member counts on the invite card. Contributor bars on analytics are neutral because the analytics query exposes member ids, not user ids.
- The document toolbar is sticky at 89px, which assumes the header stays 81px tall.
- `/design-system/v2` is in `publicRoutes` (`src/lib/routes.ts`), so it opens without signing in. `/design-system` (v1) still needs a signed-in session.
- The word reveal starts words at 18% opacity until they scroll into view. This only happens where scroll-driven animations are supported and reduced motion is off. A contrast audit taken mid-scroll can flag those words.
- Native `<dialog>` keeps focus inside the page, but Tab can still reach the browser's own controls. This is the platform's behaviour and satisfies the WAI-ARIA dialog pattern.
- **Pre-existing test failure:** `e2e/document.spec.ts` › "should prevent simultaneous editing…" fails on this branch and on the commit before the reskin alike. `use-document-collab.ts` starts every session editable, so a second session always resolves to `taken_over` and shows "Editing session taken over", never "Read-only mode active". Starting a session read-only until the first awareness sync would fix it.
- `html` always reserves the scrollbar gutter, so a full-screen overlay leaves a paper-coloured strip where the scrollbar would be.

## Known Limitations (Theming)

- **The preference is per-browser, not per-account.** It lives in `localStorage`, so a new device or a cleared profile starts from the OS setting. Storing it on the `User` row would let the server render the right theme on the first byte, at the cost of a session read in the root layout.
- **No `prefers-color-scheme` fallback in CSS.** The dark palette is keyed entirely to `[data-theme="dark"]`, which the init script always resolves. If that script is blocked (a strict CSP without a nonce), the app stays light for a dark-mode visitor rather than degrading to their OS preference.
- **No high-contrast or dimmed variants.** Two themes only; the token layer would support more without touching components.

## Known Limitations (Phase 6)

- **Plan gating is limited to analytics history.** Pro unlocks the 30- and 90-day windows; nothing else in the product is metered. Member seats, document counts, and storage are deliberately unlimited on both plans, so the entitlement surface stays small enough to reason about.
- **`checkout.session.completed` is not the only handled event.** The phase called for one webhook, but adding the Stripe billing portal means a cancellation arrives as `customer.subscription.deleted` and a card change as `customer.subscription.updated`. All three are handled on the single endpoint; without the latter two the portal could silently desync the database from Stripe.
- **No proration, seats, or annual pricing.** One recurring price, one subscription per workspace. Upgrading a workspace that already has an active Pro subscription is refused rather than modified.
- **"Task completed" is inferred from `updatedAt`.** The schema has no completion timestamp, so a `DONE` task edited later re-dates its completion in the activity series. The completion rate and status mix, which read the current board, are exact.
- **Charts are client-rendered.** ECharts needs a DOM, so the widgets draw after hydration and are not present in the server HTML. The stat tiles above them are server-rendered and carry the same headline numbers.
- **No billing notifications.** A plan change is not announced through the `notify()` bus; adding it would mean a new `NotificationType` enum value and icon mapping, which was out of scope for this phase.

## Known Limitations (Phase 5)

Deliberate scope cuts, recorded so the trade-offs are explicit rather than accidental:

- **Single-process notification fan-out.** `src/lib/notification-bus.ts` is an in-memory pub/sub hub, so an SSE reader only receives events published by the _same_ Node process. Notifications are always persisted to PostgreSQL first, so nothing is lost — a reader on another instance simply sees them on next render instead of instantly. Horizontal scaling needs a shared broker (Redis pub/sub, Postgres `LISTEN/NOTIFY`) behind the same `notificationBus` interface.
- **SSE needs a long-lived server.** The stream route sets `maxDuration = 300` and heartbeats every 25s, which suits a Node server. On a platform that caps request duration more aggressively, the client's auto-reconnect covers the gap but delivery becomes near-realtime rather than realtime.
- **Chat history is not paginated.** The channel loads the most recent 50 messages and the shared CRDT array is capped at 300 entries. There is no infinite scroll into older history; the full record lives in PostgreSQL.
- **`@mentions` resolve by display name, not by a picker.** Mentions match a member's display name, their name's first word, or their email's local part. There is no autocomplete UI and no disambiguation between two members with the same first name — the first registered match wins.
- **No per-user notification preferences.** Every trigger notifies every eligible member; there is no muting, digesting, or per-type opt-out.

### Pre-existing issue (not introduced by Phase 5 or Phase 6)

`e2e/document.spec.ts` → _"should prevent simultaneous editing from multiple sessions and enforce read-only mode with takeover capability"_ fails against a local collaboration server. Verified to fail identically at commit `c8a424c`, before any Phase 5 work. A likely contributor is that `useDocumentCollab` seeds `connectionStatus` from `provider`, which is `null` during SSR and non-null on the client, producing a hydration mismatch that discards and re-renders the tree. The equivalent bug in `useWorkspaceChat` was fixed by always seeding `"connecting"`; the document hook was left alone as out of scope for both phases. It was re-confirmed as the only failing test after Phase 6 (41 passed, 1 failed).
