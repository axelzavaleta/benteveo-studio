import { Router } from "express";
import { getAllUsers, getUserById, removeUser, updateUser, createUser } from "../controllers/user.controller";

const router = Router();

router.get("/", getAllUsers);
router.get("/:userId", getUserById);
router.post("/admin-create", createUser);
router.put("/:userId", updateUser);
router.delete("/:userId", removeUser);

export default router;