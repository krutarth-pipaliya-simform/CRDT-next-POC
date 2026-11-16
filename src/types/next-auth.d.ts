import type { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
        } & DefaultSession["user"];
    }

    interface User {
        id?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        /** When the session last confirmed its user still exists (ms epoch). */
        userCheckedAt?: number;
    }
}

declare module "@auth/core/jwt" {
    interface JWT {
        id?: string;
        userCheckedAt?: number;
    }
}
