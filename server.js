import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import fs from "fs";

// Initialize environment variables first
dotenv.config();

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import {
  swaggerUi,
  swaggerSpec,
} from "./config/swagger.js";

const app = express();

// Connect to MongoDB
connectDB();

// Ensure upload directory exists
const uploadsDir = path.join(path.resolve(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// CORS configuration supporting development, Vercel deployments, and custom domains
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.length === 0 ||
        allowedOrigins.includes("*") ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Serve static uploads
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// Health Check Endpoint (useful for Render and monitoring)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "DeskFlow Helpdesk API",
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Root API Information
app.get("/", (req, res) => {
  res.status(200).json({
    message: "DeskFlow Helpdesk API is live and operational",
    docs: "/api-docs",
    health: "/api/health",
    version: "1.0.0",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/activities", activityRoutes);

// Swagger Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found`,
  });
});

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  });
}

export default app;
