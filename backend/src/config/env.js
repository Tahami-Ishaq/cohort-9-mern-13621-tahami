import dotenv from "dotenv";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET?.trim();
const portValue = process.env.PORT?.trim();
const port = portValue ? Number(portValue) : 5000;
const dbPortValue = process.env.DB_PORT?.trim();
const dbPort = Number(dbPortValue);

if (!jwtSecret) {
  throw new Error("Configuration error: JWT_SECRET is required");
}

if (
  !Number.isInteger(port) ||
  port < 1 ||
  port > 65535
) {
  throw new Error(
    "Configuration error: PORT must be an integer between 1 and 65535"
  );
}

if (
  !dbPortValue ||
  !Number.isInteger(dbPort) ||
  dbPort < 1 ||
  dbPort > 65535
) {
  throw new Error(
    "Configuration error: DB_PORT must be an integer between 1 and 65535"
  );
}

const env = {
  PORT: port,
  NODE_ENV: process.env.NODE_ENV || "development",

  DB_HOST: process.env.DB_HOST,
  DB_PORT: dbPort,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,

  JWT_SECRET: jwtSecret,
};

export default env;