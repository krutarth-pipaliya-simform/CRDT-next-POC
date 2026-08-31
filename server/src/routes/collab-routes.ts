import { Router } from "express";

import { getCollabStats } from "../controllers/collab-controller.js";

const router = Router();

router.get("/stats", getCollabStats);

export const collabRouter = router;
