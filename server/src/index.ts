import http from "http";
import { WebSocketServer } from "ws";
// @ts-expect-error y-websocket/bin/utils has no separate type definitions
import { setupWSConnection } from "y-websocket/bin/utils";

const PORT = Number(process.env.COLLAB_PORT) || 1234;
const HOST = process.env.COLLAB_HOST || "0.0.0.0";

const server = http.createServer((req, res) => {
    if (req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
            JSON.stringify({
                status: "healthy",
                timestamp: new Date().toISOString(),
            }),
        );
        return;
    }
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("CRDT WebSocket Collab Server is running.");
});

const wss = new WebSocketServer({ server });

wss.on("connection", (conn, req) => {
    // URL format: /?room=workspaceId:documentId or /workspaceId:documentId
    const url = new URL(
        req.url || "/",
        `http://${req.headers.host || "localhost"}`,
    );
    const docName =
        url.searchParams.get("room") || url.pathname.slice(1) || "default";

    // Setup y-websocket connection for real-time multiplayer CRDT sync & awareness
    setupWSConnection(conn, req, { docName, gc: true });
});

server.listen(PORT, HOST, () => {
    console.log(
        `[Collab Server] Real-time collaboration WebSocket server listening on ws://${HOST}:${PORT}`,
    );
});
