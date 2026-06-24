
import express from "express";
import { getMe, login, register , forgotPassword,
  resetPassword } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();


router.post("/register", register);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login User
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Login successful
 */

router.post("/login" , login);
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get Logged In User
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User profile
 */
router.get("/me" ,authMiddleware,  getMe);


// router.get(
//   "/admin",
//   authMiddleware,
//   roleMiddleware("admin"),
//   adminController
// );


// router.patch(
//   "/tickets/:id/status",
//   authMiddleware,
//   roleMiddleware("agent", "admin"),
//   updateTicketStatus
// );



// router.post(
//   "/tickets",
//   authMiddleware,
//   roleMiddleware("customer"),
//   createTicket
// );
// this section is comment

router.get(
  "/admin-test",
  authMiddleware,
  roleMiddleware("admin"),
  (req, res) => {
    res.json({
       success: true,
       message: "Welcome Admin",
     });
   }
 );



router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password/:token",
  resetPassword
);


/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register User
 *     tags: [Auth]
 *     responses:
 *       /** */
export default router;