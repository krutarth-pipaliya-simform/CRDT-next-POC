import type { NextFunction, Request, Response } from "express";

import { envConfig } from "../config/env.js";

export function requestLogger(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    if (envConfig.nodeEnv === "test") {
        next();
        return;
    }

    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(
            `[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`,
        );
    });

    next();
}
