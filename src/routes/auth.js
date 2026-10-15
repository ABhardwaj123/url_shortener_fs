import{ registerUser, loginUser } from "../controllers/auth.controller.js"
import { Router } from "express";

const router = Router()

router.post("/register", registerUser)
router.post("/login", loginUser)

export default router