/**
 * An array of routes that are accessible to the public.
 * These routes do not require authentication.
 */
export const publicRoutes: string[] = [
    // Monitoring check (see `src/app/sentry-test`). The routes themselves
    // answer 404 in production; listing them only in development keeps the
    // proxy from redirecting a signed-out developer away from them.
    ...(process.env.NODE_ENV !== "production"
        ? ["/sentry-test", "/api/sentry-test"]
        : []),
    "/",
    "/verify-email",
    // Public rather than an auth route, so a signed-in user who follows a
    // reset link from their email is not bounced to the dashboard.
    "/forgot-password",
    "/reset-password",
    "/favicon.ico",
    "/design-system/v2",
];

/**
 * Public CMS sections. A path is public when it equals one of these or sits
 * beneath it (`/blog/some-slug`).
 */
export const publicRoutePrefixes: string[] = [
    "/blog",
    "/docs",
    "/changelog",
    "/announcements",
];

/** True when the path is one of `publicRoutes` or under a public prefix. */
export function isPublicPath(pathname: string): boolean {
    return (
        publicRoutes.includes(pathname) ||
        publicRoutePrefixes.some(
            (prefix) =>
                pathname === prefix || pathname.startsWith(`${prefix}/`),
        )
    );
}

/**
 * An array of routes that are used for authentication.
 * These routes will redirect logged in users to the default redirect path.
 */
export const authRoutes: string[] = ["/login", "/register"];

/**
 * The prefix for API authentication routes.
 * Routes that start with this prefix are used for API authentication purposes
 * and must always be accessible.
 */
export const apiAuthPrefix: string = "/api/auth";

/**
 * The default redirect path after a successful login.
 */
export const DEFAULT_LOGIN_REDIRECT: string = "/dashboard";

/**
 * The default redirect path when an unauthenticated user tries to access a protected route.
 */
export const DEFAULT_UNAUTHENTICATED_REDIRECT: string = "/login";
