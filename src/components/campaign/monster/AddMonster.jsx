import React, { useState } from "react";
import { db } from "../../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import "../../auth/Auth.css";

// Define spellcasting monster types
const SPELLCASTING_MONSTER_TYPES = {
  FULL_CASTER: "Full Caster", // Like Archmage, Lich
  HALF_CASTER: "Half Caster", // Like Death Knight, Drow Priestess
  INNATE_CASTER: "Innate Caster", // Like Dragons, Beholders
  SPECIAL: "Special", // Like Beholder, Mind Flayer
};

// Define spellcasting monster examples
const SPELLCASTING_MONSTERS = {
  [SPELLCASTING_MONSTER_TYPES.FULL_CASTER]: [
    "Archmage",
    "Lich",
    "Drow Matron Mother",
    "Death Slaad",
    "Rakshasa",
  ],
  [SPELLCASTING_MONSTER_TYPES.HALF_CASTER]: [
    "Death Knight",
    "Drow Priestess",
    "Drow Elite Warrior",
    "Drow Mage",
    "Drow Priestess of Lolth",
  ],
  [SPELLCASTING_MONSTER_TYPES.INNATE_CASTER]: [
    "Ancient Dragon",
    "Adult Dragon",
    "Young Dragon",
    "Wyrmling Dragon",
    "Beholder",
  ],
  [SPELLCASTING_MONSTER_TYPES.SPECIAL]: [
    "Beholder",
    "Mind Flayer",
    "Aboleth",
    "Yuan-ti Anathema",
    "Death Tyrant",
  ],
};

const AddMonster = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    challenge_rating: "",
    size: "",
    alignment: "",
    armor_class: "",
    hit_points: "",
    speed: "",
    strength: "",
    dexterity: "",
    constitution: "",
    intelligence: "",
    wisdom: "",
    charisma: "",
    actions: [],
    is_spellcaster: false,
    spellcasting_type: "", // Add this field
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const getSpellSlots = (cr) => {
    // Convert CR to level for spell slot calculation
    const level = Math.ceil(cr);
    if (level < 1) return null;

    // Basic spell slot progression based on CR
    const slots = {
      1: { 1: 2 }, // CR 1/4 - 1/2
      2: { 1: 3 }, // CR 1
      3: { 1: 4, 2: 2 }, // CR 2
      4: { 1: 4, 2: 3 }, // CR 3
      5: { 1: 4, 2: 3, 3: 2 }, // CR 4
      6: { 1: 4, 2: 3, 3: 3 }, // CR 5
      7: { 1: 4, 2: 3, 3: 3, 4: 1 }, // CR 6
      8: { 1: 4, 2: 3, 3: 3, 4: 2 }, // CR 7
      9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 }, // CR 8
      10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 }, // CR 9
      11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 }, // CR 10
      12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 }, // CR 11
      13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 }, // CR 12
      14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 }, // CR 13
      15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 }, // CR 14
      16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 }, // CR 15
      17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 }, // CR 16
      18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 }, // CR 17
      19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 }, // CR 18
      20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 }, // CR 19-20
    };

    return slots[Math.min(level, 20)] || null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const timestamp = new Date();
      const monsterData = {
        ...formData,
        challenge_rating: parseFloat(formData.challenge_rating),
        campaignId,
        dmId: currentUser.uid,
        createdAt: timestamp,
        lastModified: timestamp,
      };

      // Create monster document
      const docRef = await addDoc(collection(db, "Monster"), monsterData);
      console.log("Monster saved with ID: ", docRef.id);

      // If monster is a spellcaster, create spell slot entry
      if (formData.is_spellcaster && formData.spellcasting_type) {
        const spellSlots = getSpellSlots(
          formData.spellcasting_type,
          Math.ceil(parseFloat(formData.challenge_rating)),
          "Monster"
        );
        if (spellSlots) {
          const spellSlotData = {
            characterName: formData.name,
            characterType: "Monster",
            characterClass: formData.spellcasting_type,
            characterLevel: Math.ceil(parseFloat(formData.challenge_rating)),
            campaignId,
            dmId: currentUser.uid,
            spellSlots,
            usedSpellSlots: {},
            createdAt: timestamp,
            lastModified: timestamp,
            monsterId: docRef.id,
          };

          await addDoc(collection(db, "SpellSlot"), spellSlotData);
        }
      }

      alert("Monster saved successfully!");
      onClose();
    } catch (error) {
      console.error("Error saving monster:", error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
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
              name="name"
              value={formData.name}
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
              name="armor_class"
              value={formData.armor_class}
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
          <div className="form-group">
            <input
              type="text"
              placeholder="Monster Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              step="0.25"
              placeholder="Challenge Rating"
              name="challenge_rating"
              value={formData.challenge_rating}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="is_spellcaster"
                checked={formData.is_spellcaster}
                onChange={handleChange}
              />
              Is Spellcaster
            </label>
          </div>
          {/* Add spellcasting type selection */}
          {formData.is_spellcaster && (
            <div className="form-group">
              <label htmlFor="spellcasting_type">Spellcasting Type:</label>
              <select
                id="spellcasting_type"
                name="spellcasting_type"
                value={formData.spellcasting_type}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                {Object.values(SPELLCASTING_MONSTER_TYPES).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          )}
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
