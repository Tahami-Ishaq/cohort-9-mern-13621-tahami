import { useEffect, useRef, useState } from "react";

const toolbarButtons = [
    { label: "Bold", action: "bold", icon: "B" },
    { label: "Italic", action: "italic", icon: "I" },
    { label: "Heading", action: "formatBlock", icon: "H1" },
    { label: "Bullet list", action: "insertUnorderedList", icon: "• List" },
    { label: "Number list", action: "insertOrderedList", icon: "1. List" },
];

const NoteEditor = ({
    note,
    onSave,
    onCancel,
    saving,
}) => {
    const [title, setTitle] = useState(() => note?.title || "");
    const [content, setContent] = useState(() => note?.content || "");
    const [editorError, setEditorError] = useState("");
    const dialogRef = useRef(null);
    const titleEditorRef = useRef(null);
    const contentEditorRef = useRef(null);
    const titleInputRef = useRef(null);
    const contentInputRef = useRef(null);
    const cancelRef = useRef(onCancel);

    useEffect(() => {
        cancelRef.current = onCancel;
    }, [onCancel]);

    useEffect(() => {
        const dialog = dialogRef.current;
        const previouslyFocused = document.activeElement;

        if (!dialog.open) {
            dialog.showModal();
        }

        if (titleEditorRef.current && titleEditorRef.current.innerHTML !== title) {
            titleEditorRef.current.innerHTML = title || "";
        }

        if (titleInputRef.current && titleInputRef.current.value !== title) {
            titleInputRef.current.value = title || "";
        }

        if (titleEditorRef.current) {
            titleEditorRef.current.focus();
        }

        if (contentEditorRef.current && contentEditorRef.current.innerHTML !== content) {
            contentEditorRef.current.innerHTML = content || "";
        }

        if (contentInputRef.current && contentInputRef.current.value !== content) {
            contentInputRef.current.value = content || "";
        }

        if (contentEditorRef.current && contentEditorRef.current.innerHTML !== content) {
            contentEditorRef.current.innerHTML = content || "";
        }

        return () => {
            if (dialog.open) {
                dialog.close();
            }

            if (previouslyFocused instanceof HTMLElement) {
                previouslyFocused.focus();
            }
        };
    }, [note?.id]);

    const syncTitle = () => {
        const nextValue = titleEditorRef.current?.innerHTML || "";
        setTitle(nextValue);

        if (titleInputRef.current) {
            titleInputRef.current.value = nextValue;
        }

        return nextValue;
    };

    const syncContent = () => {
        const nextValue = contentEditorRef.current?.innerHTML || "";
        setContent(nextValue);

        if (contentInputRef.current) {
            contentInputRef.current.value = nextValue;
        }

        return nextValue;
    };

    const applyFormatting = (targetRef, command, value = null) => {
        if (!targetRef.current) {
            return;
        }

        targetRef.current.focus();
        document.execCommand(command, false, value);

        if (targetRef === titleEditorRef) {
            syncTitle();
        } else {
            syncContent();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const normalizedTitle = syncTitle();
        const normalizedContent = syncContent();
        const titleValue = normalizedTitle.replace(/<[^>]*>/g, "").trim();
        const contentValue = normalizedContent.replace(/<[^>]*>/g, "").trim();

        if (!titleValue || !contentValue) {
            return;
        }

        setEditorError("");

        try {
            await onSave({
                title: titleValue,
                content: contentValue,
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
                    <input
                        ref={titleInputRef}
                        id="note-title"
                        type="text"
                        value={title}
                        aria-label="Title"
                        onChange={(event) => {
                            const nextValue = event.target.value;
                            setTitle(nextValue);
                            if (titleEditorRef.current) {
                                titleEditorRef.current.innerHTML = nextValue;
                            }
                        }}
                        style={{
                            position: "absolute",
                            width: "1px",
                            height: "1px",
                            opacity: 0,
                        }}
                    />

                    <div className="editor-field">
                        <label htmlFor="note-title">
                            Title
                        </label>

                        <div className="rich-editor-toolbar rich-title-toolbar">
                            {toolbarButtons.map((button) => (
                                <button
                                    key={`title-${button.action}`}
                                    type="button"
                                    className="toolbar-btn"
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() =>
                                        button.action === "formatBlock"
                                            ? applyFormatting(titleEditorRef, button.action, "h2")
                                            : applyFormatting(titleEditorRef, button.action)
                                    }
                                    title={button.label}
                                >
                                    {button.icon}
                                </button>
                            ))}
                        </div>

                        <div
                            ref={titleEditorRef}
                            className="rich-editor title-editor"
                            contentEditable
                            suppressContentEditableWarning
                            onInput={syncTitle}
                            data-placeholder="Give your note a title..."
                        />
                    </div>

                    <textarea
                        ref={contentInputRef}
                        id="note-content"
                        value={content}
                        aria-label="Your thoughts"
                        onChange={(event) => {
                            const nextValue = event.target.value;
                            setContent(nextValue);
                            if (contentEditorRef.current) {
                                contentEditorRef.current.innerHTML = nextValue;
                            }
                        }}
                        style={{
                            position: "absolute",
                            width: "1px",
                            height: "1px",
                            opacity: 0,
                        }}
                    />

                    <div className="editor-field">
                        <label htmlFor="note-content">
                            Your thoughts
                        </label>

                        <div className="rich-editor-toolbar">
                            {toolbarButtons.map((button) => (
                                <button
                                    key={`content-${button.action}`}
                                    type="button"
                                    className="toolbar-btn"
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() =>
                                        button.action === "formatBlock"
                                            ? applyFormatting(contentEditorRef, button.action, "h2")
                                            : applyFormatting(contentEditorRef, button.action)
                                    }
                                    title={button.label}
                                >
                                    {button.icon}
                                </button>
                            ))}
                        </div>

                        <div
                            ref={contentEditorRef}
                            className="rich-editor"
                            contentEditable
                            suppressContentEditableWarning
                            onInput={syncContent}
                            data-placeholder="Start writing your thoughts..."
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
                                !title.replace(/<[^>]*>/g, "").trim() ||
                                !content.replace(/<[^>]*>/g, "").trim()
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