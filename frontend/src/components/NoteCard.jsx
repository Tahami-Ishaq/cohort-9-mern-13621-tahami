const stripHtml = (value = "") => value.replace(/<[^>]*>/g, "").trim();

const NoteCard = ({ note, onEdit, onDelete }) => {
    const previewContent = note.content || "";
    const plainTitle = stripHtml(note.title || "Untitled");

    return (
        <article className="note-card">
            <div className="note-card-content">
                <h3>{plainTitle}</h3>

                <div
                    className="note-card-body"
                    dangerouslySetInnerHTML={{
                        __html:
                            stripHtml(previewContent).length > 150
                                ? `${stripHtml(previewContent).substring(0, 150)}...`
                                : previewContent,
                    }}
                />
            </div>

            <div className="note-card-footer">
                <span>
                    {new Date(note.updated_at).toLocaleDateString()}
                </span>

                <div className="note-actions">
                    <button
                        type="button"
                        onClick={() => onEdit(note)}
                        className="edit-btn"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        onClick={() => onDelete(note.id)}
                        className="delete-btn"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </article>
    );
};

export default NoteCard;