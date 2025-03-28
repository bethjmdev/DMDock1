import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  and,
} from "firebase/firestore";
import { useAuth } from "../../auth/AuthContext";
import "./MonsterList.css"; // Reuse the monster list styles
import "./Players.css";

const EncounterList = () => {
  const { campaignId } = useParams();
  const { currentUser } = useAuth();
  const [encounters, setEncounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const encountersPerPage = 12;
  const navigate = useNavigate();

  const db = getFirestore();

  useEffect(() => {
    const fetchEncounters = async () => {
      if (!currentUser) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "Encounter"),
          and(
            where("campaignId", "==", campaignId),
            where("userId", "==", currentUser.uid)
          )
        );

        const querySnapshot = await getDocs(q);
        const encounterData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore Timestamp to JS Date
          createdAt: doc.data().createdAt?.toDate(),
          lastModified: doc.data().lastModified?.toDate(),
        }));

        // Sort encounters by creation date (newest first)
        encounterData.sort((a, b) => b.createdAt - a.createdAt);

        setEncounters(encounterData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching encounters:", err);
        setError("Failed to fetch encounters");
        setLoading(false);
      }
    };

    fetchEncounters();
  }, [campaignId, currentUser]);

  // Pagination logic
  const indexOfLastEncounter = currentPage * encountersPerPage;
  const indexOfFirstEncounter = indexOfLastEncounter - encountersPerPage;
  const currentEncounters = encounters.slice(
    indexOfFirstEncounter,
    indexOfLastEncounter
  );
  const totalPages = Math.ceil(encounters.length / encountersPerPage);

  // Helper function to format date
  const formatDate = (date) => {
    if (!date) return "Unknown date";
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const handleEncounterClick = (encounterId) => {
    navigate(`/campaign/${campaignId}/encounters/${encounterId}`, {
      state: { previousPage: currentPage },
    });
  };

  return (
    <div className="players-container">
      <div className="players-header">
        <h2 className="monster-title">Encounters</h2>
      </div>

      {loading ? (
        <h2 className="loading-text">Loading Encounters...</h2>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : encounters.length === 0 ? (
        <div className="no-encounters">No encounters found</div>
      ) : (
        <>
          <div className="players-grid">
            {currentEncounters.map((encounter) => (
              <div
                key={encounter.id}
                className="player-card monster-card"
                onClick={() => handleEncounterClick(encounter.id)}
                style={{ cursor: "pointer" }}
              >
                <div className="player-header">
                  <div>
                    <h3 className="monster-name">{encounter.name}</h3>
                    <p className="monster-type">
                      {encounter.environment} | {encounter.location}
                    </p>
                  </div>
                  <div className="monster-cr">
                    <p>CR: {encounter.totalCR?.toFixed(1)}</p>
                  </div>
                </div>
                <div className="encounter-details">
                  <div className="stat-item">
                    <span className="stat-label">Party Level:</span>{" "}
                    {encounter.partyLevel}
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Difficulty:</span>{" "}
                    {encounter.difficulty}
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Monsters:</span>{" "}
                    {encounter.monsters?.length || 0}
                  </div>
                </div>
                <div className="encounter-footer">
                  <p className="created-at">
                    Created: {formatDate(encounter.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EncounterList;
