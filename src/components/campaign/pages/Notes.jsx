import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../../firebase"; // adjust path as needed
import "./Notes.css";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { campaignId } = useParams(); // Get campaignId from URL params

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const q = query(
          collection(db, "Notes"),
          where("campaignId", "==", campaignId),
          where("dmId", "==", auth.currentUser.uid)
        );

        const querySnapshot = await getDocs(q);
        const notesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotes(notesList);
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [campaignId]); // Add campaignId as dependency

  if (loading) {
    return <h2 className="text-gray-800">Loading Notes...</h2>;
  }

  return (
    <div className="notes-container">
      <div className="notes-header">
        <h2 className="text-2xl font-bold text-gray-800">Campaign Notes</h2>
        <Link
          to="create-note"
          className="auth-button text-gray-800"
          style={{ width: "auto", padding: "0.5rem 1rem" }}
        >
          Create Note
        </Link>
      </div>

      {notes.length === 0 ? (
        <p className="text-center text-gray-600">
          No notes found. Create your first note!
        </p>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <Link
              key={note.id}
              to={`/campaign/${campaignId}/notes/${note.id}`}
              className="note-card"
            >
              <div className="note-header">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {note.title}
                  </h3>
                  {/* <p className="text-sm text-gray-600">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p> */}
                </div>
              </div>
              {/* <div className="note-preview">
                <p className="text-gray-800 line-clamp-3">{note.content}</p>
              </div> */}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notes;
