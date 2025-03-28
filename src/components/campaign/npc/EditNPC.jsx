import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import "../../auth/Auth.css";

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
      try {
        const npcRef = doc(db, "NPC", npcId);
        const npcSnap = await getDoc(npcRef);

        if (npcSnap.exists()) {
          const data = npcSnap.data();

          // Handle personality traits (could be array or string)
          const personality_traits = Array.isArray(data.personality_traits)
            ? data.personality_traits.join("\n")
            : data.personality_traits || "";

          // Handle relationships (might not exist in generator-created NPCs)
          const relationships = {
            rel_status: data.relationships?.rel_status || "unknown",
            sexual_orientation:
              data.relationships?.sexual_orientation || "unknown",
            sex: data.sex || data.relationships?.sex || "unknown",
          };

          // Create normalized form data
          const normalizedData = {
            ...data,
            // Ensure ability_scores are strings
            ability_scores: {
              strength: String(data.ability_scores?.strength || "0"),
              dexterity: String(data.ability_scores?.dexterity || "0"),
              con: String(data.ability_scores?.con || "0"),
              intellect: String(data.ability_scores?.intellect || "0"),
              wisdom: String(data.ability_scores?.wisdom || "0"),
              charisma: String(data.ability_scores?.charisma || "0"),
            },
            // Handle campaign ID variations
            campaign_id: data.campaign_id || data.campaignId || campaignId,
            // Normalize other fields
            personality_traits,
            relationships,
            description: data.description || "",
            notes: data.notes || "",
            race: data.race || "",
          };

          setFormData(normalizedData);
        }
      } catch (error) {
        console.error("Error fetching NPC:", error);
      }
    };

    fetchNPC();
  }, [npcId, campaignId]);

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

      // Prepare data for update
      const updateData = {
        ...formData,
        // Convert personality_traits back to array if it contains newlines
        personality_traits: formData.personality_traits.includes("\n")
          ? formData.personality_traits.split("\n")
          : formData.personality_traits,
        // Ensure we're using the correct campaign ID field
        campaign_id: campaignId,
        campaignId: campaignId, // Include both versions for compatibility
        lastModified: new Date().toISOString(),
      };

      await updateDoc(npcRef, updateData);
      navigate(`/campaign/${campaignId}/npc`);
    } catch (error) {
      console.error("Error updating NPC:", error);
      alert("Failed to update NPC: " + error.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this NPC?")) {
      try {
        const npcRef = doc(db, "NPC", npcId);
        await deleteDoc(npcRef);
        navigate(`/campaign/${campaignId}/npc`);
      } catch (error) {
        console.error("Error deleting NPC:", error);
        alert("Failed to delete NPC: " + error.message);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Edit NPC</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
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
            <label>Race</label>
            <input
              type="text"
              placeholder="Race"
              name="race"
              value={formData.race}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              placeholder="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Personality Traits</label>
            <textarea
              placeholder="Personality Traits (one per line)"
              name="personality_traits"
              value={formData.personality_traits}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="ability-scores-grid">
            <h3>Ability Scores</h3>
            {Object.entries(formData.ability_scores).map(([key, value]) => (
              <div key={key} className="form-group">
                <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                <input
                  type="number"
                  placeholder={key}
                  name={`ability_scores.${key}`}
                  value={value}
                  onChange={handleChange}
                  min="0"
                  max="30"
                />
              </div>
            ))}
          </div>

          <div className="relationships-grid">
            <h3>Relationships</h3>
            {Object.entries(formData.relationships).map(([key, value]) => (
              <div key={key} className="form-group">
                <label>
                  {key
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </label>
                <input
                  type="text"
                  placeholder={key}
                  name={`relationships.${key}`}
                  value={value}
                  onChange={handleChange}
                />
              </div>
            ))}
          </div>

          <div className="button-group">
            <button type="submit" className="auth-button">
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => navigate(`/campaign/${campaignId}/npc`)}
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
