import {
    createNote,
    getNotesByUserId,
    getNoteById,
    updateNote,
    deleteNote,
} from "../models/noteModel.js";

// Create a note
// saare controller functions me try catch block ka use kiya hai taaki agar koi error aaye to usko
//  handle kiya ja sake aur user ko proper response diya ja sake.
export const createNoteController = async (req, res) => { // ye function createNoteController ka kaam hai ki ye user ke request se note create kare aur uska response bheje.
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
        req.log.error(error, "Failed to create note");// ye line error ko log karne ke liye hai, taaki agar koi error aaye to usko track kiya ja sake.

        return res.status(500).json({
            success: false,
            message: "Failed to create note",
        });
    }
};

// Get all notes belonging to logged-in user
export const getNotesController = async (req, res) => {
    try {
        const userId = req.user.userId;

        const notes = await getNotesByUserId(userId);// ye line getNotesByUserId function ko call kar rahi hai jo ki user ke id ke basis pe notes ko fetch karega.

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

// Get a single note
export const getNoteController = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const note = await getNoteById(id, userId);

        if (!note) {// ye line check kar rahi hai ki agar note exist nahi karta to user ko 404 error bhej de.
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
        req.log.error(error, "Failed to fetch note");// ye line error ko log karne ke liye hai, taaki agar koi error aaye to usko track kiya ja sake. 
        //loge mtlb ki error ko record karna, taaki future me agar koi issue aaye to usko trace kiya ja sake.

        return res.status(500).json({
            success: false,
            message: "Failed to fetch note",
        });
    }
};

// Update a note
export const updateNoteController = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const userId = req.user.userId;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required",
            });
        }

        const note = await updateNote(
            id,
            userId,
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

// Delete a note
export const deleteNoteController = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const deletedNote = await deleteNote(id, userId);

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