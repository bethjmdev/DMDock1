import React, { useState } from "react";
import StatBlock from "../npc/StatBlock";
import "./NPCGenerator.css";
import { fantasyNames } from "../data/names";
import { personalityTraits, deities } from "../data/traits";
import { physicalDescriptions } from "../data/physical";
import { races, alignments, occupations } from "../data/races";

const NPCGenerator = () => {
  const [formData, setFormData] = useState({
    race: "",
    sex: "",
    alignment: "",
    occupation: "",
  });

  const [generatedNPC, setGeneratedNPC] = useState(null);

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
                  {races.map((race) => (
                    <option key={race} value={race}>
                      {race}
                    </option>
                  ))}
                </select>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default NPCGenerator;
