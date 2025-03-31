import React, { useState } from "react";
import { db } from "../../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import "../../auth/Auth.css";

// Define spellcasting classes
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

// Spell slot progression data
const SPELL_SLOT_PROGRESSION = {
  // Full Casters
  Wizard: {
    startLevel: 1,
    slots: {
      1: { 1: 2 },
      2: { 1: 3 },
      3: { 1: 4, 2: 2 },
      4: { 1: 4, 2: 3 },
      5: { 1: 4, 2: 3, 3: 2 },
      6: { 1: 4, 2: 3, 3: 3 },
      7: { 1: 4, 2: 3, 3: 3, 4: 1 },
      8: { 1: 4, 2: 3, 3: 3, 4: 2 },
      9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
      10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
      11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
      12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
      13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
      14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
      15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
      16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
      17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
      18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 },
      19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
      20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
    },
  },
  Bard: {
    startLevel: 1,
    slots: {
      1: { 1: 2 },
      2: { 1: 3 },
      3: { 1: 4, 2: 2 },
      4: { 1: 4, 2: 3 },
      5: { 1: 4, 2: 3, 3: 2 },
      6: { 1: 4, 2: 3, 3: 3 },
      7: { 1: 4, 2: 3, 3: 3, 4: 1 },
      8: { 1: 4, 2: 3, 3: 3, 4: 2 },
      9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
      10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
      11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
      12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
      13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
      14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
      15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
      16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
      17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
      18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 },
      19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
      20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 },
    },
  },
  Cleric: {
    startLevel: 1,
    slots: {
      1: { 1: 2 },
      2: { 1: 3 },
      3: { 1: 4, 2: 2 },
      4: { 1: 4, 2: 3 },
      5: { 1: 4, 2: 3, 3: 2 },
      6: { 1: 4, 2: 3, 3: 3 },
      7: { 1: 4, 2: 3, 3: 3, 4: 1 },
      8: { 1: 4, 2: 3, 3: 3, 4: 2 },
      9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
      10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
      11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
      12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
      13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
      14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
      15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
      16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
      17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
      18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 },
      19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
      20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
    },
  },
  Druid: {
    startLevel: 1,
    slots: {
      1: { 1: 2 },
      2: { 1: 3 },
      3: { 1: 4, 2: 2 },
      4: { 1: 4, 2: 3 },
      5: { 1: 4, 2: 3, 3: 2 },
      6: { 1: 4, 2: 3, 3: 3 },
      7: { 1: 4, 2: 3, 3: 3, 4: 1 },
      8: { 1: 4, 2: 3, 3: 3, 4: 2 },
      9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
      10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
      11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
      12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
      13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
      14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
      15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
      16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
      17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
      18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 },
      19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
      20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
    },
  },
  Sorcerer: {
    startLevel: 1,
    slots: {
      1: { 1: 2 },
      2: { 1: 3 },
      3: { 1: 4, 2: 2 },
      4: { 1: 4, 2: 3 },
      5: { 1: 4, 2: 3, 3: 2 },
      6: { 1: 4, 2: 3, 3: 3 },
      7: { 1: 4, 2: 3, 3: 3, 4: 1 },
      8: { 1: 4, 2: 3, 3: 3, 4: 2 },
      9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
      10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
      11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
      12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
      13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
      14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
      15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
      16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
      17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
      18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 },
      19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
      20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
    },
  },
  // Special Case: Warlock
  Warlock: {
    startLevel: 1,
    pactMagic: true,
    slots: {
      1: { 1: 1 },
      2: { 1: 2 },
      3: { 2: 2 },
      4: { 2: 2 },
      5: { 3: 2 },
      6: { 3: 2 },
      7: { 4: 2 },
      8: { 4: 2 },
      9: { 5: 2 },
      10: { 5: 2 },
      11: { 5: 3 },
      12: { 5: 3 },
      13: { 5: 3 },
      14: { 5: 3 },
      15: { 5: 3 },
      16: { 5: 3 },
      17: { 5: 4 },
      18: { 5: 4 },
      19: { 5: 4 },
      20: { 5: 4 },
    },
  },
  // Half Casters
  Paladin: {
    startLevel: 2,
    slots: {
      2: { 1: 2 },
      3: { 1: 3 },
      4: { 1: 3 },
      5: { 1: 4, 2: 2 },
      6: { 1: 4, 2: 2 },
      7: { 1: 4, 2: 3 },
      8: { 1: 4, 2: 3 },
      9: { 1: 4, 2: 3, 3: 2 },
      10: { 1: 4, 2: 3, 3: 2 },
      11: { 1: 4, 2: 3, 3: 3 },
      12: { 1: 4, 2: 3, 3: 3 },
      13: { 1: 4, 2: 3, 3: 3, 4: 1 },
      14: { 1: 4, 2: 3, 3: 3, 4: 1 },
      15: { 1: 4, 2: 3, 3: 3, 4: 2 },
      16: { 1: 4, 2: 3, 3: 3, 4: 2 },
      17: { 1: 4, 2: 3, 3: 3, 4: 2, 5: 1 },
      18: { 1: 4, 2: 3, 3: 3, 4: 2, 5: 1 },
      19: { 1: 4, 2: 3, 3: 3, 4: 2, 5: 2 },
      20: { 1: 4, 2: 3, 3: 3, 4: 2, 5: 2 },
    },
  },
  // Third Casters
  "Arcane Trickster": {
    startLevel: 3,
    slots: {
      3: { 1: 2 },
      4: { 1: 3 },
      5: { 1: 3 },
      6: { 1: 3 },
      7: { 1: 4, 2: 2 },
      8: { 1: 4, 2: 2 },
      9: { 1: 4, 2: 2 },
      10: { 1: 4, 2: 3 },
      11: { 1: 4, 2: 3 },
      12: { 1: 4, 2: 3 },
      13: { 1: 4, 2: 3, 3: 2 },
      14: { 1: 4, 2: 3, 3: 2 },
      15: { 1: 4, 2: 3, 3: 2 },
      16: { 1: 4, 2: 3, 3: 3 },
      17: { 1: 4, 2: 3, 3: 3 },
      18: { 1: 4, 2: 3, 3: 3 },
      19: { 1: 4, 2: 3, 3: 3, 4: 1 },
      20: { 1: 4, 2: 3, 3: 3, 4: 1 },
    },
  },
  // Half Casters
  Ranger: {
    startLevel: 2,
    slots: {
      2: { 1: 2 },
      3: { 1: 3 },
      4: { 1: 3 },
      5: { 1: 4, 2: 2 },
      6: { 1: 4, 2: 2 },
      7: { 1: 4, 2: 3 },
      8: { 1: 4, 2: 3 },
      9: { 1: 4, 2: 3, 3: 2 },
      10: { 1: 4, 2: 3, 3: 2 },
      11: { 1: 4, 2: 3, 3: 3 },
      12: { 1: 4, 2: 3, 3: 3 },
      13: { 1: 4, 2: 3, 3: 3, 4: 1 },
      14: { 1: 4, 2: 3, 3: 3, 4: 1 },
      15: { 1: 4, 2: 3, 3: 3, 4: 2 },
      16: { 1: 4, 2: 3, 3: 3, 4: 2 },
      17: { 1: 4, 2: 3, 3: 3, 4: 2, 5: 1 },
      18: { 1: 4, 2: 3, 3: 3, 4: 2, 5: 1 },
      19: { 1: 4, 2: 3, 3: 3, 4: 2, 5: 2 },
      20: { 1: 4, 2: 3, 3: 3, 4: 2, 5: 2 },
    },
  },
  Artificer: {
    startLevel: 1, // Artificer is special - starts at level 1 but follows half-caster progression
    slots: {
      1: { 1: 2 },
      2: { 1: 2 },
      3: { 1: 3 },
      4: { 1: 3 },
      5: { 1: 4, 2: 2 },
      6: { 1: 4, 2: 2 },
      7: { 1: 4, 2: 3 },
      8: { 1: 4, 2: 3 },
      9: { 1: 4, 2: 3, 3: 2 },
      10: { 1: 4, 2: 3, 3: 2 },
      11: { 1: 4, 2: 3, 3: 3 },
      12: { 1: 4, 2: 3, 3: 3 },
      13: { 1: 4, 2: 3, 3: 3, 4: 1 },
      14: { 1: 4, 2: 3, 3: 3, 4: 1 },
      15: { 1: 4, 2: 3, 3: 3, 4: 2 },
      16: { 1: 4, 2: 3, 3: 3, 4: 2 },
      17: { 1: 4, 2: 3, 3: 3, 4: 2, 5: 1 },
      18: { 1: 4, 2: 3, 3: 3, 4: 2, 5: 1 },
      19: { 1: 4, 2: 3, 3: 3, 4: 2, 5: 2 },
      20: { 1: 4, 2: 3, 3: 3, 4: 2, 5: 2 },
    },
  },
  // Third Casters
  "Eldritch Knight": {
    startLevel: 3,
    slots: {
      3: { 1: 2 },
      4: { 1: 3 },
      5: { 1: 3 },
      6: { 1: 3 },
      7: { 1: 4, 2: 2 },
      8: { 1: 4, 2: 2 },
      9: { 1: 4, 2: 2 },
      10: { 1: 4, 2: 3 },
      11: { 1: 4, 2: 3 },
      12: { 1: 4, 2: 3 },
      13: { 1: 4, 2: 3, 3: 2 },
      14: { 1: 4, 2: 3, 3: 2 },
      15: { 1: 4, 2: 3, 3: 2 },
      16: { 1: 4, 2: 3, 3: 3 },
      17: { 1: 4, 2: 3, 3: 3 },
      18: { 1: 4, 2: 3, 3: 3 },
      19: { 1: 4, 2: 3, 3: 3, 4: 1 },
      20: { 1: 4, 2: 3, 3: 3, 4: 1 },
    },
  },
};

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
    // Add new fields for spellcasting
    characterClass: "",
    characterLevel: 1,
  });

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

  const getSpellSlots = (characterClass, level) => {
    const progression = SPELL_SLOT_PROGRESSION[characterClass];
    if (!progression) return null;

    if (level < progression.startLevel) return null;

    const availableLevels = Object.keys(progression.slots)
      .map(Number)
      .filter((l) => l <= level);

    if (availableLevels.length === 0) return null;

    const highestLevel = Math.max(...availableLevels);
    return progression.slots[highestLevel];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create NPC document
      const npcRef = await addDoc(collection(db, "NPC"), formData);

      // Check if NPC is a spellcaster
      if (SPELLCASTING_CLASSES.includes(formData.characterClass)) {
        const spellSlots = getSpellSlots(
          formData.characterClass,
          formData.characterLevel
        );

        if (spellSlots) {
          // Create spell slot entry
          const spellSlotData = {
            characterName: formData.name,
            characterType: "NPC",
            characterClass: formData.characterClass,
            characterLevel: Number(formData.characterLevel),
            spellSlots: spellSlots,
            selectedSpells: [],
            createdAt: new Date().toISOString(),
            campaignId: campaignId,
            dmId: currentUser.uid,
            npcId: npcRef.id, // Link to NPC document
          };

          await addDoc(collection(db, "SpellSlot"), spellSlotData);
        }
      }

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
            <select
              name="characterClass"
              value={formData.characterClass}
              onChange={handleChange}
              required
            >
              <option value="">Select Class</option>
              {SPELLCASTING_CLASSES.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <input
              type="number"
              placeholder="Level"
              name="characterLevel"
              min="1"
              max="20"
              value={formData.characterLevel}
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
