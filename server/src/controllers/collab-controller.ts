import type { Request, Response } from "express";

import { getCollabMetrics } from "../services/ws-service.js";

export function getCollabStats(_req: Request, res: Response): void {
    const stats = getCollabMetrics();
    res.status(200).json(stats);
}
