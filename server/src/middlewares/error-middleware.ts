import type { NextFunction, Request, Response } from "express";

import { envConfig } from "../config/env.js";

export function notFoundHandler(req: Request, res: Response): void {
    res.status(404).json({
        error: "Not Found",
        message: `Cannot ${req.method} ${req.originalUrl}`,
        timestamp: new Date().toISOString(),
    });
}

export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction,
): void {
    console.error("[HTTP Error]", err);

    const isProduction = envConfig.nodeEnv === "production";
    const statusCode = 500;

    res.status(statusCode).json({
        error: "Internal Server Error",
        message: isProduction ? "An unexpected error occurred." : err.message,
        timestamp: new Date().toISOString(),
    });
}
