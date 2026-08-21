import { auth } from "@/features/auth/lib/auth";

export const proxy = auth((req) => {
    const isLoggedIn = !!req.auth;
    const isAuthRoute = req.nextUrl.pathname.startsWith("/api/auth");

    if (!isLoggedIn && !isAuthRoute && req.nextUrl.pathname !== "/login") {
        return Response.redirect(new URL("/login", req.nextUrl));
    }
});

export const config = {
    matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)"],
};
