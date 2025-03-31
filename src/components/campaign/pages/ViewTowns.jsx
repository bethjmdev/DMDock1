import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../auth/AuthContext";
import "./TownGenerator.css";

const ViewTowns = () => {
  const [towns, setTowns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchTowns = async () => {
      try {
        const townsRef = collection(db, "Towns");
        const q = query(
          townsRef,
          where("campaignId", "==", campaignId),
          where("dm", "==", currentUser.uid)
        );

        const querySnapshot = await getDocs(q);
        const townsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTowns(townsList);
      } catch (error) {
        console.error("Error fetching towns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTowns();
  }, [campaignId, currentUser.uid]);

  const handleGenerateNew = () => {
    navigate(`/campaign/${campaignId}/town-generator`);
  };

  const handleDeleteTown = async (townId) => {
    if (window.confirm("Are you sure you want to delete this town?")) {
      try {
        await deleteDoc(doc(db, "Towns", townId));
        setTowns(towns.filter((town) => town.id !== townId));
      } catch (error) {
        console.error("Error deleting town:", error);
        alert("Failed to delete town");
      }
    }
  };

  return (
    <div className="towns-container">
      <div className="towns-header">
        <h2 className="towns-title">Your Towns</h2>
        <div className="towns-header-buttons">
          <button
            onClick={() => navigate(`/campaign/${campaignId}/create-town`)}
            className="create-town-button"
          >
            Create New Town
          </button>
          <button
            onClick={handleGenerateNew}
            className="generate-new-town-button"
          >
            Generate New Town
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading towns...</p>
      ) : towns.length === 0 ? (
        <p>No towns found. Generate your first town!</p>
      ) : (
        <div className="towns-grid">
          {towns.map((town) => (
            <div key={town.id} className="town-card">
              <h3>{town.name}</h3>
              <div className="town-card-content">
                <p>Population: {town.population.toLocaleString()}</p>
                <p>Size: {town.acres} acres</p>
                <p>Shops: {town.shops.length}</p>
                <p>Organizations: {town.organizations.length}</p>
              </div>
              <div className="button-group">
                <button
                  onClick={() =>
                    navigate(`/campaign/${campaignId}/towns/${town.id}`)
                  }
                  className="view-details-button"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleDeleteTown(town.id)}
                  className="edit-button"
                  style={{
                    backgroundColor: "#dc2626",
                    marginTop: "0.5rem",
                  }}
                >
                  Delete Town
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewTowns;
