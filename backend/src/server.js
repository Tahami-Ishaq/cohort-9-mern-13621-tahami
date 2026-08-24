import app from "./app.js";
import env from "./config/env.js";
import { connectDB } from "./config/db.js";
import logger from "./config/logger.js";

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(env.PORT, () => {
      logger.info(
        `Server running on http://localhost:${env.PORT}`
      );
    });

    server.on("error", (error) => {
      logger.error(error, "Failed to start server");
      process.exit(1);
    });
  } catch (error) {
    logger.error(error, "Failed to start server");
    process.exit(1);
  }
};

startServer();