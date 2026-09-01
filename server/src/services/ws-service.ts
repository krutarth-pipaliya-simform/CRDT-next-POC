import type { IncomingMessage, Server as HttpServer } from "http";
import { WebSocketServer, type WebSocket } from "ws";
// @ts-expect-error y-websocket/bin/utils has no separate type definitions
import { docs, setupWSConnection } from "y-websocket/bin/utils";

import type { CollabRoomSummary, CollabStatsResponse } from "../types/index.js";

let wssInstance: WebSocketServer | null = null;

export function initWebSocketService(server: HttpServer): WebSocketServer {
    if (wssInstance) {
        return wssInstance;
    }

    const wss = new WebSocketServer({ server });

    wss.on("connection", (conn: WebSocket, req: IncomingMessage) => {
        try {
            const host = req.headers.host || "localhost";
            const url = new URL(req.url || "/", `http://${host}`);
            const docName =
                url.searchParams.get("room") ||
                url.pathname.slice(1) ||
                "default";

            setupWSConnection(conn, req, { docName, gc: true });
        } catch (err) {
            console.error("[Collab WS] Connection setup error:", err);
            conn.close(1011, "Internal server error during session setup");
        }
    });

    wss.on("error", (err: Error) => {
        console.error(
            "[Collab WS] WebSocket server encountered an error:",
            err,
        );
    });

    wssInstance = wss;
    return wss;
}

export function getCollabMetrics(): CollabStatsResponse {
    const roomsList: CollabRoomSummary[] = [];
    let activeConnectionsCount = 0;

    if (wssInstance) {
        activeConnectionsCount = wssInstance.clients.size;
    }

    if (docs instanceof Map) {
        docs.forEach(
            (doc: { conns?: Map<WebSocket, Set<number>> }, name: string) => {
                const connsCount = doc.conns ? doc.conns.size : 0;
                roomsList.push({
                    roomName: name,
                    connectionsCount: connsCount,
                });
            },
        );
    }

    return {
        totalActiveRooms: roomsList.length,
        totalActiveConnections: activeConnectionsCount,
        rooms: roomsList,
        timestamp: new Date().toISOString(),
    };
}

export async function closeWebSocketService(): Promise<void> {
    if (!wssInstance) return;

    return new Promise((resolve) => {
        const server = wssInstance;
        wssInstance = null;

        if (!server) {
            resolve();
            return;
        }

        server.close(() => {
            console.log("[Collab WS] WebSocket server closed successfully.");
            resolve();
        });
    });
}
