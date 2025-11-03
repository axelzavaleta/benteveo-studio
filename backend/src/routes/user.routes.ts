import { Router } from "express";
import { createUser, getAllUsers, getUserById, removeUser, updateUser } from "../controllers/user.controller";

const router = Router();

router.get("/", getAllUsers);
router.get("/:userId", getUserById);
router.post("/", createUser);
router.put("/:userId", updateUser);
router.delete("/:userId", removeUser);

export default router;