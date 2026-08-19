import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

function createPrismaClient() {
    return new PrismaClient().$extends(withAccelerate());
}

const globalForPrisma = globalThis as unknown as {
    prisma: ExtendedPrismaClient;
};

export const db = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
