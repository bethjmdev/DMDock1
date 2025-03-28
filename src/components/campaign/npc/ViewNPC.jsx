import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "../../../components/auth/AuthContext";

const ViewNPC = () => {
  const { campaignId, npcId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [npc, setNpc] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  useEffect(() => {
    const fetchNPCAndNotes = async () => {
      try {
        // Fetch NPC
        const npcDoc = await getDoc(doc(db, "NPC", npcId));
        if (!npcDoc.exists()) {
          throw new Error("NPC not found");
        }
        setNpc({ id: npcDoc.id, ...npcDoc.data() });

        // Fetch Notes
        const q = query(
          collection(db, "NPCNotes"),
          where("npcId", "==", npcId)
        );
        const notesSnapshot = await getDocs(q);
        const notesList = notesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt
            ? new Date(doc.data().createdAt)
            : null,
        }));
        setNotes(notesList);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNPCAndNotes();
  }, [npcId]);

  if (loading) return <div>Loading...</div>;
  if (!npc) return <div>NPC not found</div>;

  return (
    <div className="view-npc-container">
      {/* NPC Details */}
      <div className="npc-details">
        <h1>{npc.name}</h1>
        {/* Display all NPC information */}
      </div>

      {/* Notes Section */}
      <div className="notes-section">
        <div className="notes-header">
          <h2>Notes</h2>
          <button
            onClick={() =>
              navigate(`/campaign/${campaignId}/npcs/${npcId}/add-note`)
            }
            className="add-note-button"
          >
            Add Note
          </button>
        </div>

        {notes.length === 0 ? (
          <p>No notes yet</p>
        ) : (
          <div className="notes-grid">
            {notes.map((note) => (
              <div key={note.id} className="note-card">
                <h3>{note.title}</h3>
                <p>{note.content}</p>
                <span>{note.createdAt?.toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewNPC;
