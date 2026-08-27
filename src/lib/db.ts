import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Pool } from "pg";

import { env } from "@/lib/env";

function createPrismaClient() {
    if (env.DATABASE_URL.startsWith("prisma://")) {
        return new PrismaClient({
            accelerateUrl: env.DATABASE_URL,
        });
    }

    let connectionString = env.DATABASE_URL;
    if (connectionString.includes("sslmode=require")) {
        connectionString = connectionString.replace(
            "sslmode=require",
            "sslmode=verify-full",
        );
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
}

function createExtendedClient() {
    const rawClient = createPrismaClient();
    return rawClient.$extends(withAccelerate());
}

type ExtendedPrismaClient = ReturnType<typeof createExtendedClient>;
export type AppPrismaClient = PrismaClient & ExtendedPrismaClient;

const globalForPrisma = globalThis as unknown as {
    prisma: AppPrismaClient | undefined;
};

export const db: AppPrismaClient =
    globalForPrisma.prisma ?? (createExtendedClient() as AppPrismaClient);

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = db;
}
