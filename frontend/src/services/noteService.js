import API_BASE_URL from "./api";

const API_URL = `${API_BASE_URL}/notes`;

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};

export const getNotes = async (search = "") => {
    try {
        const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
        const response = await fetch(`${API_URL}${query}`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch notes");
        }

        return data;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to fetch notes", { cause: error });
    }
};

export const getNote = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch note");
        }

        return data;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to fetch note", { cause: error });
    }
};

export const createNote = async (noteData) => {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(noteData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to create note");
        }

        return data;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to create note", { cause: error });
    }
};

export const updateNote = async (id, noteData) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(noteData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to update note");
        }

        return data;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to update note", { cause: error });
    }
};

export const deleteNote = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to delete note");
        }

        return data;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to delete note", { cause: error });
    }
};