jest.mock("../src/services/api", () => ({
    __esModule: true,
    default: "/api/v1",
}));

import {
    createNote,
    deleteNote,
    getNote,
    getNotes,
    updateNote,
} from "../src/services/noteService";

const response = (body, ok = true) => ({
    ok,
    json: jest.fn().mockResolvedValue(body),
});

describe("noteService", () => {
    beforeEach(() => {
        globalThis.fetch = jest.fn();
        localStorage.setItem("token", "notes-token");
    });

    afterEach(() => jest.restoreAllMocks());

    it("fetches all notes with authentication", async () => {
        const data = { data: [{ id: 1, title: "Note" }] };
        fetch.mockResolvedValue(response(data));

        await expect(getNotes()).resolves.toEqual(data);
        expect(fetch).toHaveBeenCalledWith("/api/v1/notes", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer notes-token",
            },
        });
    });

    it("fetches one note and sends note bodies for create and update", async () => {
        fetch.mockResolvedValue(response({ data: { id: 7 } }));

        await getNote(7);
        expect(fetch).toHaveBeenLastCalledWith("/api/v1/notes/7", expect.objectContaining({ method: "GET" }));

        await createNote({ title: "New", content: "Text" });
        expect(fetch).toHaveBeenLastCalledWith("/api/v1/notes", expect.objectContaining({
            method: "POST",
            body: JSON.stringify({ title: "New", content: "Text" }),
        }));

        await updateNote(7, { title: "Updated", content: "Text" });
        expect(fetch).toHaveBeenLastCalledWith("/api/v1/notes/7", expect.objectContaining({
            method: "PUT",
            body: JSON.stringify({ title: "Updated", content: "Text" }),
        }));
    });

    it("deletes a note and reports API errors", async () => {
        fetch.mockResolvedValueOnce(response({ success: true }));
        await expect(deleteNote(7)).resolves.toEqual({ success: true });
        expect(fetch).toHaveBeenCalledWith("/api/v1/notes/7", expect.objectContaining({ method: "DELETE" }));

        fetch.mockResolvedValueOnce(response({ message: "Note not found" }, false));
        await expect(getNote(99)).rejects.toThrow("Note not found");
    });

    it("uses fallback errors when a request fails", async () => {
        fetch.mockRejectedValue(new Error("offline"));

        await expect(getNotes()).rejects.toThrow("offline");
        await expect(createNote({})).rejects.toThrow("offline");
        await expect(updateNote(1, {})).rejects.toThrow("offline");
        await expect(deleteNote(1)).rejects.toThrow("offline");
    });
});
