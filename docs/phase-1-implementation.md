# Implementation Plan: Collaborative SaaS Workspace (Phase 1)

## Goal Description
Execute **Phase 0 (Validation)** and **Phase 1 (Foundation)** of the approved Architecture Review. 
This lays the groundwork for the Next.js 16 application, including documentation enforcement, infrastructure scaffolding (PostgreSQL via Docker), Prisma ORM setup with the complete schema, environment variable validation, and a robust Authentication layer using Auth.js v5 (beta) and Next.js 16 `proxy.ts`.

## User Review Required
> [!IMPORTANT]
> - **Dependency Conflict:** The previous `npm install` failed due to Tiptap peer dependency mismatches. We will proceed using `--legacy-peer-deps` to force installation of the required CRDT packages, which is standard when mixing beta/latest text editor extensions.
> - **Database Schema:** Please review the proposed Prisma schema below to ensure it aligns with the expected data model for Workspaces, Tasks, and Documents.

## Open Questions
> [!WARNING]
> - **OAuth Credentials:** We are setting up Google OAuth. You will need to provision a Google Cloud OAuth Client ID and Secret to test this flow locally, though Email/Password credentials will work out of the box.

---

## Proposed Changes

### 1. Documentation & Rules
Store the architectural decisions in the repository to bind all future agent sessions.
#### [NEW] `docs/architecture-review.md`
- Save the approved architecture review with relative repository paths.
#### [MODIFY] `AGENTS.md`
- Append the binding "Architecture Specification" section directing agents to follow `docs/architecture-review.md`.
#### [MODIFY] `.prettierignore`
- Add `docs` to prevent Prettier from mangling markdown tables and Mermaid diagrams.

### 2. Dependencies & Infrastructure
Resolve package conflicts and setup local services.
#### [MODIFY] `package.json`
- Install dependencies using `npm install --legacy-peer-deps` to bypass Tiptap's `@tiptap/core` strict peer requirements.
- Add `next-auth@beta` for Auth.js v5.
#### [NEW] `docker-compose.yml`
- Setup a local PostgreSQL 16 container (`postgres:16-alpine`) mapping to port 5432.
#### [NEW] `.env.example`
- Define required variables: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `NEXT_PUBLIC_WS_URL`.

### 3. Core Utilities & Data Access
Establish type-safe environment variables and the Prisma singleton.
#### [NEW] `src/lib/env.ts`
- Zod schema for validating `process.env` at startup.
#### [NEW] `src/lib/db.ts`
- Prisma Client singleton to prevent connection exhaustion during Next.js hot-reloads.
#### [NEW] `prisma/schema.prisma`
- Initialize the database schema with the following core models:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// --- Auth.js Models ---
model User { ... }
model Account { ... }

// --- Domain Models ---
model Workspace {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  members   WorkspaceMember[]
  documents Document[]
  tasks     Task[]
}

model WorkspaceMember {
  id          String    @id @default(cuid())
  workspaceId String
  userId      String
  role        Role      @default(MEMBER)
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum Role {
  ADMIN
  MEMBER
  GUEST
}

model Document { ... }
model Task { ... }
```

### 4. Authentication Layer
Implement Next.js 16 compatible authentication using Auth.js v5.
#### [NEW] `src/auth.ts`
- Configure NextAuth with `Google` and `Credentials` providers.
- Configure JWT session strategy and token callbacks to include user IDs.
#### [NEW] `src/app/api/auth/[...nextauth]/route.ts`
- Export `GET` and `POST` handlers from `src/auth.ts`.
#### [NEW] `proxy.ts` (Next.js 16 Middleware)
- Export the `auth` middleware to protect all routes except public assets, `/login`, and `/register`.
- *Note: using `proxy.ts` strictly follows Next.js 16 deprecation of `middleware.ts`.*

---

## Verification Plan

### Automated Tests
```bash
# 1. Verify TypeScript compilation
npm run type-check

# 2. Verify Prisma schema validity
npx prisma validate

# 3. Verify Docker spins up
docker compose up -d && sleep 5 && docker compose ps
```

### Manual Verification
1. Run `npm run dev`.
2. Navigate to `http://localhost:3000`. You should be immediately redirected to `http://localhost:3000/api/auth/signin` (or your custom login page once built) by the `proxy.ts` guard.
3. Check terminal logs to ensure `src/lib/env.ts` validates environment variables on startup without crashing.
