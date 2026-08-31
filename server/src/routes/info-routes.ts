import { Router } from "express";

import { getInfo } from "../controllers/info-controller.js";

const router = Router();

router.get("/", getInfo);

export const infoRouter = router;
