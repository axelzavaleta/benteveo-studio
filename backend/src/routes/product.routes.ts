import { Router } from "express";
import { createProduct, getAllProducts, getProductById, removeProduct, updateProduct } from "../controllers/product.controller";

const router = Router();

router.get("/", getAllProducts);
router.post("/", createProduct);
router.get("/:productId", getProductById);
router.put("/:productId", updateProduct);
router.delete("/:productId", removeProduct);

export default router;