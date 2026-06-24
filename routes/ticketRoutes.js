import express from "express";
import { createTicket , getTickets  ,  getTicketById , assignTicket, updateTicketStatus , deleteTicket,} from "../controllers/ticketController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("customer"),
  createTicket
);

router.get(
  "/",
  authMiddleware,
  getTickets
);

router.get(
  "/:id",
  authMiddleware,
  getTicketById
);

router.patch(
  "/:id/assign",
  authMiddleware,
  roleMiddleware("agent", "admin"),
  assignTicket
);


router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("agent", "admin"),
  updateTicketStatus
); 

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteTicket
);
export default router;