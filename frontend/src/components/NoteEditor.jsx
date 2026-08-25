import { useEffect, useState } from "react";

const NoteEditor = ({
    note,
    onSave,
    onCancel,
    saving,
}) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

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

        await onSave({
            title: title.trim(),
            content: content.trim(),
        });
    };

    return (
        <div className="editor-overlay">
            <div className="note-editor">
                <div className="editor-header">
                    <div>
                        <span className="editor-label">
                            {note ? "EDIT NOTE" : "NEW NOTE"}
                        </span>

                        <h2>
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
        </div>
    );
};

export default NoteEditor;