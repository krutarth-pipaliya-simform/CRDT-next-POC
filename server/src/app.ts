import cors from "cors";
import express, { type Application } from "express";
import helmet from "helmet";

import { envConfig } from "./config/env.js";
import {
    errorHandler,
    notFoundHandler,
    requestLogger,
} from "./middlewares/index.js";
import { rootRouter } from "./routes/index.js";

export function createApp(): Application {
    const app = express();

    // Security Headers
    app.use(
        helmet({
            contentSecurityPolicy: false,
            crossOriginEmbedderPolicy: false,
        }),
    );

    // Cross-Origin Resource Sharing
    const originOption = envConfig.corsOrigins.includes("*")
        ? true
        : envConfig.corsOrigins;
    app.use(
        cors({
            origin: originOption,
            credentials: true,
        }),
    );

    // Body Parsing
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Request Logging
    app.use(requestLogger);

    // API & Application Routes
    app.use(rootRouter);

    // 404 & Global Error Handlers
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
