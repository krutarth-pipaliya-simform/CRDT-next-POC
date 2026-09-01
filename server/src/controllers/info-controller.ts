import type { Request, Response } from "express";

import { envConfig } from "../config/env.js";
import type { ServerInfoResponse } from "../types/index.js";

export function getInfo(req: Request, res: Response): void {
    if (req.accepts("json")) {
        const info: ServerInfoResponse = {
            name: "collab-server",
            version: "0.1.0",
            environment: envConfig.nodeEnv,
            description: "CRDT Real-Time Collaboration WebSocket Server",
            endpoints: {
                health: "/health",
                collabStats: "/api/collab/stats",
                websocket: `ws://${envConfig.host}:${envConfig.port}`,
            },
        };
        res.status(200).json(info);
        return;
    }

    res.status(200)
        .type("text/plain")
        .send("CRDT WebSocket Collab Server is running.");
}
