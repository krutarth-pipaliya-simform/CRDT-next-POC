import type { Request, Response } from "express";

import { getCollabMetrics } from "../services/ws-service.js";
import type {
    HealthResponse,
    LivenessResponse,
    ReadinessResponse,
} from "../types/index.js";

const startTime = Date.now();

export function getHealth(_req: Request, res: Response): void {
    const memory = process.memoryUsage();
    const metrics = getCollabMetrics();

    const response: HealthResponse = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
        memoryUsage: {
            rssBytes: memory.rss,
            heapTotalBytes: memory.heapTotal,
            heapUsedBytes: memory.heapUsed,
            externalBytes: memory.external,
        },
        collaboration: {
            activeRooms: metrics.totalActiveRooms,
            activeConnections: metrics.totalActiveConnections,
        },
    };

    res.status(200).json(response);
}

export function getLiveness(_req: Request, res: Response): void {
    const response: LivenessResponse = {
        status: "ok",
        timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
}

export function getReadiness(_req: Request, res: Response): void {
    const response: ReadinessResponse = {
        status: "ready",
        timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
}
