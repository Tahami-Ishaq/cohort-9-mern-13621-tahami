import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";

import logger from "./config/logger.js";

const app = express();

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

// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Notes API is running",
  });
});

export default app;