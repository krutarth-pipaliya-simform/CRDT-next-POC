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

1. **Authentication Flow (Frontend & Backend)**
    - Custom `login` and `register` pages matching the "Machined Precision" design specification.
    - Robust Next.js 16 Server Actions (`loginAction`, `registerAction`) for handling credentials securely.
    - Route protection established via `proxy.ts` (Next.js 16 middleware replacement).
    - Zod validation at both the client layer and server boundaries.
    - Password hashing with `bcryptjs`.

2. **Database (Prisma)**
    - Configured `schema.prisma` for NextAuth integration (User, Account, Session, VerificationToken) alongside base domain models (Workspace, Document, Task).

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
