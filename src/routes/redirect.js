import { Router } from "express";
import { redirectToUrl } from "../controllers/redirect.controller.js";
import { redirectLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.get("/:code", redirectLimiter , redirectToUrl);

export default router;