# CRDT Next.js POC

An enterprise-grade collaborative SaaS workspace built with Next.js 16 and React 19.

## Project Tooling & Architecture

- **Framework**: Next.js 16.3.1 (App Router), React 19
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 with a custom "Machined Precision" aesthetic
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth v5 (Auth.js) supporting Google OAuth & Email/Password Credentials
- **Formatting**: Prettier (4 spaces, enforced via `.prettierrc`)
- **Git Hooks**: Husky & lint-staged (Formats code, checks types on commit, runs build on push)
- **Workflow**: Strict Git Flow (`feature/`, `chore/`, `docs/`, `bugfix/` branch from `develop`)
- **AI Tooling**: Uses custom Antigravity skills (`.agents/skills/`) for automated branch management, UI design, and agent tuning.

## Current State / Implemented Features

1. **Design System & Component Library**
    - Built a robust, centralized design system utilizing Tailwind v4 `@theme` block in `globals.css`.
    - **Strict Styling Convention**: Usage of raw Tailwind colors (e.g. `bg-blue-500`) is prohibited. All UI must be styled using semantic brand tokens (e.g. `bg-brand-accent`). New colors must be added to the design system first.
    - Base primitives (Button, LinkButton, Input, FormField, Card, Badge, Alert, Dialog, NavTabs, etc.) established in `src/components/ui/`.
    - **Reusable Navigation Primitive (`NavTabs`)**: Extracted a unified, accessible, and fully configurable navigation tabs component (`src/components/ui/nav-tabs.tsx`) serving as the single source of truth for tabbed routing, workspace sections, settings sub-navigation, and dashboard workspace filter bars with automatic `usePathname()` route matching, explicit `activeValue` support, and WAI-ARIA compliance.

2. **Authentication Flow (Frontend & Backend)**
    - Custom `login` and `register` pages matching the "Machined Precision" design specification.
    - Robust Next.js 16 Server Actions (`loginAction`, `registerAction`) for handling credentials securely.
    - Full email verification flow using Nodemailer, generating secure 24-hour verification tokens. Users cannot log in until their email is verified.
    - Route protection established via `proxy.ts` (Next.js 16 middleware replacement).
    - Zod validation at both the client layer and server boundaries.
    - Password hashing with `bcryptjs`.

3. **Database (Prisma)**
    - Configured `schema.prisma` for NextAuth integration (User, Account, Session, VerificationToken) alongside base domain models (Workspace, Document, Task).

4. **User Profile & Account Settings**
    - Comprehensive profile page at `/profile` for users to manage personal details and account preferences.
    - Features Profile Picture Upload (local file storage) supporting JPEG, PNG, and WebP up to 5MB, with image preview before uploading and removal.
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
        - Dedicated standalone WebSocket collaboration server (`server/src/index.ts` via `npm run collab:dev`) providing room multiplexing, sync steps 1/2, and awareness broadcasting.
        - Live Presence Bar displaying active collaborator avatars, deterministic high-contrast user colors, online/offline status, and live remote carets with user name tags.
        - Offline-first local durability via `y-indexeddb` (`IndexeddbPersistence`), allowing unimpeded editing during network disconnects and commutative merge on reconnect.
    - **Autosave & Persistence (FR-10)**:
        - 5-second dirty-checked autosave interval persisting Yjs binary state snapshots to PostgreSQL via the `saveDocumentAction` Server Action.
        - Live save status indicator reflecting `Saved`, `Saving...`, `Offline (saved locally)`, and `Failed (retry)` states.
        - In-place collaborative document title editing with real-time propagation.
    - **Workspace Document Management**: Search, filtering, creation modal, and document deletion with accessible confirmation dialogs.
    - **E2E Test Suite**: Comprehensive Playwright test coverage (`e2e/document.spec.ts`) validating document creation, rich text editor mounting, real-time typing, title editing, autosave persistence, and workspace listing.

## Getting Started

1. **Environment Setup**
   Copy `.env.example` to `.env` and fill in your database credentials and `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.

2. **Database Migration**

    ```bash
    npx prisma db push
    npx prisma generate
    ```

3. **Run the Development & Collaboration Servers**
    ```bash
    # Terminal 1: Run the Next.js web application
    npm run dev

    # Terminal 2 (Optional for real-time multiplayer WebSocket sync):
    npm run collab:dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser. You will be automatically redirected to the `/login` screen due to the `proxy.ts` auth guard.
