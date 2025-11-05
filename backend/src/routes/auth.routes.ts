import { Router } from "express";
import { registerUser, userLogin } from "../controllers/auth.controller";

const router = Router();

router.post("/register", registerUser);
router.post("/login", userLogin);

export default router;