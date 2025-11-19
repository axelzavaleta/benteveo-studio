import { Router } from "express";
import { createUser, getAllUsers, getUserById, removeUser, updateUser, createUserByAdmin } from "../controllers/user.controller";

const router = Router();

router.get("/", getAllUsers);
router.get("/:userId", getUserById);
router.post("/", createUser);
router.post("/admin-create", createUserByAdmin);
router.put("/:userId", updateUser);
router.delete("/:userId", removeUser);

export default router;