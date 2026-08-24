import express from "express";
//import { createNote } from "../controllers/noteController.js";
import authMiddleware from "../middleware/authMiddleware.js";

import {
    createNoteController,
    getNotesController,
    getNoteController,
    updateNoteController,
    deleteNoteController,
} from "../controllers/noteController.ts";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createNoteController);
router.get("/", getNotesController);
router.get("/:id", getNoteController);
router.put("/:id", updateNoteController);
router.delete("/:id", deleteNoteController);

export default router;