import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { createLink, getMyLinks, getLink, updateLink, deleteLink , getAnalytics } from "../controllers/link.controller.js";
import { createLinkLimiter } from "../middleware/rateLimit.js";

const router = Router();

//using the middleware
router.use(protect);          

router.post("/", createLinkLimiter , createLink);
router.get("/", getMyLinks);
router.get("/:code", getLink);
router.get("/:code/analytics", getAnalytics)
router.patch("/:code", updateLink);
router.delete("/:code", deleteLink);

export default router;