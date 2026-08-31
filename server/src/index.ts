import http from "http";

import { createApp } from "./app.js";
import { envConfig } from "./config/env.js";
import {
    closeWebSocketService,
    initWebSocketService,
} from "./services/ws-service.js";

const app = createApp();
const server = http.createServer(app);

// Initialize real-time WebSocket collaboration service
initWebSocketService(server);

server.listen(envConfig.port, envConfig.host, () => {
    console.log(
        `[Collab Server] Real-time collaboration Express + WebSocket server listening on http://${envConfig.host}:${envConfig.port} (ws://${envConfig.host}:${envConfig.port})`,
    );
});

// Graceful shutdown handling
let isShuttingDown = false;

async function handleGracefulShutdown(signal: string): Promise<void> {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(
        `[Collab Server] Received ${signal}. Starting graceful shutdown...`,
    );

    try {
        await closeWebSocketService();

        await new Promise<void>((resolve, reject) => {
            server.close((err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });

        console.log("[Collab Server] HTTP server closed cleanly.");
        process.exit(0);
    } catch (err) {
        console.error(
            "[Collab Server] Error encountered during shutdown:",
            err,
        );
        process.exit(1);
    }
}

process.on("SIGTERM", () => void handleGracefulShutdown("SIGTERM"));
process.on("SIGINT", () => void handleGracefulShutdown("SIGINT"));
