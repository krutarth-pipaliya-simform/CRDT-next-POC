---
name: dry-and-reusability
description: Enforce Don't Repeat Yourself (DRY) principles, stop copy-pasting code, and guide extraction of shared functions, hooks, and UI components. Trigger on: dry, duplicate code, copy paste, redundancy, extract component, extract helper.
---

# DRY & Reusability (Anti-Copy-Paste Protocol)

Eliminate redundant and copy-pasted code by extracting clean, reusable functions, hooks, and components behind minimal interfaces.

## Core Rules

1. **Stop Copy-Pasting (The Rule of Two)**:
    - When the same or substantially similar logic, JSX markup, state handlers, or API calls are used in 2 or more places, abstract them into a shared utility function, custom hook, or UI primitive.
    - Never copy-paste an existing block of code just to alter 1 or 2 variables; parameterize the existing module instead.

2. **Component Extraction Hierarchy**:
    - **Generic UI Primitives**: Place in `src/components/ui/` (e.g., `UserAvatar`, `EmptyState`, `Button`, `Input`, `Dialog`, `Alert`, `NavTabs`).
    - **Shared Layout & Chrome**: Place in `src/components/layout/` (e.g., `SiteHeader`, `PageHeader`, `UserDropdown`, `WorkspaceNav`).
    - **Feature-Specific Shared Components**: Place in `src/features/<feature-name>/components/` (e.g., `SocialAuthButtons`, `WorkspaceCard`, `InviteSection`).

3. **Function & Hook Extraction**:
    - **Pure Utilities & Formatting**: Place in `src/lib/` or `src/features/<feature-name>/lib/` (e.g., `getAppUrl`, string formatters, schema helpers).
    - **Reusable Client Hooks**: Place in `src/hooks/` (e.g., `useOutsideClick`, `useDebounce`, `useLocalStorage`).

4. **Backward-Compatible Extension**:
    - If an existing function or component almost meets your needs, extend its props/arguments with optional parameters or slot props rather than duplicating the entire component or logic.

5. **Type Reuse First**:
    - Reuse existing domain schemas and Prisma/NextAuth types instead of redeclaring identical inline interfaces across files.
