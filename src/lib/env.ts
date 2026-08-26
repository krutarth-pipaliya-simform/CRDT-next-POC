import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.url(), // Works for both postgres:// and prisma://
    AUTH_SECRET: z.string().min(1),
    AUTH_GOOGLE_ID: z.string().optional(),
    AUTH_GOOGLE_SECRET: z.string().optional(),
    NEXT_PUBLIC_WS_URL: z.url().optional(),
});

export const env = envSchema.parse(process.env);
