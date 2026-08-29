import pool from "../config/db.js";

// Create a note
export const createNote = async (userId, title, content) => {
    try {
        const result = await pool.query(
            `INSERT INTO notes (user_id, title, content)
             VALUES ($1, $2, $3)
             RETURNING id, user_id, title, content, created_at, updated_at`,
            [userId, title, content]
        );

        return result.rows[0];
    } catch (error) {
        throw new Error("Failed to create note", { cause: error });
    }
};

// Get all notes belonging to a user
export const getNotesByUserId = async (userId, search = "") => {
    try {
        const trimmedSearch = search?.trim() ?? "";
        const params = [userId];

        let query = `
            SELECT id, user_id, title, content, created_at, updated_at
            FROM notes
            WHERE user_id = $1
        `;

        if (trimmedSearch) {
            query += ` AND title ILIKE $2 `;
            params.push(`%${trimmedSearch}%`);
        }

        query += ` ORDER BY created_at DESC`;

        const result = await pool.query(query, params);

        return result.rows;
    } catch (error) {
        throw new Error("Failed to fetch notes for user", { cause: error });
    }
};

// Get a single note belonging to a user
export const getNoteById = async (noteId, userId) => {
    try {
        const result = await pool.query(
            `SELECT id, user_id, title, content, created_at, updated_at
             FROM notes
             WHERE id = $1 AND user_id = $2`,
            [noteId, userId]
        );

        return result.rows[0];
    } catch (error) {
        throw new Error("Failed to fetch note by ID", { cause: error });
    }
};

// Update a note belonging to a user
export const updateNote = async (noteId, userId, title, content) => {
    try {
        const result = await pool.query(
            `UPDATE notes
             SET title = $1,
                 content = $2,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $3 AND user_id = $4
             RETURNING id, user_id, title, content, created_at, updated_at`,
            [title, content, noteId, userId]
        );

        return result.rows[0];
    } catch (error) {
        throw new Error("Failed to update note", { cause: error });
    }
};

// Delete a note belonging to a user
export const deleteNote = async (noteId, userId) => {
    try {
        const result = await pool.query(
            `DELETE FROM notes
             WHERE id = $1 AND user_id = $2
             RETURNING id`,
            [noteId, userId]
        );

        return result.rows[0];
    } catch (error) {
        throw new Error("Failed to delete note", { cause: error });
    }
};