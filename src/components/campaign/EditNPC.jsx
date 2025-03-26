import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../auth/Auth.css";

const EditNPC = () => {
  const navigate = useNavigate();
  const { campaignId, npcId } = useParams();
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

  useEffect(() => {
    const fetchNPC = async () => {
      const npcRef = doc(db, "NPC", npcId);
      const npcSnap = await getDoc(npcRef);
      if (npcSnap.exists()) {
        setFormData(npcSnap.data());
      } else {
        console.error("No such NPC!");
      }
    };

    fetchNPC();
  }, [npcId]);

  console.log("NPC ID", npcId);

  const handleChange = (e) => {
    const { name, value } = e.target;

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
      const npcRef = doc(db, "NPC", npcId);
      await updateDoc(npcRef, formData);
      navigate(-1); // Go back to the previous page
    } catch (error) {
      console.error("Error updating npc:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this NPC?")) {
      try {
        const npcRef = doc(db, "NPC", npcId);
        await deleteDoc(npcRef);
        navigate(-1); // Go back to the previous page
      } catch (error) {
        console.error("Error deleting npc:", error);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Edit NPC</h2>
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
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="auth-button"
              style={{ backgroundColor: "var(--dnd-dark)" }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="auth-button auth-button-danger"
            >
              Delete NPC
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNPC;
