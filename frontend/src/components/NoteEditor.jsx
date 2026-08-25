import { useEffect, useRef, useState } from "react";

const NoteEditor = ({
    note,
    onSave,
    onCancel,
    saving,
}) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [editorError, setEditorError] = useState("");
    const dialogRef = useRef(null);
    const titleInputRef = useRef(null);
    const cancelRef = useRef(onCancel);

    cancelRef.current = onCancel;

    useEffect(() => {
        const dialog = dialogRef.current;
        const previouslyFocused = document.activeElement;

        if (!dialog.open) {
            dialog.showModal();
        }

        titleInputRef.current?.focus();

        return () => {
            if (dialog.open) {
                dialog.close();
            }

            if (previouslyFocused instanceof HTMLElement) {
                previouslyFocused.focus();
            }
        };
    }, []);

    useEffect(() => {
        if (note) {
            setTitle(note.title || "");
            setContent(note.content || "");
        } else {
            setTitle("");
            setContent("");
        }
    }, [note]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            return;
        }

        setEditorError("");

        try {
            await onSave({
                title: title.trim(),
                content: content.trim(),
            });
        } catch (error) {
            setEditorError(
                error instanceof Error && error.message
                    ? error.message
                    : "Unable to save note."
            );
        }
    };

    const handleDialogCancel = (e) => {
        e.preventDefault();
        cancelRef.current();
    };

    const handleDialogKeyDown = (e) => {
        if (e.key !== "Tab") {
            return;
        }

        const dialog = dialogRef.current;
        const focusableElements = dialog?.querySelectorAll(
            "button:not(:disabled), input:not(:disabled), textarea:not(:disabled)"
        );

        if (!focusableElements?.length) {
            e.preventDefault();
            dialog?.focus();
            return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    };

    return (
        <dialog
            ref={dialogRef}
            className="editor-overlay"
            aria-labelledby="note-editor-title"
            onCancel={handleDialogCancel}
            onKeyDown={handleDialogKeyDown}
        >
            <div className="note-editor">
                <div className="editor-header">
                    <div>
                        <span className="editor-label">
                            {note ? "EDIT NOTE" : "NEW NOTE"}
                        </span>

                        <h2 id="note-editor-title">
                            {note
                                ? "Edit your note"
                                : "Create a new note"}
                        </h2>
                    </div>

                    <button
                        type="button"
                        className="close-btn"
                        onClick={onCancel}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="editor-field">
                        <label htmlFor="note-title">
                            Title
                        </label>

                        <input
                            ref={titleInputRef}
                            id="note-title"
                            type="text"
                            value={title}
                            onChange={(e) =>
                                setTitle(e.target.value)
                            }
                            placeholder="Give your note a title..."
                        />
                    </div>

                    <div className="editor-field">
                        <label htmlFor="note-content">
                            Your thoughts
                        </label>

                        <textarea
                            id="note-content"
                            value={content}
                            onChange={(e) =>
                                setContent(e.target.value)
                            }
                            placeholder="Start writing your thoughts..."
                            rows="12"
                        />
                    </div>

                    {editorError && (
                        <div className="notes-error" role="alert">
                            {editorError}
                        </div>
                    )}

                    <div className="editor-actions">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="save-btn"
                            disabled={
                                saving ||
                                !title.trim() ||
                                !content.trim()
                            }
                        >
                            {saving
                                ? "Saving..."
                                : note
                                    ? "Save changes"
                                    : "Save note"}
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    );
};

export default NoteEditor;