const API_URL = "http://localhost:5000/api/v1/notes";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};

export const getNotes = async () => {
    const response = await fetch(API_URL, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch notes");
    }

    return data;
};

export const getNote = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch note");
    }

    return data;
};

export const createNote = async (noteData) => {
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
};

export const updateNote = async (id, noteData) => {
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
};

export const deleteNote = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to delete note");
    }

    return data;
};