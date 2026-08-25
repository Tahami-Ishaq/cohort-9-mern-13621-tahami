import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
    register,
    login,
    getProfile,
} from "../controllers/authController.js";

const router = express.Router();

//register route ko handle karne ke liye
router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getProfile);



// import authMiddleware from "../middleware/authMiddleware.js";

// router.get("/me", authMiddleware, (req, res) => {
//     res.status(200).json({
//         success: true,
//         message: "Authentication successful",
//         user: req.user,
//     });
// });

export default router;