import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { db } from "../../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import "./SpellSlotTracker.css";

const SpellSlotTracker = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const { currentUser } = useAuth();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingSpells, setEditingSpells] = useState(null);
  const [newSpell, setNewSpell] = useState("");
  const [editingNotes, setEditingNotes] = useState(null);
  const [notes, setNotes] = useState({});

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const q = query(
          collection(db, "SpellSlot"),
          where("campaignId", "==", campaignId),
          where("userId", "==", "dm")
        );

        const querySnapshot = await getDocs(q);
        const charactersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCharacters(charactersList);
      } catch (error) {
        console.error("Error fetching characters:", error);
        setError("Failed to load characters");
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [campaignId]);

  const handleSpellSlotChange = async (characterId, spellLevel, change) => {
    try {
      const character = characters.find((c) => c.id === characterId);
      const currentSlots = character.spellSlots[spellLevel] || 0;
      const newSlots = Math.max(0, currentSlots + change);

      const characterRef = doc(db, "SpellSlot", characterId);
      await updateDoc(characterRef, {
        [`spellSlots.${spellLevel}`]: newSlots,
      });

      // Update local state
      setCharacters((prevCharacters) =>
        prevCharacters.map((char) =>
          char.id === characterId
            ? {
                ...char,
                spellSlots: {
                  ...char.spellSlots,
                  [spellLevel]: newSlots,
                },
              }
            : char
        )
      );
    } catch (error) {
      console.error("Error updating spell slots:", error);
      setError("Failed to update spell slots");
    }
  };

  const handleAddSpell = async (characterId, spellLevel) => {
    if (!newSpell.trim()) return;

    try {
      const character = characters.find((c) => c.id === characterId);
      const currentSpells = character.selectedSpells || [];
      const newSpellObj = {
        id: Date.now().toString(),
        name: newSpell,
        level: spellLevel,
        used: false,
      };

      const characterRef = doc(db, "SpellSlot", characterId);
      await updateDoc(characterRef, {
        selectedSpells: [...currentSpells, newSpellObj],
      });

      setCharacters((prevCharacters) =>
        prevCharacters.map((char) =>
          char.id === characterId
            ? {
                ...char,
                selectedSpells: [...(char.selectedSpells || []), newSpellObj],
              }
            : char
        )
      );

      setNewSpell("");
      setEditingSpells(null);
    } catch (error) {
      console.error("Error adding spell:", error);
      setError("Failed to add spell");
    }
  };

  const handleToggleSpellUsage = async (characterId, spellId) => {
    try {
      const character = characters.find((c) => c.id === characterId);
      const updatedSpells = [...character.selectedSpells];
      updatedSpells.forEach((spell) => {
        if (spell.id === spellId) {
          spell.used = !spell.used;
        }
      });

      const characterRef = doc(db, "SpellSlot", characterId);
      await updateDoc(characterRef, {
        selectedSpells: updatedSpells,
      });

      setCharacters((prevCharacters) =>
        prevCharacters.map((char) =>
          char.id === characterId
            ? {
                ...char,
                selectedSpells: updatedSpells,
              }
            : char
        )
      );
    } catch (error) {
      console.error("Error updating spell usage:", error);
      setError("Failed to update spell usage");
    }
  };

  const handleResetSpells = async (characterId) => {
    try {
      const character = characters.find((c) => c.id === characterId);
      const resetSpells = character.selectedSpells.map((spell) => ({
        ...spell,
        used: false,
      }));

      const characterRef = doc(db, "SpellSlot", characterId);
      await updateDoc(characterRef, {
        selectedSpells: resetSpells,
      });

      setCharacters((prevCharacters) =>
        prevCharacters.map((char) =>
          char.id === characterId
            ? {
                ...char,
                selectedSpells: resetSpells,
              }
            : char
        )
      );
    } catch (error) {
      console.error("Error resetting spells:", error);
      setError("Failed to reset spells");
    }
  };

  const handleAddCharacter = () => {
    navigate(`/campaign/${campaignId}/spell-slot/new`);
  };

  const deleteSpell = async (characterId, spellId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this spell? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const character = characters.find((c) => c.id === characterId);
      const updatedSpells = character.selectedSpells.filter(
        (spell) => spell.id !== spellId
      );

      const characterRef = doc(db, "SpellSlot", characterId);
      await updateDoc(characterRef, {
        selectedSpells: updatedSpells,
      });

      setCharacters((prevCharacters) =>
        prevCharacters.map((char) =>
          char.id === characterId
            ? {
                ...char,
                selectedSpells: updatedSpells,
              }
            : char
        )
      );
    } catch (error) {
      console.error("Error deleting spell:", error);
      setError("Failed to delete spell");
    }
  };

  const deleteCharacter = async (characterId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this character? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const characterRef = doc(db, "SpellSlot", characterId);
      await deleteDoc(characterRef);

      setCharacters((prevCharacters) =>
        prevCharacters.filter((char) => char.id !== characterId)
      );
    } catch (error) {
      console.error("Error deleting character:", error);
      setError("Failed to delete character");
    }
  };

  const handleSaveNotes = async (characterId) => {
    try {
      const characterRef = doc(db, "SpellSlot", characterId);
      await updateDoc(characterRef, {
        notes: notes[characterId] || "",
      });

      setCharacters((prevCharacters) =>
        prevCharacters.map((char) =>
          char.id === characterId
            ? {
                ...char,
                notes: notes[characterId] || "",
              }
            : char
        )
      );

      setEditingNotes(null);
    } catch (error) {
      console.error("Error saving notes:", error);
      setError("Failed to save notes");
    }
  };

  if (loading) {
    return <div className="spell-slot-container">Loading...</div>;
  }

  if (error) {
    return <div className="spell-slot-container error-message">{error}</div>;
  }

  return (
    <div className="spell-slot-container">
      <div className="spell-slot-header">
        <h1>Spell Slot Tracker</h1>
        <button className="add-character-button" onClick={handleAddCharacter}>
          Add Character
        </button>
      </div>

      <div className="spell-slot-content">
        {characters.length === 0 ? (
          <p>No characters found. Add your first character!</p>
        ) : (
          <div className="characters-grid">
            {characters.map((character) => (
              <div key={character.id} className="character-card">
                <h3>{character.characterName}</h3>
                <button
                  className="delete-character-button"
                  onClick={() => deleteCharacter(character.id)}
                >
                  ×
                </button>
                <p className="character-info">
                  {character.characterType} - {character.characterClass} Level{" "}
                  {character.characterLevel}
                </p>

                <div className="spell-slots">
                  <h4>Spell Slots</h4>
                  {Object.entries(character.spellSlots).map(
                    ([level, slots]) => (
                      <div key={level} className="spell-slot-control">
                        <span>Level {level}:</span>
                        <div className="slot-controls">
                          <button
                            onClick={() =>
                              handleSpellSlotChange(character.id, level, -1)
                            }
                            className="slot-button"
                          >
                            -
                          </button>
                          <span className="slot-count">{slots}</span>
                          <button
                            onClick={() =>
                              handleSpellSlotChange(character.id, level, 1)
                            }
                            className="slot-button"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="spell-management">
                  <h4>Spell Management</h4>
                  {editingSpells === character.id ? (
                    <div className="add-spell-form">
                      <input
                        type="text"
                        value={newSpell}
                        onChange={(e) => setNewSpell(e.target.value)}
                        placeholder="Enter spell name"
                        className="spell-input"
                      />
                      <button
                        onClick={() => handleAddSpell(character.id, 1)}
                        className="add-spell-button"
                      >
                        Add Spell
                      </button>
                      <button
                        onClick={() => setEditingSpells(null)}
                        className="cancel-button"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingSpells(character.id)}
                      className="edit-spells-button"
                    >
                      Add New Spell
                    </button>
                  )}

                  {character.selectedSpells &&
                    character.selectedSpells.length > 0 && (
                      <div className="spell-list">
                        <div className="spell-list-header">
                          <h5>Spells</h5>
                          <button
                            onClick={() => handleResetSpells(character.id)}
                            className="reset-spells-button"
                          >
                            Reset All
                          </button>
                        </div>
                        <ul>
                          {character.selectedSpells.map((spell) => (
                            <li
                              key={spell.id}
                              className={`spell-item ${
                                spell.used ? "used" : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={spell.used}
                                onChange={() =>
                                  handleToggleSpellUsage(character.id, spell.id)
                                }
                                className="spell-checkbox"
                              />
                              <span className="spell-name">{spell.name}</span>
                              <span className="spell-level">
                                Level {spell.level}
                              </span>
                              <button
                                className="delete-spell-button"
                                onClick={() =>
                                  deleteSpell(character.id, spell.id)
                                }
                              >
                                ×
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>

                <div className="character-notes">
                  <h4>Notes</h4>
                  {editingNotes === character.id ? (
                    <>
                      <textarea
                        className="notes-textarea"
                        value={notes[character.id] || character.notes || ""}
                        onChange={(e) =>
                          setNotes({ ...notes, [character.id]: e.target.value })
                        }
                        placeholder="Add notes about this character..."
                      />
                      <button
                        className="save-notes-button"
                        onClick={() => handleSaveNotes(character.id)}
                      >
                        Save Notes
                      </button>
                      <button
                        className="cancel-button"
                        onClick={() => setEditingNotes(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <p>{character.notes || "No notes yet."}</p>
                      <button
                        className="edit-spells-button"
                        onClick={() => setEditingNotes(character.id)}
                      >
                        Edit Notes
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpellSlotTracker;
