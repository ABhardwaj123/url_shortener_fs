import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { createLink, getMyLinks, getLink, updateLink, deleteLink } from "../controllers/link.controller.js";

const router = Router();

router.use(protect);          

router.post("/", createLink);
router.get("/", getMyLinks);
router.get("/:code", getLink);
router.patch("/:code", updateLink);
router.delete("/:code", deleteLink);


router.post("/", createLink);
router.get("/", getMyLinks);

export default router;