import React, { useState } from "react";
import { db } from "../../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import "../../auth/Auth.css";

const AddMonster = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    ac: "",
    campaign_id: campaignId,
    character_name: "",
    charisma: "",
    constitution: "",
    dexterity: "",
    dm: currentUser.uid,
    intelligence: "",
    monster_name: "",
    strength: "",
    wisdom: "",
  });

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
      await addDoc(collection(db, "Monsters"), formData);
      navigate(-1); // Go back to the previous page
    } catch (error) {
      console.error("Error adding monster:", error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Add New Monster</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Monster Name"
              name="monster_name"
              value={formData.monster_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Character Name"
              name="character_name"
              value={formData.character_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="AC"
              name="ac"
              value={formData.ac}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Strength"
              name="strength"
              value={formData.strength}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Dexterity"
              name="dexterity"
              value={formData.dexterity}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Constitution"
              name="constitution"
              value={formData.constitution}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Intelligence"
              name="intelligence"
              value={formData.intelligence}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Wisdom"
              name="wisdom"
              value={formData.wisdom}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Charisma"
              name="charisma"
              value={formData.charisma}
              onChange={handleChange}
              required
            />
          </div>
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
              Add Monster
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMonster;
