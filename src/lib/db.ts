import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Pool } from "pg";

import { env } from "@/lib/env";

function createPrismaClient(): PrismaClient {
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
// Prisma dynamic client extension requires intersection with PrismaClient to preserve generic model query inference (include/select payloads)
export type AppPrismaClient = PrismaClient & ExtendedPrismaClient;

export const db: AppPrismaClient =
    globalThis.prisma ?? (createExtendedClient() as AppPrismaClient);

if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = db;
}
