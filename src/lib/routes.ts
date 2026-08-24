/**
 * An array of routes that are accessible to the public.
 * These routes do not require authentication.
 */
export const publicRoutes: string[] = [
    // Add public landing pages, pricing, etc. here
];

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
export const DEFAULT_LOGIN_REDIRECT: string = "/";

/**
 * The default redirect path when an unauthenticated user tries to access a protected route.
 */
export const DEFAULT_UNAUTHENTICATED_REDIRECT: string = "/login";
