import { Router } from "express";

import {
    getHealth,
    getLiveness,
    getReadiness,
} from "../controllers/health-controller.js";

const router = Router();

router.get("/", getHealth);
router.get("/liveness", getLiveness);
router.get("/readiness", getReadiness);

export const healthRouter = router;
