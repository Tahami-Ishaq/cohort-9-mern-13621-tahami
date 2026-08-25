const NoteCard = ({ note, onEdit, onDelete }) => {
    return (
        <article className="note-card">
            <div className="note-card-content">
                <h3>{note.title}</h3>

                <p>
                    {note.content?.length > 150
                        ? `${note.content.substring(0, 150)}...`
                        : note.content}
                </p>
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