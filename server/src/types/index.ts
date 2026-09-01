export interface HealthResponse {
    status: "healthy" | "degraded" | "unhealthy";
    timestamp: string;
    uptimeSeconds: number;
    memoryUsage: {
        rssBytes: number;
        heapTotalBytes: number;
        heapUsedBytes: number;
        externalBytes: number;
    };
    collaboration: {
        activeRooms: number;
        activeConnections: number;
    };
}

export interface LivenessResponse {
    status: "ok";
    timestamp: string;
}

export interface ReadinessResponse {
    status: "ready";
    timestamp: string;
}

export interface ServerInfoResponse {
    name: string;
    version: string;
    environment: string;
    description: string;
    endpoints: {
        health: string;
        collabStats: string;
        websocket: string;
    };
}

export interface CollabRoomSummary {
    roomName: string;
    connectionsCount: number;
}

export interface CollabStatsResponse {
    totalActiveRooms: number;
    totalActiveConnections: number;
    rooms: CollabRoomSummary[];
    timestamp: string;
}

export interface AppEnvConfig {
    port: number;
    host: string;
    nodeEnv: "development" | "production" | "test";
    corsOrigins: string[];
}
