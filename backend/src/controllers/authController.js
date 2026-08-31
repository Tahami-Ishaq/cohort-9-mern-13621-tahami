import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail } from "../models/userModel.js";
import env from "../config/env.js"; // env file se jwt secret key ko import kar rahe hain
import { findUserById } from "../models/userModel.js";

const EMAIL_REGEX = /^[^\s@]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/;

const validateCredentials = (email, password) => {
    const trimmedEmail = typeof email === "string" ? email.trim() : "";
    const trimmedPassword = typeof password === "string" ? password.trim() : "";

    if (!trimmedEmail || !trimmedPassword) {
        return "Email and password are required";
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
        return "Please enter a valid email address";
    }

    return null;
};

// register function to handle user registration
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required",
            });
        }

        const normalizedPassword = password.trim();
        const validationError = validateCredentials(email, normalizedPassword);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError,
            });
        }

        if (normalizedPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await findUserByEmail(normalizedEmail);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered",
            });
        }

        // bcrypt has a 72-byte UTF-8 limit, so passwords longer than that should be rejected both during registration and login.
        const passwordBytes = Buffer.byteLength(normalizedPassword, "utf8");

        if (passwordBytes > 72) {
            return res.status(400).json({
                success: false,
                message: "Password must not exceed 72 bytes",
            });
        }

        const hashedPassword = await bcrypt.hash(normalizedPassword, 10);

        const user = await createUser(
            name,
            normalizedEmail,
            hashedPassword
        );

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user,
        });
    } catch (error) {
        console.error("Registration error:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Email is already registered",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }

};

//login function ko handle karne ke liye
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const normalizedEmail = email.trim();
        const normalizedPassword = password.trim();
        const validationError = validateCredentials(normalizedEmail, normalizedPassword);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError,
            });
        }

        const lowerCaseEmail = normalizedEmail.toLowerCase();

        // bcrypt has a 72-byte UTF-8 limit, so passwords longer than that should be rejected both during registration and login.
        const passwordBytes = Buffer.byteLength(normalizedPassword, "utf8");

        if (passwordBytes > 72) {
            return res.status(400).json({
                success: false,
                message: "Password must not exceed 72 bytes",
            });
        }

        // Find user
        const user = await findUserByEmail(lowerCaseEmail);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Compare entered password with hashed password
        const isPasswordValid = await bcrypt.compare(
            normalizedPassword,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
            },
            env.JWT_SECRET,
            {
                expiresIn: "1h",
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
            },
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await findUserById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                created_at: user.created_at,
            },
        });
    } catch (error) {
        console.error("Get profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};