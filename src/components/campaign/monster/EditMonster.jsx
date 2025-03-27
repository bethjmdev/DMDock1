import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../../firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import "../../auth/Auth.css";

const EditMonster = () => {
  const navigate = useNavigate();
  const { campaignId, monsterId } = useParams();
  const [formData, setFormData] = useState({
    ac: "",
    character_name: "",
    charisma: "",
    constitution: "",
    dexterity: "",
    intelligence: "",
    monster_name: "",
    strength: "",
    wisdom: "",
  });

  useEffect(() => {
    const fetchMonsterData = async () => {
      const monsterRef = doc(db, "Monsters", monsterId);
      const monsterDoc = await getDoc(monsterRef);
      if (monsterDoc.exists()) {
        setFormData(monsterDoc.data());
      } else {
        console.error("No such monster!");
      }
    };

    fetchMonsterData();
  }, [monsterId]);

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
      const monsterRef = doc(db, "Monsters", monsterId);
      await updateDoc(monsterRef, formData);
      navigate(`/campaign/${campaignId}/monsters`); // Redirect back to monsters list
    } catch (error) {
      console.error("Error updating monster:", error);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this monster?"
    );
    if (!confirmDelete) return; // Exit if the user cancels

    const monsterRef = doc(db, "Monsters", monsterId);
    try {
      await deleteDoc(monsterRef); // Delete the monster document
      navigate(`/campaign/${campaignId}/monsters`); // Redirect back to monsters list
    } catch (error) {
      console.error("Error deleting monster:", error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Edit Monster</h2>
        <form onSubmit={handleSubmit}>
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
            <label htmlFor="monster_name">Monster Name</label>
            <input
              type="text"
              id="monster_name"
              name="monster_name"
              value={formData.monster_name}
              onChange={handleChange}
              required
            />
          </div>
          {Object.keys(formData).map((key) => {
            if (
              key === "dm" ||
              key === "campaign_id" ||
              key === "character_name" ||
              key === "monster_name"
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
              Delete Monster
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMonster;
