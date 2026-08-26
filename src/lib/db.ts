import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Pool } from "pg";

import { env } from "@/lib/env";

type ExtendedPrismaClient = ReturnType<typeof createExtendedPrismaClient>;

export function createRawPrismaClient() {
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

function createExtendedPrismaClient() {
    return createRawPrismaClient().$extends(withAccelerate());
}

const globalForPrisma = globalThis as unknown as {
    prisma: ExtendedPrismaClient;
    rawPrisma: PrismaClient;
};

export const db = globalForPrisma.prisma || createExtendedPrismaClient();
export const rawDb = globalForPrisma.rawPrisma || createRawPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = db;
    globalForPrisma.rawPrisma = rawDb;
}
