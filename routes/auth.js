
import express from "express";
import { getMe, login, register , forgotPassword,
  resetPassword } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register User
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Vijay
 *               email:
 *                 type: string
 *                 example: vijay@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               role:
 *                 type: string
 *                 example: customer
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post("/register", register);

// router.post("/register", register);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login User
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login", login);

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


export default router;