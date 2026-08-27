import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NoteEditor from "../src/components/NoteEditor";

beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function () {
        this.open = true;
    };
    HTMLDialogElement.prototype.close = function () {
        this.open = false;
    };
});

describe("NoteEditor", () => {
    it("starts in create mode with save disabled for blank fields", () => {
        render(<NoteEditor note={null} onSave={jest.fn()} onCancel={jest.fn()} saving={false} />);

        expect(screen.getByRole("heading", { name: "Create a new note" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Save note" })).toBeDisabled();
    });

    it("prepopulates edit mode and sends trimmed values", async () => {
        const user = userEvent.setup();
        const onSave = jest.fn().mockResolvedValue(undefined);
        render(
            <NoteEditor
                note={{ title: "Old title", content: "Old content" }}
                onSave={onSave}
                onCancel={jest.fn()}
                saving={false}
            />
        );

        expect(screen.getByRole("heading", { name: "Edit your note" })).toBeInTheDocument();
        fireEvent.change(screen.getByLabelText("Title"), { target: { value: "  New title  " } });
        fireEvent.change(screen.getByLabelText("Your thoughts"), { target: { value: "  New content  " } });
        await user.click(screen.getByRole("button", { name: "Save changes" }));

        expect(onSave).toHaveBeenCalledWith({ title: "New title", content: "New content" });
    });

    it("calls cancel and displays save errors", async () => {
        const user = userEvent.setup();
        const onCancel = jest.fn();
        const onSave = jest.fn().mockRejectedValue(new Error("Save failed"));
        render(<NoteEditor note={null} onSave={onSave} onCancel={onCancel} saving={false} />);

        await user.type(screen.getByLabelText("Title"), "Title");
        await user.type(screen.getByLabelText("Your thoughts"), "Content");
        await user.click(screen.getByRole("button", { name: "Save note" }));
        expect(await screen.findByRole("alert")).toHaveTextContent("Save failed");

        await user.click(screen.getByRole("button", { name: "Cancel" }));
        expect(onCancel).toHaveBeenCalled();
    });

    it("disables saving while a request is in progress", () => {
        render(<NoteEditor note={null} onSave={jest.fn()} onCancel={jest.fn()} saving />);

        expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
    });
});
