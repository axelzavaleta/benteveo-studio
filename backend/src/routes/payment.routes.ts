import { Router } from "express";
import { processPayment } from "../controllers/payment.controller";

const router = Router();

router.post("/", processPayment);

export default router;