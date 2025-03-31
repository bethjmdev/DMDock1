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
  addDoc,
} from "firebase/firestore";
import "./SpellSlotTracker.css";

const SPELL_SLOT_PROGRESSION = {
  // Standard Full Casters (all use the same progression)
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
  const [spellsByLevel, setSpellsByLevel] = useState({});

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

        // Initialize spellsByLevel from the fetched data
        const initialSpellsByLevel = {};
        charactersList.forEach((character) => {
          if (character.spellsByLevel) {
            initialSpellsByLevel[character.id] = character.spellsByLevel;
          }
        });
        setSpellsByLevel(initialSpellsByLevel);
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

  const getSpellSlots = (characterClass, level) => {
    const progression = SPELL_SLOT_PROGRESSION[characterClass];
    if (!progression) return null;

    // If level is below start level, return null
    if (level < progression.startLevel) return null;

    // Get the highest level that's not greater than the character's level
    const availableLevels = Object.keys(progression.slots)
      .map(Number)
      .filter((l) => l <= level);

    if (availableLevels.length === 0) return null;

    const highestLevel = Math.max(...availableLevels);

    // Special handling for Warlock's Pact Magic
    if (progression.pactMagic) {
      // Warlocks only get their highest level slots
      const slots = progression.slots[highestLevel];
      const slotLevel = Object.keys(slots)[0];
      const slotCount = slots[slotLevel];
      return { [slotLevel]: slotCount };
    }

    return progression.slots[highestLevel];
  };

  const handleSpellSlotChange = async (characterId, spellLevel, change) => {
    try {
      const character = characters.find((c) => c.id === characterId);
      const maxSlots = character.spellSlots[spellLevel];
      const currentAvailable =
        maxSlots - (character.usedSpellSlots?.[spellLevel] || 0);
      const newUsedSlots = Math.max(
        0,
        Math.min(
          maxSlots,
          (character.usedSpellSlots?.[spellLevel] || 0) - change
        )
      );

      const characterRef = doc(db, "SpellSlot", characterId);
      await updateDoc(characterRef, {
        [`usedSpellSlots.${spellLevel}`]: newUsedSlots,
      });

      // Update local state
      setCharacters((prevCharacters) =>
        prevCharacters.map((char) =>
          char.id === characterId
            ? {
                ...char,
                usedSpellSlots: {
                  ...char.usedSpellSlots,
                  [spellLevel]: newUsedSlots,
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

  const moveCharacter = (index, direction) => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === characters.length - 1)
    ) {
      return;
    }

    const newCharacters = [...characters];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newCharacters[index], newCharacters[newIndex]] = [
      newCharacters[newIndex],
      newCharacters[index],
    ];

    setCharacters(newCharacters);
  };

  const handleLevelUp = async (characterId) => {
    try {
      const character = characters.find((c) => c.id === characterId);
      const newLevel = Number(character.characterLevel) + 1;

      if (newLevel > 20) {
        setError("Character cannot level up beyond level 20");
        return;
      }

      const newSpellSlots = getSpellSlots(character.characterClass, newLevel);
      if (!newSpellSlots) {
        setError("Failed to calculate new spell slots");
        return;
      }

      const characterRef = doc(db, "SpellSlot", characterId);
      await updateDoc(characterRef, {
        characterLevel: newLevel,
        spellSlots: newSpellSlots,
        usedSpellSlots: {}, // Reset used spell slots on level up
      });

      setCharacters((prevCharacters) =>
        prevCharacters.map((char) =>
          char.id === characterId
            ? {
                ...char,
                characterLevel: newLevel,
                spellSlots: newSpellSlots,
                usedSpellSlots: {},
              }
            : char
        )
      );
    } catch (error) {
      console.error("Error leveling up character:", error);
      setError("Failed to level up character");
    }
  };

  const handleSpellUsage = async (characterId, level, spellIndex, isUsed) => {
    try {
      const character = characters.find((c) => c.id === characterId);
      const maxSlots = character.spellSlots[level];
      const currentUsedSlots = character.usedSpellSlots?.[level] || 0;

      // Calculate new used slots count
      const newUsedSlots = isUsed ? currentUsedSlots + 1 : currentUsedSlots - 1;

      // Don't allow more used slots than available or negative values
      if (newUsedSlots > maxSlots || newUsedSlots < 0) return;

      // Initialize the spells array for this level if it doesn't exist
      const currentSpells =
        spellsByLevel[characterId]?.[level] ||
        Array(maxSlots)
          .fill()
          .map(() => ({ name: "", used: false }));

      // Create the updated spells array
      const updatedSpells = [...currentSpells];
      updatedSpells[spellIndex] = {
        ...updatedSpells[spellIndex],
        used: isUsed,
      };

      // Ensure we have a valid spellsByLevel structure
      const updatedSpellsByLevel = {
        ...(spellsByLevel[characterId] || {}),
        [level]: updatedSpells,
      };

      const characterRef = doc(db, "SpellSlot", characterId);

      // Prepare the update data
      const updateData = {
        [`usedSpellSlots.${level}`]: newUsedSlots,
        spellsByLevel: updatedSpellsByLevel,
      };

      // Remove any undefined values
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      await updateDoc(characterRef, updateData);

      // Update local state
      setSpellsByLevel((prev) => ({
        ...prev,
        [characterId]: updatedSpellsByLevel,
      }));

      setCharacters((prevCharacters) =>
        prevCharacters.map((char) =>
          char.id === characterId
            ? {
                ...char,
                usedSpellSlots: {
                  ...(char.usedSpellSlots || {}),
                  [level]: newUsedSlots,
                },
              }
            : char
        )
      );
    } catch (error) {
      console.error("Error updating spell usage:", error);
      setError("Failed to update spell usage");
    }
  };

  const handleSpellNameChange = async (
    characterId,
    level,
    spellIndex,
    name
  ) => {
    try {
      const character = characters.find((c) => c.id === characterId);
      const maxSlots = character.spellSlots[level];

      // Initialize the spells array for this level if it doesn't exist
      const currentSpells =
        spellsByLevel[characterId]?.[level] ||
        Array(maxSlots)
          .fill()
          .map(() => ({ name: "", used: false }));

      // Create the updated spells array
      const updatedSpells = [...currentSpells];
      updatedSpells[spellIndex] = {
        ...updatedSpells[spellIndex],
        name: name || "", // Ensure name is never undefined
      };

      // Ensure we have a valid spellsByLevel structure
      const updatedSpellsByLevel = {
        ...(spellsByLevel[characterId] || {}),
        [level]: updatedSpells,
      };

      const characterRef = doc(db, "SpellSlot", characterId);

      // Prepare the update data
      const updateData = {
        spellsByLevel: updatedSpellsByLevel,
      };

      // Remove any undefined values
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      await updateDoc(characterRef, updateData);

      // Update local state
      setSpellsByLevel((prev) => ({
        ...prev,
        [characterId]: updatedSpellsByLevel,
      }));
    } catch (error) {
      console.error("Error updating spell name:", error);
      setError("Failed to update spell name");
    }
  };

  const resetAllSpells = async (characterId) => {
    try {
      const character = characters.find((c) => c.id === characterId);

      // Reset all spell slots to unused and clear names
      const resetSpellsByLevel = {};
      Object.entries(character.spellSlots || {}).forEach(([level, slots]) => {
        resetSpellsByLevel[level] = Array(slots)
          .fill()
          .map(() => ({ name: "", used: false }));
      });

      const characterRef = doc(db, "SpellSlot", characterId);
      await updateDoc(characterRef, {
        spellsByLevel: resetSpellsByLevel,
        usedSpellSlots: {}, // Reset all used spell slots
      });

      // Update local state
      setSpellsByLevel((prev) => ({
        ...prev,
        [characterId]: resetSpellsByLevel,
      }));

      setCharacters((prevCharacters) =>
        prevCharacters.map((char) =>
          char.id === characterId
            ? {
                ...char,
                usedSpellSlots: {},
              }
            : char
        )
      );
    } catch (error) {
      console.error("Error resetting all spells:", error);
      setError("Failed to reset spells");
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
            {characters.map((character, index) => (
              <div key={character.id} className="character-card">
                <div className="character-header">
                  <h3>{character.characterName}</h3>
                  <div className="character-controls">
                    <button
                      className="delete-character-button"
                      onClick={() => deleteCharacter(character.id)}
                    >
                      ×
                    </button>
                    <div className="move-buttons">
                      <button
                        className="move-button"
                        onClick={() => moveCharacter(index, "up")}
                        disabled={index === 0}
                      >
                        ↑
                      </button>
                      <button
                        className="move-button"
                        onClick={() => moveCharacter(index, "down")}
                        disabled={index === characters.length - 1}
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                </div>
                <p className="character-info">
                  {character.characterType} - {character.characterClass} Level{" "}
                  {character.characterLevel}
                  <button
                    className="level-up-button"
                    onClick={() => handleLevelUp(character.id)}
                    disabled={character.characterLevel >= 20}
                  >
                    Level Up
                  </button>
                </p>

                <div className="spell-slots">
                  <div className="spell-slots-header">
                    <h4>Spell Slots</h4>
                    <button
                      className="reset-all-button"
                      onClick={() => resetAllSpells(character.id)}
                    >
                      Reset All
                    </button>
                  </div>
                  {Object.entries(character.spellSlots || {}).map(
                    ([level, slots]) => (
                      <div key={level} className="spell-level-section">
                        <div className="spell-slot-control">
                          <span>Level {level}</span>
                          <div className="slot-controls">
                            <button
                              className="slot-button"
                              onClick={() =>
                                handleSpellSlotChange(character.id, level, -1)
                              }
                            >
                              -
                            </button>
                            <span className="slot-count">
                              {slots - (character.usedSpellSlots?.[level] || 0)}
                              /{slots}
                            </span>
                            <button
                              className="slot-button"
                              onClick={() =>
                                handleSpellSlotChange(character.id, level, 1)
                              }
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="spell-inputs">
                          {Array.from({ length: slots }).map((_, index) => {
                            const spell = spellsByLevel[character.id]?.[
                              level
                            ]?.[index] || { name: "", used: false };
                            return (
                              <div
                                key={index}
                                className={`spell-input-row ${
                                  spell.used ? "used" : ""
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={spell.used}
                                  onChange={(e) =>
                                    handleSpellUsage(
                                      character.id,
                                      level,
                                      index,
                                      e.target.checked
                                    )
                                  }
                                  className="spell-checkbox"
                                />
                                <input
                                  type="text"
                                  value={spell.name || ""}
                                  onChange={(e) =>
                                    handleSpellNameChange(
                                      character.id,
                                      level,
                                      index,
                                      e.target.value
                                    )
                                  }
                                  placeholder={`Level ${level} spell`}
                                  className="spell-name-input"
                                />
                              </div>
                            );
                          })}
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
