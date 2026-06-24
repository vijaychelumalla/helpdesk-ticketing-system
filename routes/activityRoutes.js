import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getTicketActivities } from "../controllers/activityController.js";

const router = express.Router();

router.get(
  "/:ticketId",
  authMiddleware,
  getTicketActivities
);

export default router;