import React, { useState } from "react";
import { db } from "../../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import "../../auth/Auth.css";

const AddNPCForm = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    ability_scores: {
      charisma: "",
      con: "",
      dexterity: "",
      intellect: "",
      strength: "",
      wisdom: "",
    },
    alignment: "",
    campaign_id: campaignId,
    description: "",
    dm: currentUser.uid,
    name: "",
    notes: "",
    occupation: "",
    personality_traits: "",
    race: "",
    relationships: {
      rel_status: "",
      sexual_orientation: "",
      sex: "",
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Check if the name contains a dot (indicating a nested property)
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "NPC"), formData);
      navigate(-1); // Go back to the previous page
    } catch (error) {
      console.error("Error adding npc:", error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Add New NPC</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="NPC Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Alignment"
              name="alignment"
              value={formData.alignment}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Charisma"
              name="ability_scores.charisma"
              value={formData.ability_scores.charisma}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Constitution"
              name="ability_scores.con"
              value={formData.ability_scores.con}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Dexterity"
              name="ability_scores.dexterity"
              value={formData.ability_scores.dexterity}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Intelligence"
              name="ability_scores.intellect"
              value={formData.ability_scores.intellect}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Strength"
              name="ability_scores.strength"
              value={formData.ability_scores.strength}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Wisdom"
              name="ability_scores.wisdom"
              value={formData.ability_scores.wisdom}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Personality Traits"
              name="personality_traits"
              value={formData.personality_traits}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Sex"
              name="relationships.sex"
              value={formData.relationships.sex}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Relationship Status"
              name="relationships.rel_status"
              value={formData.relationships.rel_status}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Sexual Orientation"
              name="relationships.sexual_orientation"
              value={formData.relationships.sexual_orientation}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button type="submit" className="auth-button">
              Add NPC
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="auth-button"
              style={{ backgroundColor: "var(--dnd-dark)" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNPCForm;
