import pool from "../config/db.js";
import logger from "../config/logger.js";

export const createUser = async (name, email, password) => {
    try {
        const result = await pool.query(
            `INSERT INTO users (name, email, password)
             VALUES ($1, $2, $3)
             RETURNING id, name, email, created_at, updated_at`,
            [name, email, password]
        );

        return result.rows[0];
    } catch (error) {
        logger.error({ operation: "createUser" }, "User creation failed");

        const controlledError = new Error("Failed to create user");

        if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "23505"
        ) {
            controlledError.code = "23505";
        }

        throw controlledError;
    }
};

export const findUserByEmail = async (email) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, password, created_at, updated_at
             FROM users
             WHERE email = $1`,
            [email]
        );

        return result.rows[0];
    } catch (error) {
        logger.error({ operation: "findUserByEmail" }, "User lookup failed");
        throw new Error("Failed to find user");
    }
};

export const findUserById = async (id) => {
    const result = await pool.query(
        `SELECT id, name, email, created_at, updated_at
         FROM users
         WHERE id = $1`,
        [id]
    );

    return result.rows[0];
};