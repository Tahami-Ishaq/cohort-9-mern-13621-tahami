import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NoteEditor from "../src/components/NoteEditor";
import { withTestContext } from "./testUtils";

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
        await withTestContext(
            user.click(screen.getByRole("button", { name: "Save changes" })),
            "save edited note interaction"
        );

        expect(onSave).toHaveBeenCalledWith({ title: "New title", content: "New content" });
    });

    it("calls cancel and displays save errors", async () => {
        const user = userEvent.setup();
        const onCancel = jest.fn();
        const onSave = jest.fn().mockRejectedValue(new Error("Save failed"));
        render(<NoteEditor note={null} onSave={onSave} onCancel={onCancel} saving={false} />);

        await withTestContext(
            user.type(screen.getByLabelText("Title"), "Title"),
            "enter note title"
        );
        await withTestContext(
            user.type(screen.getByLabelText("Your thoughts"), "Content"),
            "enter note content"
        );
        await withTestContext(
            user.click(screen.getByRole("button", { name: "Save note" })),
            "save new note interaction"
        );
        expect(await withTestContext(
            screen.findByRole("alert"),
            "wait for note save error"
        )).toHaveTextContent("Save failed");

        await withTestContext(
            user.click(screen.getByRole("button", { name: "Cancel" })),
            "cancel note editor interaction"
        );
        expect(onCancel).toHaveBeenCalled();
    });

    it("disables saving while a request is in progress", () => {
        render(<NoteEditor note={null} onSave={jest.fn()} onCancel={jest.fn()} saving />);

        expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
    });
});
