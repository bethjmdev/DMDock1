import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import "./Notes.css";

const ViewNote = () => {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const { campaignId, noteId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const noteDoc = await getDoc(doc(db, "Notes", noteId));
        if (noteDoc.exists()) {
          setNote({ id: noteDoc.id, ...noteDoc.data() });
        }
      } catch (error) {
        console.error("Error fetching note:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [noteId]);

  const handleDeleteNote = async () => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await deleteDoc(doc(db, "Notes", noteId));
        navigate(`/campaign/${campaignId}/notes`);
      } catch (error) {
        console.error("Error deleting note:", error);
        alert("Failed to delete note");
      }
    }
  };

  if (loading) return <h2 className="text-gray-800">Loading Note...</h2>;
  if (!note) return <div className="notes-container">Note not found</div>;

  return (
    <div className="notes-container">
      <div className="notes-header">
        <h2 className="text-2xl font-bold text-gray-800">{note.title}</h2>
        <div className="button-group">
          <button
            onClick={() => navigate(`/campaign/${campaignId}/notes`)}
            className="auth-button"
            style={{ width: "auto", padding: "0.5rem 1rem" }}
          >
            Back to Notes
          </button>
          <button
            onClick={handleDeleteNote}
            className="edit-button"
            style={{
              backgroundColor: "#dc2626",
              marginLeft: "0.5rem",
              padding: "0.5rem 1rem",
            }}
          >
            Delete Note
          </button>
        </div>
      </div>

      <div
        className="note-card"
        style={{ maxWidth: "800px", margin: "0 auto" }}
      >
        <div className="note-header">
          <div>
            <p className="text-sm text-gray-600">
              Created At: {new Date(note.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="note-content">
          <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
        </div>
      </div>
    </div>
  );
};

export default ViewNote;
