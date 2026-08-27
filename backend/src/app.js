import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import authRoutes from "./routes/authRoutes.js";

import noteRoutes from "./routes/noteRoutes.js";

import logger from "./config/logger.js";

const app = express();
const API_PREFIX = "/api/v1";

// Security Middleware
app.use(helmet());

// Enable CORS
app.use(cors());

// Parse JSON Request Body
app.use(express.json());

// HTTP Request Logger
app.use(
  pinoHttp({
    logger,
  })
);

app.use(`${API_PREFIX}/auth`, authRoutes);
//app.use(`${API_PREFIX}/auth/me`, authRoutes);

app.use(`${API_PREFIX}/notes`, noteRoutes);// ye line noteRoutes ko use kar rahi hai, jisme saare note related routes define kiye gaye hai.
// Ye route /api/v1/notes ke under accessible honge.

// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Notes API is running",
  });
});

export default app;
