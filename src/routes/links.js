import { createLink, getMyLinks } from "../controllers/links.controller.js";
import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);          
router.post("/", createLink);
router.get("/", getMyLinks);

export default router;