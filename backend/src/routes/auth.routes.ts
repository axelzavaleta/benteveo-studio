import { Router } from "express";
import { registerUser, userLogin, verifyEmail } from "../controllers/auth.controller";

const router = Router();

router.post("/register", registerUser);
router.post("/login", userLogin);
router.get("/verify-email", verifyEmail);

export default router;