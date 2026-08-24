---
name: typescript
description: Enforces strict TypeScript rules for end-to-end type safety, avoiding `any`, maximizing inference, and runtime validation. Trigger on: typescript, typing, interfaces, refactor, API creation.
---

# TypeScript & Type Safety Conventions

Our goal is to make the entire application fully type-safe. Every new feature, refactor, or API integration should prioritize strong typing to maximize type safety, improve developer experience, and provide accurate IDE autocomplete and compile-time error detection.

## Objective

This project aims to be fully type-safe from end to end. Every implementation should maximize compile-time guarantees, minimize runtime type-related errors, and provide an excellent developer experience through accurate IntelliSense, autocomplete, navigation, and safe refactoring.

Whenever you write or modify TypeScript code, prioritize correctness, maintainability, and type safety over writing the shortest implementation.

## Core Principles

### 1. Type Safety First

Always prefer a strongly typed solution over a loosely typed one.

- Never sacrifice type safety for convenience.
- Types should accurately represent runtime behavior.
- Every public API should expose meaningful types.
- Invalid states should be impossible to represent whenever feasible.

**Bad:**

```typescript
function updateUser(data: any) {}
```

**Good:**

```typescript
interface UpdateUserInput {
    name: string;
    email: string;
}

function updateUser(data: UpdateUserInput) {}
```

### 2. Avoid `any`

`any` removes all benefits of TypeScript.

- Never use `any` by default.
- Exhaust every alternative before introducing `any`.
- If `any` is unavoidable because of an external library, isolate it to the smallest possible scope.
- Document why `any` is necessary.

Prefer: `unknown`, generics, unions, discriminated unions, mapped types, conditional types, utility types.
Instead of `const value: any`, prefer `const value: unknown` and narrow properly.

### 3. Prefer Type Inference

Do not write redundant annotations. Explicit annotations should be added when they improve readability or are required.

**Bad:**

```typescript
const name: string = "John";
```

**Good:**

```typescript
const name = "John";
```

### 4. Design for IntelliSense

Every exported API should provide excellent autocomplete. Consumers should immediately understand available properties.

**Bad:**

```typescript
function create(options: object);
```

**Good:**

```typescript
interface CreateOptions {
    cache?: boolean;
    retries?: number;
}
function create(options: CreateOptions);
```

### 5. Model Real Business Rules

Types should encode business constraints.
Instead of `status: string`, prefer:

```typescript
type Status = "draft" | "published" | "archived";
```

This prevents invalid values.

### 6. Invalid States Should Be Impossible

Use discriminated unions.

**Bad:**

```typescript
interface User {
    loading: boolean;
    error?: string;
    data?: User;
}
```

**Good:**

```typescript
type UserState =
    | { status: "loading" }
    | { status: "success"; data: User }
    | { status: "error"; error: string };
```

### 7. End-to-End Type Safety

Types should flow through the entire application:
`Database -> Repository -> Service -> API -> Frontend -> UI`
Never redefine identical types in multiple places.

### 8. Reuse Existing Types

Before creating a new type, check if one already exists. Avoid having `UserDTO`, `UserResponse`, `UserModel`, and `UserData` when they all represent the same thing.

### 9. Prefer Interfaces for Objects

- Use `interface` for object contracts.
- Use `type` for unions, intersections, primitives, mapped types, and conditional types.

### 10. Generic Components Should Be Generic

**Bad:**

```typescript
function Table(data: User[]);
```

**Good:**

```typescript
function Table<T>(data: T[]);
```

### 11. Build Reusable Generic Utilities

Avoid repeating logic. Instead of `UserResponse` and `ProductResponse`, prefer:

```typescript
interface ApiResponse<T> {
    data: T;
    message: string;
}
```

### 12. Type API Responses

Never return `Promise<any>`. Prefer `Promise<ApiResponse<User>>`. Every endpoint should have a request type, response type, and error type.

### 13. Strongly Type Forms

Every form should have form values, a validation schema, and a submit handler all sharing one source of truth. When using Zod, infer types:

```typescript
type FormData = z.infer<typeof schema>;
```

### 14. Strongly Type Server Actions

Never expose `(formData: FormData)` without validation. Validate first, then infer types.

### 15. Strongly Type Database Access

Prisma types should be reused instead of recreated. Avoid manually recreating Prisma models. Leverage Prisma generated types, Prisma payload helpers, and Prisma validator utilities where appropriate.

### 16. Never Suppress Errors

Avoid `// @ts-ignore` and `// @ts-expect-error` unless absolutely necessary. Fix the type instead.

### 17. Avoid Unsafe Type Assertions

Don't write `value as User` unless runtime validation guarantees it. Prefer narrowing.

### 18. Narrow Unknown Values

Whenever receiving JSON, API responses, cookies, localStorage, environment variables, validate before use.

### 19. Use Utility Types

Prefer built-in utilities when appropriate (`Partial`, `Required`, `Pick`, `Omit`, `Record`, `ReturnType`, `Parameters`, `InstanceType`, `Awaited`, `NonNullable`, `Extract`, `Exclude`). Avoid reinventing them.

### 20. Prefer Literal Types

Instead of `string`, use `"light" | "dark"` when possible.

### 21. Exhaustive Switches

Always ensure switches are exhaustive. It should fail compilation if a case is missing. Use `const _: never = value` when appropriate.

### 22. Type React Correctly

- Strongly type props, generic reusable hooks, generic reusable components, event types, ref types, and children types.
- Avoid `React.FC` unless there is a specific reason.

### 23. Prefer Composition Over Casting

If you're writing many `as Something`, you're probably missing a better type design. Redesign instead of casting.

### 24. Shared Domain Types

Create shared folders such as `types/`, `models/`, `schemas/`, `contracts/`. Avoid duplicated definitions across modules.

### 25. Runtime Validation

Remember: TypeScript disappears at runtime. For all external input (HTTP requests, query parameters, cookies, headers, environment variables, localStorage, third-party APIs), validate using Zod (or the project's chosen validation library) before trusting the data.

### 26. Export Clean Public Types

Libraries and shared modules should export clean, understandable types. Hide implementation details whenever possible.

### 27. Optimize for Refactoring

When implementing a feature, ask:

- Will renaming this propagate safely?
- Can consumers discover everything through autocomplete?
- Will incorrect usage fail during compilation?
- Can future developers understand this type immediately?

If not, improve the type design.

### 28. Documentation

Complex generic or conditional types should include concise comments explaining their purpose. Name types descriptively rather than relying on comments where possible.

## Before Completing Any Task

Verify that:

- [ ] No unnecessary `any`
- [ ] No unnecessary type assertions
- [ ] No duplicated types
- [ ] APIs are fully typed
- [ ] Forms are typed
- [ ] Database interactions are typed
- [ ] Generic utilities are reusable
- [ ] Runtime validation exists for external data
- [ ] Autocomplete is excellent
- [ ] The solution follows modern TypeScript best practices
- [ ] The implementation compiles without TypeScript errors

## Overall Goal

Every piece of TypeScript written for this project should feel like it was designed for a large-scale production application. The codebase should provide strong compile-time guarantees, exceptional IntelliSense, safe refactoring, reusable abstractions, and end-to-end type safety across the entire stack. TypeScript should be treated as a design tool—not just a language that satisfies the compiler.
