import { Router } from "express";
import { redirectToUrl } from "../controllers/redirect.controller.js";

const router = Router();

router.get("/:code", redirectToUrl);   // public, no protect

export default router;