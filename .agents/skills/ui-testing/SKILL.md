---
name: ui-testing
description: >
    Guidelines for writing End-to-End (E2E) UI tests using Playwright.
    Enforces using user-centric locators, proper waiting strategies,
    and database teardown/seeding for isolated test execution.
    Trigger on: ui tests, e2e, playwright, testing auth flows.
---

# UI Testing with Playwright

When implementing or managing UI tests, use **Playwright**.

## Core Principles

1. **Test User Behavior, Not Implementation:**
    - Always use user-facing attributes to locate elements (`getByRole`, `getByLabel`, `getByText`, `getByPlaceholder`).
    - Avoid XPath or CSS selectors (like `.btn-primary` or `#login-form`) unless absolutely necessary.

2. **Isolation & State:**
    - Tests must be independent.
    - For database-dependent tests (like authentication), ensure you clean up the database or use a separate test database environment to prevent test pollution.
    - Use `test.beforeEach` or `test.afterEach` for cleanup.

3. **No Hardcoded Sleeps:**
    - Never use `page.waitForTimeout()`.
    - Rely on Playwright's auto-waiting and assertions (`expect(element).toBeVisible()`).

4. **Directory Structure:**
    - Place all tests in the `e2e/` directory at the root.
    - Group by feature (e.g., `e2e/auth.spec.ts`).

5. **Authentication Flows:**
    - When testing login/signup, verify the final state (e.g., being redirected to the dashboard, or seeing a "Welcome" message) rather than just looking at the URL.
    - If a test requires a logged-in user, use Playwright's `storageState` to reuse authenticated sessions and save time, unless you are explicitly testing the login flow.
