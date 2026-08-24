import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail } from "../models/userModel.js";
import env from "../config/env.js"; // env file se jwt secret key ko import kar rahe hain

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

        const existingUser = await findUserByEmail(email);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered",
            });
        }

        // bcrypt has a 72-byte UTF-8 limit, so passwords longer than that should be rejected both during registration and login.
        const passwordBytes = Buffer.byteLength(password, "utf8");

        if (passwordBytes > 72) {
            return res.status(400).json({
                success: false,
                message: "Password must not exceed 72 bytes",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await createUser(
            name,
            email,
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
            typeof password !== "string" ||
            !email.trim() ||
            !password.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }
        

        // bcrypt has a 72-byte UTF-8 limit, so passwords longer than that should be rejected both during registration and login.
        const passwordBytes = Buffer.byteLength(password, "utf8");

        if (passwordBytes > 72) {
            return res.status(400).json({
                success: false,
                message: "Password must not exceed 72 bytes",
            });
        }

        // Find user
        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Compare entered password with hashed password
        const isPasswordValid = await bcrypt.compare(
            password,
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
