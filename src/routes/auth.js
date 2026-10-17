import{ registerUser, loginUser } from "../controllers/auth.controller.js"
import { loginLimiter, registerLimiter } from "../middleware/rateLimit.js"
import { Router } from "express";

const router = Router()

router.post("/register", registerLimiter , registerUser)
router.post("/login", loginLimiter , loginUser)

export default router