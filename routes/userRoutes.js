import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Both Admin and Agent can query users (agents see agents for ticket assignment; admin sees all)
router.get("/", authMiddleware, roleMiddleware("admin", "agent"), getUsers);

// Admin-only endpoints
router.get("/:id", authMiddleware, roleMiddleware("admin"), getUserById);
router.post("/", authMiddleware, roleMiddleware("admin"), createUser);
router.patch("/:id", authMiddleware, roleMiddleware("admin"), updateUser);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteUser);

export default router;
