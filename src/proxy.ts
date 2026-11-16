import { auth } from "@/features/auth/lib/auth";
import {
    DEFAULT_LOGIN_REDIRECT,
    DEFAULT_UNAUTHENTICATED_REDIRECT,
    apiAuthPrefix,
    authRoutes,
    publicRoutes,
} from "@/lib/routes";

export const proxy = auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);

    if (isApiAuthRoute) {
        return;
    }

    if (isAuthRoute) {
        if (isLoggedIn) {
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
        }
        return;
    }

    // A Server Action is a POST the page's client code reads as an action
    // result, not as a document; answering it with a redirect to /login makes
    // the page fall into its error boundary with no explanation. Every action
    // checks auth() itself, so let it through to report the expired session.
    const isServerAction =
        req.method === "POST" && req.headers.has("next-action");

    if (!isLoggedIn && !isPublicRoute && !isServerAction) {
        const callbackUrl = nextUrl.pathname + nextUrl.search;
        const loginUrl = new URL(DEFAULT_UNAUTHENTICATED_REDIRECT, nextUrl);
        if (callbackUrl && callbackUrl !== "/") {
            loginUrl.searchParams.set("callbackUrl", callbackUrl);
        }
        return Response.redirect(loginUrl);
    }
});

export const config = {
    matcher: [
        "/((?!api/auth|api/uploads|api/webhooks|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
    ],
};
