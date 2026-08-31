import { Router } from "express";

import { collabRouter } from "./collab-routes.js";
import { healthRouter } from "./health-routes.js";
import { infoRouter } from "./info-routes.js";

const router = Router();

router.use("/health", healthRouter);
router.use("/api/collab", collabRouter);
router.use("/", infoRouter);

export const rootRouter = router;
