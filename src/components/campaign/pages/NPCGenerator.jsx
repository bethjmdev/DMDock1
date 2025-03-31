import React, { useState } from "react";
import StatBlock from "../npc/StatBlock";
import "./NPCGenerator.css";
import { fantasyNames } from "../data/names";
import { personalityTraits, deities } from "../data/traits";
import { physicalDescriptions } from "../data/physical";
import { races, alignments, occupations } from "../data/races";
import { useParams, useNavigate } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "../../../firebase";

const styles = `
.save-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.save-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.save-button:hover:not(:disabled) {
  background-color: #45a049;
}
`;

const SPELLCASTING_CLASSES = [
  "Arcane Trickster",
  "Artificer",
  "Bard",
  "Cleric",
  "Druid",
  "Eldritch Knight",
  "Paladin",
  "Ranger",
  "Sorcerer",
  "Warlock",
  "Wizard",
];

// Add spell slot progression data
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
  // Add other classes as needed...
};

const NPCGenerator = () => {
  const { campaignId } = useParams();
  const [formData, setFormData] = useState({
    race: "",
    sex: "",
    alignment: "",
    occupation: "",
    characterClass: "",
    characterLevel: 1,
  });

  const [generatedNPC, setGeneratedNPC] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  // Sort races alphabetically
  const sortedRaces = [...races].sort();
  // Sort classes alphabetically
  const sortedClasses = [...SPELLCASTING_CLASSES].sort();

  const pronouns = {
    Male: {
      subject: "He",
      object: "him",
      possessive: "his",
      reflexive: "himself",
    },
    Female: {
      subject: "She",
      object: "her",
      possessive: "hers",
      reflexive: "herself",
    },
    Other: {
      subject: "They",
      object: "them",
      possessive: "theirs",
      reflexive: "themselves",
    },
  };

  const generateName = () => {
    const raceNames =
      fantasyNames[formData.sex][formData.race] ||
      fantasyNames[formData.sex]["Human"];
    return raceNames[Math.floor(Math.random() * raceNames.length)];
  };

  const getRandomOption = (options) => {
    return options[Math.floor(Math.random() * options.length)];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (value === "random") {
      switch (name) {
        case "race":
          finalValue = getRandomOption(races);
          break;
        case "sex":
          finalValue = getRandomOption(["Male", "Female", "Other"]);
          break;
        case "alignment":
          finalValue = getRandomOption(alignments);
          break;
        case "occupation":
          finalValue = getRandomOption(occupations);
          break;
        case "characterClass":
          finalValue = getRandomOption(SPELLCASTING_CLASSES);
          break;
        default:
          break;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const generateAbilityScores = () => {
    const scores = {};
    const abilities = [
      "strength",
      "dexterity",
      "con",
      "intellect",
      "wisdom",
      "charisma",
    ];

    abilities.forEach((ability) => {
      const rolls = Array.from(
        { length: 4 },
        () => Math.floor(Math.random() * 6) + 1
      );
      rolls.sort((a, b) => b - a);
      scores[ability] = rolls[0] + rolls[1] + rolls[2];
    });

    return scores;
  };

  const generatePersonalityTraits = () => {
    const traits = [];
    const npcPronouns = pronouns[formData.sex];

    // Filter deities based on alignment
    const alignmentFilteredDeities = deities.filter((deity) => {
      if (deity.name === "none") return true;
      // For NPCs with "True Neutral" alignment, they can worship any deity
      if (formData.alignment === "True Neutral") return true;
      // For other alignments, match the first word of the alignment
      const npcAlignment = formData.alignment.split(" ")[0];
      const deityAlignment = deity.alignment.split(" ")[0];
      return npcAlignment === deityAlignment;
    });

    const deity =
      alignmentFilteredDeities[
        Math.floor(Math.random() * alignmentFilteredDeities.length)
      ];

    // Add deity worship trait
    if (deity.name === "none") {
      traits.push(`${npcPronouns.subject} doesn't worship any god.`);
    } else {
      const worshipStyle =
        Math.random() < 0.5 ? "quietly worships" : "proudly claims to worship";
      traits.push(
        `${npcPronouns.subject} ${worshipStyle} ${deity.name}, ${deity.domain}. (${deity.alignment})`
      );
    }

    // Add 3-5 random personality traits
    const numTraits = Math.floor(Math.random() * 3) + 3; // Random number between 3 and 5
    const shuffledTraits = [...personalityTraits].sort(
      () => Math.random() - 0.5
    );

    for (let i = 0; i < numTraits; i++) {
      let trait = shuffledTraits[i];
      // Replace pronouns in the trait
      trait = trait
        .replace(/{subject}/g, npcPronouns.subject)
        .replace(/{object}/g, npcPronouns.object)
        .replace(/{possessive}/g, npcPronouns.possessive)
        .replace(/{reflexive}/g, npcPronouns.reflexive);
      traits.push(trait);
    }

    return traits;
  };

  const generatePhysicalDescription = () => {
    const npcPronouns = pronouns[formData.sex];
    const age = Math.floor(Math.random() * 500) + 18; // Random age between 18 and 518

    // Generate random height
    const heightCm =
      physicalDescriptions.height.cm[
        Math.floor(Math.random() * physicalDescriptions.height.cm.length)
      ];
    const feet = Math.floor(heightCm / 30.48);
    const inches = Math.round((heightCm % 30.48) / 2.54);

    // Generate random physical features
    const hairLength =
      physicalDescriptions.hair.length[
        Math.floor(Math.random() * physicalDescriptions.hair.length.length)
      ];
    const hairStyle =
      physicalDescriptions.hair.style[
        Math.floor(Math.random() * physicalDescriptions.hair.style.length)
      ];
    const hairColor =
      physicalDescriptions.hair.color[
        Math.floor(Math.random() * physicalDescriptions.hair.color.length)
      ];
    const eyeColor =
      physicalDescriptions.eyes.color[
        Math.floor(Math.random() * physicalDescriptions.eyes.color.length)
      ];
    const skinTexture =
      physicalDescriptions.skin.texture[
        Math.floor(Math.random() * physicalDescriptions.skin.texture.length)
      ];
    const skinColor =
      physicalDescriptions.skin.color[
        Math.floor(Math.random() * physicalDescriptions.skin.color.length)
      ];
    const build =
      physicalDescriptions.build[
        Math.floor(Math.random() * physicalDescriptions.build.length)
      ];
    const faceShape =
      physicalDescriptions.face.shape[
        Math.floor(Math.random() * physicalDescriptions.face.shape.length)
      ];
    const faceFeature =
      physicalDescriptions.face.features[
        Math.floor(Math.random() * physicalDescriptions.face.features.length)
      ];
    const faceAdditional =
      Math.random() < 0.5
        ? physicalDescriptions.face.additional[
            Math.floor(
              Math.random() * physicalDescriptions.face.additional.length
            )
          ]
        : "";

    // Generate 1-2 distinguishing features
    const numFeatures = Math.floor(Math.random() * 2) + 1;
    const shuffledFeatures = [
      ...physicalDescriptions.distinguishingFeatures,
    ].sort(() => Math.random() - 0.5);
    const features = shuffledFeatures
      .slice(0, numFeatures)
      .map((feature) =>
        feature.replace(/{possessive}/g, npcPronouns.possessive)
      );

    return [
      `${
        npcPronouns.subject
      } is a ${age} year old ${formData.sex.toLowerCase()} ${formData.race.toLowerCase()} ${formData.occupation.toLowerCase()}.`,
      `${npcPronouns.subject} has ${hairLength}, ${hairStyle}, ${hairColor} hair and ${eyeColor} eyes.`,
      `${npcPronouns.subject} has ${skinTexture} ${skinColor} skin.`,
      `${npcPronouns.subject} stands ${heightCm}cm (${feet}'${inches}") tall and has a ${build} build.`,
      `${npcPronouns.subject} has a ${faceShape}, ${faceFeature} face${
        faceAdditional ? ` ${faceAdditional}` : ""
      }.`,
      ...features,
    ];
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const npc = {
      ...formData,
      name: generateName(),
      ability_scores: generateAbilityScores(),
      personality_traits: generatePersonalityTraits(),
      physical_description: generatePhysicalDescription(),
    };

    setGeneratedNPC(npc);
  };

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

  const handleSaveNPC = async () => {
    if (!generatedNPC || !campaignId) return;

    const npcName = prompt("Enter a name for this NPC:", generatedNPC.name);
    if (!npcName) return;

    setIsSaving(true);
    try {
      const npcData = {
        name: npcName,
        campaignId: campaignId,
        dm: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        notes: "",
        race: generatedNPC.race,
        sex: generatedNPC.sex,
        alignment: generatedNPC.alignment,
        occupation: generatedNPC.occupation,
        description: generatedNPC.physical_description.join(" "),
        personality_traits: generatedNPC.personality_traits,
        ability_scores: {
          strength: String(generatedNPC.ability_scores.strength),
          dexterity: String(generatedNPC.ability_scores.dexterity),
          con: String(generatedNPC.ability_scores.con),
          intellect: String(generatedNPC.ability_scores.intellect),
          wisdom: String(generatedNPC.ability_scores.wisdom),
          charisma: String(generatedNPC.ability_scores.charisma),
        },
        relationships: {
          rel_status: "unknown",
          sexual_orientation: "unknown",
        },
        characterClass: generatedNPC.characterClass,
        characterLevel: generatedNPC.characterLevel,
      };

      const docRef = await addDoc(collection(db, "NPC"), npcData);

      // If NPC is a spellcaster, create spell slot entry
      if (SPELLCASTING_CLASSES.includes(generatedNPC.characterClass)) {
        const spellSlots = getSpellSlots(
          generatedNPC.characterClass,
          generatedNPC.characterLevel
        );

        if (spellSlots) {
          const spellSlotData = {
            characterName: npcName,
            characterType: "NPC",
            characterClass: generatedNPC.characterClass,
            characterLevel: Number(generatedNPC.characterLevel),
            spellSlots: spellSlots,
            selectedSpells: [],
            createdAt: new Date().toISOString(),
            campaignId: campaignId,
            dmId: auth.currentUser.uid,
            npcId: docRef.id,
          };

          await addDoc(collection(db, "SpellSlot"), spellSlotData);
        }
      }

      alert("NPC saved successfully!");
      navigate(`/campaign/${campaignId}/npc`);
    } catch (error) {
      console.error("Error saving NPC:", error);
      alert("Failed to save NPC: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="npc-generator-container">
      <div className="npc-generator-content">
        <div className="npc-generator-header">
          <h2 className="npc-generator-title">NPC Generator</h2>
        </div>

        <div className="npc-generator-form">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Race</label>
                <select
                  name="race"
                  value={formData.race}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select a race</option>
                  <option value="random">Random</option>
                  {sortedRaces.map((race) => (
                    <option key={race} value={race}>
                      {race}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Class</label>
                <select
                  name="characterClass"
                  value={formData.characterClass}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select a class</option>
                  <option value="random">Random</option>
                  {sortedClasses.map((className) => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Level</label>
                <input
                  type="number"
                  name="characterLevel"
                  value={formData.characterLevel}
                  onChange={handleChange}
                  min="1"
                  max="20"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sex</label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select sex</option>
                  <option value="random">Random</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Alignment</label>
                <select
                  name="alignment"
                  value={formData.alignment}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select alignment</option>
                  <option value="random">Random</option>
                  {alignments.map((alignment) => (
                    <option key={alignment} value={alignment}>
                      {alignment}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Occupation</label>
                <select
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select occupation</option>
                  <option value="random">Random</option>
                  {occupations.map((occupation) => (
                    <option key={occupation} value={occupation}>
                      {occupation}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="generate-button">
              Generate NPC
            </button>
          </form>
        </div>

        {generatedNPC && (
          <div className="npc-display">
            <StatBlock npc={generatedNPC} />
            <button
              onClick={handleSaveNPC}
              disabled={isSaving}
              className="save-button"
              style={{ marginTop: "1rem", width: "100%" }}
            >
              {isSaving ? "Saving..." : "Save NPC"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NPCGenerator;
