import { z } from "zod";

import type { AppEnvConfig } from "../types/index.js";

const envSchema = z.object({
    PORT: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : 1234))
        .pipe(z.number().int().min(1).max(65535)),
    HOST: z.string().default("0.0.0.0"),
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    CORS_ORIGIN: z.string().default("*"),
});

function parseEnv(): AppEnvConfig {
    const rawEnv = {
        PORT: process.env.COLLAB_PORT || process.env.PORT || "1234",
        HOST: process.env.COLLAB_HOST || process.env.HOST || "0.0.0.0",
        NODE_ENV: process.env.NODE_ENV || "development",
        CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
    };

    const parsed = envSchema.safeParse(rawEnv);

    if (!parsed.success) {
        console.error(
            "[Collab Server] Invalid environment variables:",
            parsed.error.format(),
        );
        throw new Error("Server configuration validation failed.");
    }

    const { PORT, HOST, NODE_ENV, CORS_ORIGIN } = parsed.data;

    const corsOrigins =
        CORS_ORIGIN === "*"
            ? ["*"]
            : CORS_ORIGIN.split(",")
                  .map((origin) => origin.trim())
                  .filter((origin) => origin.length > 0);

    return {
        port: PORT,
        host: HOST,
        nodeEnv: NODE_ENV,
        corsOrigins,
    };
}

export const envConfig: AppEnvConfig = parseEnv();
