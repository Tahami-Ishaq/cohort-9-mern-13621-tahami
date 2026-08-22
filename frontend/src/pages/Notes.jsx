import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNotes } from "../services/noteService";

const Notes = () => {
    const navigate = useNavigate();

    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                setLoading(true);

                const response = await getNotes();

                setNotes(response.data || []);
            } catch (error) {
                setError(error.message);

                if (
                    error.message.toLowerCase().includes("token") ||
                    error.message.toLowerCase().includes("unauthorized")
                ) {
                    localStorage.removeItem("token");
                    navigate("/login");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchNotes();
    }, [navigate]);

    if (loading) {
        return <div>Loading notes...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <main>
            <h1>My Notes</h1>

            {notes.length === 0 ? (
                <p>No notes yet.</p>
            ) : (
                notes.map((note) => (
                    <div key={note.id}>
                        <h2>{note.title}</h2>
                        <p>{note.content}</p>
                    </div>
                ))
            )}
        </main>
    );
};

export default Notes;