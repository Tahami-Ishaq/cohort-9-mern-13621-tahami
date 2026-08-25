import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import NoteCard from "../components/NoteCard";
import NoteEditor from "../components/NoteEditor";

import {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
} from "../services/noteService";

import "../styles/notes.css";

const Notes = () => {
    const navigate = useNavigate();

    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [showEditor, setShowEditor] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getNotes();

            setNotes(response.data || []);
        } catch (error) {
            setError(
                error.message || "Unable to load your notes."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const handleCreate = () => {
        setSelectedNote(null);
        setShowEditor(true);
    };

    const handleEdit = (note) => {
        setSelectedNote(note);
        setShowEditor(true);
    };

    const handleSave = async (noteData) => {
        try {
            setSaving(true);
            setError("");

            if (selectedNote) {
                await updateNote(
                    selectedNote.id,
                    noteData
                );
            } else {
                await createNote(noteData);
            }

            setShowEditor(false);
            setSelectedNote(null);

            await fetchNotes();
        } catch (error) {
            setError(
                error.message || "Unable to save note."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this note?"
        );

        if (!confirmed) return;

        try {
            setError("");

            await deleteNote(id);

            setNotes((prevNotes) =>
                prevNotes.filter((note) => note.id !== id)
            );
        } catch (error) {
            setError(
                error.message || "Unable to delete note."
            );
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <main className="notes-page">
            <header className="notes-header">
                <Link to="/profile" className="profile-link">
                    Profile
                </Link>
                <div className="notes-brand">
                    <div className="notes-brand-mark">
                        N
                    </div>

                    <div>
                        <h1>My Notes</h1>
                        <p>Your thoughts, your space.</p>
                    </div>
                </div>

                <div className="notes-header-actions">
                    <button
                        className="new-note-btn"
                        onClick={handleCreate}
                    >
                        <span>+</span>
                        New note
                    </button>

                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </header>

            <section className="notes-content">
                <div className="notes-intro">
                    <div>
                        <span className="section-eyebrow">
                            YOUR COLLECTION
                        </span>

                        <h2>All your thoughts</h2>
                    </div>

                    <span className="note-count">
                        {notes.length}{" "}
                        {notes.length === 1
                            ? "note"
                            : "notes"}
                    </span>
                </div>

                {error && (
                    <div className="notes-error">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="notes-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading your notes...</p>
                    </div>
                ) : notes.length === 0 ? (
                    <div className="empty-notes">
                        <div className="empty-icon">
                            ✦
                        </div>

                        <h3>Your notebook is empty</h3>

                        <p>
                            Capture your first thought,
                            idea or reminder.
                        </p>

                        <button
                            onClick={handleCreate}
                            className="empty-create-btn"
                        >
                            Create your first note
                        </button>
                    </div>
                ) : (
                    <div className="notes-grid">
                        {notes.map((note) => (
                            <NoteCard
                                key={note.id}
                                note={note}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </section>

            {showEditor && (
                <NoteEditor
                    note={selectedNote}
                    onSave={handleSave}
                    onCancel={() => {
                        setShowEditor(false);
                        setSelectedNote(null);
                    }}
                    saving={saving}
                />
            )}
        </main>
    );
};

export default Notes;