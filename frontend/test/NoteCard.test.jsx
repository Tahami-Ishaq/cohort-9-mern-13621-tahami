import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NoteCard from "../src/components/NoteCard";

describe("NoteCard", () => {
    const note = {
        id: 1,
        title: "Shopping list",
        content: "Buy milk and bread",
        updated_at: "2026-08-27T00:00:00.000Z",
    };

    it("renders the note title and content", () => {
        render(<NoteCard note={note} onEdit={() => {}} onDelete={() => {}} />);

        expect(screen.getByRole("heading", { name: "Shopping list" })).toBeInTheDocument();
        expect(screen.getByText("Buy milk and bread")).toBeInTheDocument();
    });

    it("calls the edit and delete handlers", async () => {
        const user = userEvent.setup();
        const onEdit = jest.fn();
        const onDelete = jest.fn();

        render(<NoteCard note={note} onEdit={onEdit} onDelete={onDelete} />);

        await user.click(screen.getByRole("button", { name: "Edit" }));
        await user.click(screen.getByRole("button", { name: "Delete" }));

        expect(onEdit).toHaveBeenCalledWith(note);
        expect(onDelete).toHaveBeenCalledWith(note.id);
    });
});