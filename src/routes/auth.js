import registerUser from "../controllers/auth.controller.js"
import { Router } from "express";

const router = Router()

router.post("/register", registerUser)

export default router