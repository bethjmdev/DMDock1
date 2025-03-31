import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { db } from "../../../firebase";
import { collection, addDoc } from "firebase/firestore";
import "./SpellSlotTracker.css";

const SPELLCASTING_CLASSES = [
  "Wizard",
  "Sorcerer",
  "Warlock",
  "Cleric",
  "Druid",
  "Bard",
  "Paladin",
  "Ranger",
  "Eldritch Knight",
  "Arcane Trickster",
];

const CHARACTER_TYPES = ["Player", "NPC", "Monster"];

const NewSpellSlotCharacter = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    characterName: "",
    characterType: "Player",
    characterClass: "",
    characterLevel: 1,
    spellSlots: {},
    selectedSpells: [],
    createdAt: new Date().toISOString(),
    campaignId,
    dmId: currentUser.uid,
  });

  const [error, setError] = useState("");

  const calculateSpellSlots = (characterClass, level) => {
    const slots = {};

    // Full casters
    if (
      ["Wizard", "Sorcerer", "Warlock", "Cleric", "Druid", "Bard"].includes(
        characterClass
      )
    ) {
      if (level >= 1) slots[1] = 2;
      if (level >= 2) slots[1] = 3;
      if (level >= 3) {
        slots[1] = 4;
        slots[2] = 2;
      }
      if (level >= 4) {
        slots[1] = 4;
        slots[2] = 3;
      }
      if (level >= 5) {
        slots[1] = 4;
        slots[2] = 3;
        slots[3] = 2;
      }
      // Add more levels as needed
    }

    // Half casters
    if (["Paladin", "Ranger"].includes(characterClass)) {
      if (level >= 2) slots[1] = 2;
      if (level >= 3) slots[1] = 3;
      if (level >= 5) {
        slots[1] = 4;
        slots[2] = 2;
      }
      // Add more levels as needed
    }

    // Third casters
    if (["Eldritch Knight", "Arcane Trickster"].includes(characterClass)) {
      if (level >= 3) slots[1] = 2;
      if (level >= 4) slots[1] = 3;
      if (level >= 7) {
        slots[1] = 4;
        slots[2] = 2;
      }
      // Add more levels as needed
    }

    return slots;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "characterClass" || name === "characterLevel") {
      const newClass =
        name === "characterClass" ? value : formData.characterClass;
      const newLevel =
        name === "characterLevel"
          ? parseInt(value)
          : parseInt(formData.characterLevel);

      if (newClass && newLevel) {
        const slots = calculateSpellSlots(newClass, newLevel);
        setFormData((prev) => ({
          ...prev,
          spellSlots: slots,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (
        !formData.characterName ||
        !formData.characterClass ||
        !formData.characterLevel
      ) {
        setError("Please fill in all required fields");
        return;
      }

      const dataToSave = {
        ...formData,
        characterLevel: Number(formData.characterLevel),
      };

      await addDoc(collection(db, "SpellSlot"), dataToSave);
      navigate(`/campaign/${campaignId}/spell-slot`);
    } catch (error) {
      console.error("Error adding character:", error);
      setError("Failed to add character. Please try again.");
    }
  };

  return (
    <div className="spell-slot-container">
      <div className="spell-slot-header">
        <h1>Add New Character</h1>
        <button
          className="add-character-button"
          onClick={() => navigate(`/campaign/${campaignId}/spell-slot`)}
        >
          Back to List
        </button>
      </div>

      <form onSubmit={handleSubmit} className="character-form">
        <div className="form-group">
          <label htmlFor="characterName">Character Name:</label>
          <input
            type="text"
            id="characterName"
            name="characterName"
            value={formData.characterName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="characterType">Character Type:</label>
          <select
            id="characterType"
            name="characterType"
            value={formData.characterType}
            onChange={handleChange}
            required
          >
            {CHARACTER_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="characterClass">Character Class:</label>
          <select
            id="characterClass"
            name="characterClass"
            value={formData.characterClass}
            onChange={handleChange}
            required
          >
            <option value="">Select a class</option>
            {SPELLCASTING_CLASSES.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="characterLevel">Character Level:</label>
          <input
            type="number"
            id="characterLevel"
            name="characterLevel"
            min="1"
            max="20"
            value={formData.characterLevel}
            onChange={handleChange}
            required
          />
        </div>

        {Object.keys(formData.spellSlots).length > 0 && (
          <div className="spell-slots-display">
            <h3>Available Spell Slots:</h3>
            {Object.entries(formData.spellSlots).map(([level, slots]) => (
              <div key={level} className="spell-slot-level">
                Level {level}: {slots} slots
              </div>
            ))}
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="submit-button">
          Add Character
        </button>
      </form>
    </div>
  );
};

export default NewSpellSlotCharacter;
