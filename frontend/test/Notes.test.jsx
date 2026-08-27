import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Notes from "../src/pages/Notes";
import { createNote, deleteNote, getNotes, updateNote } from "../src/services/noteService";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));
jest.mock("../src/services/noteService", () => ({
    createNote: jest.fn(),
    deleteNote: jest.fn(),
    getNotes: jest.fn(),
    updateNote: jest.fn(),
}));
jest.mock("../src/components/NoteCard", () => ({ note, onEdit, onDelete }) => (
    <div>
        <span>{note.title}</span>
        <button onClick={() => onEdit(note)}>Edit note</button>
        <button onClick={() => onDelete(note.id)}>Delete note</button>
    </div>
));
jest.mock("../src/components/NoteEditor", () => ({ note, onSave, onCancel, saving }) => (
    <div role="dialog">
        <span>{note ? "Editing" : "Creating"}</span>
        <button onClick={() => onSave({ title: "Saved title", content: "Saved content" })} disabled={saving}>Save editor</button>
        <button onClick={onCancel}>Cancel editor</button>
    </div>
));

const renderNotes = () => render(
    <MemoryRouter>
        <Notes />
    </MemoryRouter>
);

describe("Notes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        window.confirm = jest.fn();
    });

    it("shows loading then fetched notes and the correct count", async () => {
        getNotes.mockResolvedValue({ data: [{ id: 1, title: "First note" }, { id: 2, title: "Second note" }] });
        renderNotes();

        expect(screen.getByText("Loading your notes...")).toBeInTheDocument();
        expect(await screen.findByText("First note")).toBeInTheDocument();
        expect(screen.getByText("2 notes")).toBeInTheDocument();
    });

    it("shows an empty state and opens the create editor", async () => {
        const user = userEvent.setup();
        getNotes.mockResolvedValue({ data: [] });
        renderNotes();

        await screen.findByText("Your notebook is empty");
        await user.click(screen.getByRole("button", { name: "Create your first note" }));

        expect(screen.getByRole("dialog")).toHaveTextContent("Creating");
    });

    it("creates a note and refreshes the list", async () => {
        const user = userEvent.setup();
        getNotes.mockResolvedValueOnce({ data: [] }).mockResolvedValueOnce({ data: [{ id: 1, title: "Saved title" }] });
        createNote.mockResolvedValue({ success: true });
        renderNotes();

        await screen.findByText("Your notebook is empty");
        await user.click(screen.getByRole("button", { name: "Create your first note" }));
        await user.click(screen.getByRole("button", { name: "Save editor" }));

        await waitFor(() => expect(createNote).toHaveBeenCalledWith({ title: "Saved title", content: "Saved content" }));
        expect(await screen.findByText("Saved title")).toBeInTheDocument();
        expect(getNotes).toHaveBeenCalledTimes(2);
    });

    it("updates an existing note", async () => {
        const user = userEvent.setup();
        const note = { id: 4, title: "Original" };
        getNotes.mockResolvedValue({ data: [note] });
        updateNote.mockResolvedValue({ success: true });
        renderNotes();

        await user.click(await screen.findByRole("button", { name: "Edit note" }));
        expect(screen.getByRole("dialog")).toHaveTextContent("Editing");
        await user.click(screen.getByRole("button", { name: "Save editor" }));

        await waitFor(() => expect(updateNote).toHaveBeenCalledWith(4, { title: "Saved title", content: "Saved content" }));
    });

    it("deletes a confirmed note and supports logout", async () => {
        const user = userEvent.setup();
        const note = { id: 4, title: "To delete" };
        getNotes.mockResolvedValue({ data: [note] });
        window.confirm.mockReturnValue(true);
        deleteNote.mockResolvedValue({ success: true });
        localStorage.setItem("token", "token");
        renderNotes();

        await user.click(await screen.findByRole("button", { name: "Delete note" }));
        await waitFor(() => expect(deleteNote).toHaveBeenCalledWith(4));
        expect(screen.queryByText("To delete")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Logout" }));
        expect(localStorage.getItem("token")).toBeNull();
        expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    it("shows fetch and delete errors", async () => {
        const user = userEvent.setup();
        getNotes.mockRejectedValueOnce(new Error("Unable to load notes"));
        renderNotes();
        expect(await screen.findByText("Unable to load notes")).toBeInTheDocument();

        getNotes.mockResolvedValueOnce({ data: [{ id: 1, title: "Note" }] });
        window.confirm.mockReturnValue(true);
        deleteNote.mockRejectedValue(new Error("Unable to delete note"));
        renderNotes();
        await user.click(await screen.findByRole("button", { name: "Delete note" }));
        expect(await screen.findByText("Unable to delete note")).toBeInTheDocument();
    });
});
