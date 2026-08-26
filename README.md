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
    - **Member Removal & Real-Time Access Revocation (FR-6)**: Workspace Admins can remove existing members from the workspace with a confirmation step, guarded against self-removal. When a user is removed from a private workspace, their access is immediately revoked across all routes (`/[workspaceId]`, `/documents`, etc.), redirecting to the 403 Access Denied page without relying on stale client caches.
    - **Workspace Visibility Settings**: Workspaces can be toggled between **Private** (members only) and **Public** (open access).
    - **Public Workspace Discovery, Search, Pagination & Self-Join**: Public workspaces are discoverable by all users on `/dashboard?tab=public` with real-time keyword search and URL-synchronized pagination. Any authenticated user can view public workspaces as a guest or join with one click, immediately gaining `MEMBER` status and having the workspace pinned to their **"My Workspaces"** dashboard and switcher.
    - **Team Invitations (FR-7)**: Secure invite link generation with tokenized URLs (`/invite/[token]`) for onboarding team members with the `MEMBER` role.
    - **Invitation Expiration & Single-Use (FR-8)**: 24-hour expiration on invitation links with single-use enforcement in database transactions.
    - **Workspace Navigation & Switcher**: Comprehensive top navigation inside workspaces (`WorkspaceNav`) featuring active tab indicators (Overview, Documents, Tasks, Chat, Analytics, Settings) and quick workspace switcher dropdown.
    - **Accessible Dialog Primitive**: Native HTML `<dialog>` modal component built with semantic brand tokens and full keyboard accessibility.
    - **E2E Test Suite**: Comprehensive Playwright test coverage (`e2e/workspace.spec.ts`) validating creation, settings management, deletion confirmation, member removal, immediate private workspace access revocation, visibility toggling (private/public), public workspace search & pagination, self-joining, and invitation expiration.

## Getting Started

1. **Environment Setup**
   Copy `.env.example` to `.env` and fill in your database credentials and `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.

2. **Database Migration**

    ```bash
    npx prisma db push
    npx prisma generate
    ```

3. **Run the Development Server**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser. You will be automatically redirected to the `/login` screen due to the `proxy.ts` auth guard.
