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
    - Kitchen-sink component showcase available at `/design-system`.
    - Base primitives (Button, Input, FormField, Card, Badge, Alert, etc.) established in `src/components/ui/`.

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
