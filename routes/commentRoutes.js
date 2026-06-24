import express from "express";
import { addComment ,getCommentsByTicket} from "../controllers/commentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  addComment
);

router.get(
  "/:ticketId",
  authMiddleware,
  getCommentsByTicket
);

export default router;