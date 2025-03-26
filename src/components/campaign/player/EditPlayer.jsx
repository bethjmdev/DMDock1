import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../../firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import "../../auth/Auth.css";

const EditPlayer = () => {
  const navigate = useNavigate();
  const { campaignId, playerId } = useParams();
  const [formData, setFormData] = useState({
    ac: "",
    character_name: "",
    charisma: "",
    constitution: "",
    dexterity: "",
    intelligence: "",
    player_name: "",
    strength: "",
    wisdom: "",
  });

  useEffect(() => {
    const fetchPlayerData = async () => {
      const playerRef = doc(db, "Players", playerId);
      const playerDoc = await getDoc(playerRef);
      if (playerDoc.exists()) {
        setFormData(playerDoc.data());
      } else {
        console.error("No such player!");
      }
    };

    fetchPlayerData();
  }, [playerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const playerRef = doc(db, "Players", playerId);
      await updateDoc(playerRef, formData);
      navigate(`/campaign/${campaignId}/players`); // Redirect back to players list
    } catch (error) {
      console.error("Error updating player:", error);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this player?"
    );
    if (!confirmDelete) return; // Exit if the user cancels

    const playerRef = doc(db, "Players", playerId);
    try {
      await deleteDoc(playerRef); // Delete the player document
      navigate(`/campaign/${campaignId}/players`); // Redirect back to players list
    } catch (error) {
      console.error("Error deleting player:", error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Edit Player</h2>
        <form onSubmit={handleSubmit}>
          {/* Render Character Name and Player Name at the top */}
          <div className="form-group">
            <label htmlFor="character_name">Character Name</label>
            <input
              type="text"
              id="character_name"
              name="character_name"
              value={formData.character_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="player_name">Player Name</label>
            <input
              type="text"
              id="player_name"
              name="player_name"
              value={formData.player_name}
              onChange={handleChange}
              required
            />
          </div>
          {/* Render other fields */}
          {Object.keys(formData).map((key) => {
            if (
              key === "dm" ||
              key === "campaign_id" ||
              key === "character_name" ||
              key === "player_name"
            ) {
              return null; // Skip these fields
            }
            return (
              <div className="form-group" key={key}>
                <label htmlFor={key}>
                  {key.replace("_", " ").toUpperCase()}
                </label>
                <input
                  type="text"
                  id={key}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  required
                />
              </div>
            );
          })}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="auth-button"
              style={{ backgroundColor: "var(--dnd-dark)" }}
            >
              Cancel
            </button>
            <button type="submit" className="auth-button">
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="auth-button"
            >
              Delete Player
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPlayer;
