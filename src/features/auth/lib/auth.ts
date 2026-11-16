import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { db } from "@/lib/db";
import { loginSchema } from "@/schemas/auth";

/**
 * How long a session may go between checks that its user still exists. A JWT
 * is never looked up on its own, so without this a deleted user stays signed
 * in until the token expires; with it they are signed out within a minute.
 */
const USER_RECHECK_MS = 60_000;

type SessionUserCheck = "exists" | "gone" | "unknown";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(db),
    pages: {
        signIn: "/login",
    },
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
            authorization: {
                params: {
                    prompt: "select_account",
                },
            },
        }),
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const validated = loginSchema.safeParse(credentials);
                if (!validated.success) {
                    return null;
                }

                const { email, password } = validated.data;
                const user = await db.user.findUnique({
                    where: { email },
                });

                if (!user || !user.password) {
                    return null;
                }

                const isValid = await bcrypt.compare(password, user.password);

                if (!isValid) {
                    return null;
                }

                if (!user.emailVerified) {
                    throw new Error("email_not_verified");
                }

                return user;
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user?.id) {
                token.id = user.id;
                token.userCheckedAt = Date.now();
                return token;
            }

            const userId = token.id ?? token.sub;
            if (
                userId &&
                Date.now() - (token.userCheckedAt ?? 0) > USER_RECHECK_MS
            ) {
                // A failed lookup keeps the session and retries next request:
                // a thrown error here would make Auth.js clear the cookie and
                // sign everyone out during a database blip.
                const check = await db.user
                    .findUnique({ where: { id: userId }, select: { id: true } })
                    .then((found): SessionUserCheck =>
                        found ? "exists" : "gone",
                    )
                    .catch((error: unknown): SessionUserCheck => {
                        console.error(
                            "[auth] session user check failed",
                            error,
                        );
                        return "unknown";
                    });
                // Returning null makes Auth.js clear the session cookie, so
                // every later check (proxy, pages, actions) sees no session.
                if (check === "gone") {
                    return null;
                }
                if (check === "exists") {
                    token.userCheckedAt = Date.now();
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                const userId =
                    typeof token.id === "string"
                        ? token.id
                        : typeof token.sub === "string"
                          ? token.sub
                          : session.user.id;
                if (userId) {
                    session.user.id = userId;
                }
            }
            return session;
        },
    },
});
