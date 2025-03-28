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
import "./ViewEncounter.css";

const ViewEncounter = () => {
  const { campaignId, encounterId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [encounter, setEncounter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState([]);
  const db = getFirestore();

  const fetchEncounter = async () => {
    try {
      const encounterDoc = await getDoc(doc(db, "Encounter", encounterId));

      if (!encounterDoc.exists()) {
        setError("Encounter not found");
        return;
      }

      const encounterData = {
        id: encounterDoc.id,
        ...encounterDoc.data(),
        createdAt: encounterDoc.data().createdAt?.toDate(),
        lastModified: encounterDoc.data().lastModified?.toDate(),
      };

      // Verify this encounter belongs to the current user
      if (encounterData.userId !== currentUser.uid) {
        setError("You don't have permission to view this encounter");
        return;
      }

      setEncounter(encounterData);
    } catch (err) {
      console.error("Error fetching encounter:", err);
      setError("Failed to load encounter");
    } finally {
      setLoading(false);
    }
  };

  const fetchEncounterNotes = async () => {
    try {
      const q = query(
        collection(db, "EncounterNotes"),
        where("encounterId", "==", encounterId)
      );

      const querySnapshot = await getDocs(q);
      const notesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt ? new Date(doc.data().createdAt) : null,
      }));

      // Sort notes by creation date (newest first)
      notesList.sort((a, b) => b.createdAt - a.createdAt);

      setNotes(notesList);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchEncounter();
        await fetchEncounterNotes();
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [encounterId, currentUser]);

  const formatDate = (date) => {
    if (!date) return "Unknown date";
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Add this helper function to safely render armor class
  const renderArmorClass = (ac) => {
    if (!ac) return "N/A";
    if (typeof ac === "number") return ac;
    if (Array.isArray(ac)) {
      return ac[0]?.value || "N/A";
    }
    if (typeof ac === "object") {
      return ac.value || "N/A";
    }
    return ac;
  };

  if (loading) return <div className="loading">Loading encounter...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!encounter) return <div className="error">Encounter not found</div>;

  return (
    <div className="view-encounter-container">
      <div className="encounter-header">
        <button
          className="back-button"
          onClick={() => navigate(`/campaign/${campaignId}/encounter`)}
        >
          ← Back to Encounters
        </button>
        <h1>{encounter.name}</h1>
        <div className="encounter-meta">
          Created: {formatDate(encounter.createdAt)}
        </div>
      </div>

      <div className="encounter-info">
        <div className="info-section">
          <h2>Basic Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Difficulty:</label>
              <span>{encounter.difficulty}</span>
            </div>
            <div className="info-item">
              <label>Party Level:</label>
              <span>{encounter.partyLevel}</span>
            </div>
            <div className="info-item">
              <label>Environment:</label>
              <span>{encounter.environment}</span>
            </div>
            <div className="info-item">
              <label>Location:</label>
              <span>{encounter.location}</span>
            </div>
            <div className="info-item">
              <label>Total CR:</label>
              <span>{encounter.totalCR?.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="monsters-section">
          <h2>Monsters</h2>
          <div className="monsters-grid">
            {encounter.monsters.map((monster, index) => (
              <div key={index} className="monster-detail-card">
                <h3>{monster.name}</h3>
                <div className="monster-stats">
                  <div className="stat">
                    <label>CR:</label>
                    <span>{monster.challenge_rating}</span>
                  </div>
                  <div className="stat">
                    <label>HP:</label>
                    <span>{monster.hit_points}</span>
                  </div>
                  <div className="stat">
                    <label>AC:</label>
                    <span>{renderArmorClass(monster.armor_class)}</span>
                  </div>
                </div>
                {monster.actions && monster.actions.length > 0 && (
                  <div className="monster-actions">
                    <h4>Actions</h4>
                    <ul>
                      {monster.actions.map((action, actionIndex) => (
                        <li key={actionIndex}>
                          <strong>{action.name}:</strong> {action.desc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="notes-section">
          <div className="notes-header">
            <h2>Notes</h2>
            <button
              onClick={() =>
                navigate(
                  `/campaign/${campaignId}/encounters/${encounterId}/add-note`
                )
              }
              className="add-note-button"
            >
              Add Note
            </button>
          </div>

          {notes.length === 0 ? (
            <p className="no-notes">
              No notes yet. Add one to track important information!
            </p>
          ) : (
            <div className="notes-grid">
              {notes.map((note) => (
                <div key={note.id} className="note-card">
                  <div className="note-header">
                    <h3>{note.title}</h3>
                    <span className="note-date">
                      {formatDate(note.createdAt)}
                    </span>
                  </div>
                  <div className="note-content">
                    <p>{note.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewEncounter;
