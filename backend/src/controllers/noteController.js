import {
    createNote,
    getNotesByUserId,
    getNoteById,
    updateNote,
    deleteNote,
} from "../models/noteModel.js";

export const createNoteController = async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.user.userId;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required",
            });
        }

        const note = await createNote(userId, title, content);

        return res.status(201).json({
            success: true,
            message: "Note created successfully",
            data: note,
        });
    } catch (error) {
        req.log.error(error, "Failed to create note");

        return res.status(500).json({
            success: false,
            message: "Failed to create note",
        });
    }
};

export const getNotesController = async (req, res) => {
    try {
        const search = typeof req.query.search === "string" ? req.query.search : "";
        const notes = await getNotesByUserId(req.user.userId, search);

        return res.status(200).json({
            success: true,
            data: notes,
        });
    } catch (error) {
        req.log.error(error, "Failed to fetch notes");

        return res.status(500).json({
            success: false,
            message: "Failed to fetch notes",
        });
    }
};

export const getNoteController = async (req, res) => {
    try {
        const note = await getNoteById(req.params.id, req.user.userId);

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: note,
        });
    } catch (error) {
        req.log.error(error, "Failed to fetch note");

        return res.status(500).json({
            success: false,
            message: "Failed to fetch note",
        });
    }
};

export const updateNoteController = async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required",
            });
        }

        const note = await updateNote(
            req.params.id,
            req.user.userId,
            title,
            content
        );

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Note updated successfully",
            data: note,
        });
    } catch (error) {
        req.log.error(error, "Failed to update note");

        return res.status(500).json({
            success: false,
            message: "Failed to update note",
        });
    }
};

export const deleteNoteController = async (req, res) => {
    try {
        const deletedNote = await deleteNote(req.params.id, req.user.userId);

        if (!deletedNote) {
            return res.status(404).json({
                success: false,
                message: "Note not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Note deleted successfully",
        });
    } catch (error) {
        req.log.error(error, "Failed to delete note");

        return res.status(500).json({
            success: false,
            message: "Failed to delete note",
        });
    }
};