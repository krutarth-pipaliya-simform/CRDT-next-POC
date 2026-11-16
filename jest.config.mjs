import nextJest from "next/jest.js";

// `next/jest` wires the Next.js (SWC) compiler, stylesheet / image / next/font
// mocks and `.env` loading. See node_modules/next/dist/docs/01-app/02-guides/testing/jest.md.
const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
    // Pure modules run in node; hooks and components opt in to jsdom with a
    // `@jest-environment jsdom` docblock at the top of the test file.
    testEnvironment: "node",
    setupFiles: ["<rootDir>/jest.env.ts"],
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

    // Unit tests are colocated with the source as `*.test.ts(x)`. Everything
    // else (Playwright specs in e2e/, the standalone collab server, build
    // output and sibling git worktrees under .claude/) is never a unit test.
    roots: ["<rootDir>/src"],
    testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}"],
    testPathIgnorePatterns: [
        "/node_modules/",
        "<rootDir>/e2e/",
        "<rootDir>/server/",
        "<rootDir>/.next/",
        "<rootDir>/.claude/",
    ],
    modulePathIgnorePatterns: [
        "<rootDir>/.next/",
        "<rootDir>/.claude/",
        "<rootDir>/server/",
    ],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
        // `server-only` throws outside a React Server environment.
        "^server-only$": "<rootDir>/jest.server-only.ts",
    },

    clearMocks: true,
    coverageProvider: "v8",
    coverageDirectory: "coverage",
    coverageReporters: ["lcov", "text-summary", "text"],

    // WHAT THE 80% MEASURES: the unit-testable logic of the app, not every
    // file. Included: shared libs, Zod schemas, hooks, stores, each feature's
    // lib/stores/hooks/schemas, the Paddock/layout modules and presentational
    // primitives. Server Actions (`actions/`), DB queries (`queries/`), route
    // files (`src/app/**`) and feature components are not globbed in at all:
    // they need a real Postgres / Next runtime and are exercised end to end by
    // Playwright (e2e/). Each exclusion below says why.
    collectCoverageFrom: [
        "src/lib/**/*.{ts,tsx}",
        "src/schemas/**/*.ts",
        "src/hooks/**/*.ts",
        "src/stores/**/*.ts",
        "src/features/*/lib/**/*.ts",
        "src/features/*/schemas.ts",
        "src/features/*/schemas/**/*.ts",
        "src/features/*/stores/**/*.{ts,tsx}",
        "src/features/*/hooks/**/*.ts",
        "src/features/*/types.ts",
        "src/components/paddock/**/*.{ts,tsx}",
        "src/components/layout/**/*.{ts,tsx}",

        // Type declarations and test files hold no runtime code.
        "!**/*.d.ts",
        "!**/*.test.{ts,tsx}",
        // Yjs / WebSocket collab hooks: need a live provider; e2e covers them.
        "!src/features/chat/hooks/use-workspace-chat.ts",
        "!src/features/chat/hooks/use-chat-read-receipts.ts",
        "!src/features/document/hooks/use-document-collab.ts",
        // EventSource-backed hook: covered by the notification e2e flow.
        "!src/features/notification/hooks/use-notification-stream.ts",
        // Static fixture data for the /design-system showcase, no behaviour.
        "!src/features/design-system/**",
        // Prisma client singleton: construction only.
        "!src/lib/db.ts",
        // next/font declarations: no logic.
        "!src/components/paddock/paddock-fonts.ts",
        // Auth.js wiring (providers, adapter, callbacks need a live DB).
        "!src/features/auth/lib/auth.ts",
        // ECharts option builders are visual configuration, verified in e2e.
        "!src/features/dashboard/lib/chart-theme.ts",
    ],
    coverageThreshold: {
        global: { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
};

// createJestConfig is async so next/jest can load next.config.ts.
export default createJestConfig(config);
