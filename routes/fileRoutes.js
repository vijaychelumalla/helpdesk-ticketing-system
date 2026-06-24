import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { uploadFile ,attachFileToTicket, } from "../controllers/fileController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  uploadFile
);

router.post(
  "/attach",
  authMiddleware,
  upload.single("file"),
  attachFileToTicket
);

export default router;