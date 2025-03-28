import React, { useState } from "react";
import StatBlock from "../npc/StatBlock";

const NPCGenerator = () => {
  const [formData, setFormData] = useState({
    name: "",
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

  const races = [
    "Human",
    "Elf",
    "Dwarf",
    "Halfling",
    "Dragonborn",
    "Gnome",
    "Half-Elf",
    "Half-Orc",
    "Tiefling",
    "Aarakocra",
    "Genasi",
    "Goliath",
    "Aasimar",
    "Bugbear",
    "Firbolg",
    "Goblin",
    "Hobgoblin",
    "Kenku",
    "Kobold",
    "Lizardfolk",
    "Orc",
    "Tabaxi",
    "Triton",
    "Yuan-ti Pureblood",
    "Feral Tiefling",
    "Tortle",
    "Gith",
    "Changeling",
    "Kalashtar",
    "Shifter",
    "Warforged",
    "Centaur",
    "Loxodon",
    "Minotaur",
    "Simic Hybrid",
    "Vedalken",
    "Verdan",
    "Locathah",
    "Grung",
  ];

  const alignments = [
    "Lawful Good",
    "Neutral Good",
    "Chaotic Good",
    "Lawful Neutral",
    "True Neutral",
    "Chaotic Neutral",
    "Lawful Evil",
    "Neutral Evil",
    "Chaotic Evil",
  ];

  const occupations = [
    "Merchant",
    "Guard",
    "Noble",
    "Artisan",
    "Farmer",
    "Priest",
    "Wizard",
    "Warrior",
    "Rogue",
    "Bard",
    "Druid",
    "Ranger",
    "Paladin",
    "Monk",
    "Warlock",
    "Cleric",
    "Sage",
    "Soldier",
    "Sailor",
    "Criminal",
    "Entertainer",
    "Politician",
    "Servant",
    "Explorer",
    "Scholar",
    "Healer",
    "Blacksmith",
    "Innkeeper",
    "Mercenary",
    "Pilgrim",
  ];

  const deities = [
    {
      name: "Oghma",
      domain: "God of knowledge, invention, inspiration, bards",
      alignment: "True Neutral",
    },
    {
      name: "Shar",
      domain:
        "Goddess of dark, night, loss, forgetfulness, unrevealed secrets, caverns, dungeons, the Underdark",
      alignment: "Neutral Evil",
    },
    { name: "none", domain: "", alignment: "" },
  ];

  const personalityTraits = [
    "{subject} is very competitive",
    "{subject} is very self-confident",
    "{subject} always wears a fancy hat",
    "{subject} makes anyone {subject} speaks to feel like the most important person in the world",
    "{subject} gets bored easily",
    "{subject} constantly looks for the loophole",
    "{subject} believes in soulmates",
    "{subject} is always prepared",
    "{subject} always eats like it's {subject} last meal",
    "{subject} spaces out often, lost in thought",
    "{subject} is a compulsive liar",
    "{subject} has a photographic memory",
    "{subject} is terrified of spiders",
    "{subject} collects rare books",
    "{subject} speaks in riddles",
    "{subject} is obsessed with cleanliness",
    "{subject} has a secret identity",
    "{subject} is a hopeless romantic",
    "{subject} is a perfectionist",
    "{subject} is superstitious",
    "{subject} is a conspiracy theorist",
    "{subject} is a compulsive gambler",
    "{subject} is a food critic",
    "{subject} is a hopeless klutz",
    "{subject} is a master of disguise",
    "{subject} is a compulsive hoarder",
    "{subject} is a thrill seeker",
    "{subject} is a workaholic",
  ];

  const physicalDescriptions = {
    hair: {
      length: [
        "short",
        "long",
        "medium-length",
        "shoulder-length",
        "waist-length",
      ],
      style: [
        "straight",
        "curled",
        "wavy",
        "braided",
        "dreadlocked",
        "shaved on the right side",
        "shaved on the left side",
        "shaved on both sides",
      ],
      color: [
        "black",
        "brown",
        "blond",
        "red",
        "white",
        "gray",
        "silver",
        "golden",
        "auburn",
        "dark brown",
        "light brown",
        "strawberry blond",
        "platinum blond",
        "jet black",
        "raven black",
        "copper",
        "bronze",
        "cyan",
        "green",
        "blue",
        "purple",
        "pink",
      ],
    },
    eyes: {
      color: [
        "black",
        "brown",
        "blue",
        "green",
        "gray",
        "hazel",
        "amber",
        "golden",
        "silver",
        "red",
        "purple",
        "cyan",
        "violet",
        "pink",
        "white",
        "yellow",
        "orange",
        "heterochromatic",
      ],
    },
    skin: {
      texture: [
        "smooth",
        "rough",
        "scaled",
        "furry",
        "feathered",
        "leathery",
        "veiny",
        "pockmarked",
        "scarred",
        "tattooed",
        "wrinkled",
        "youthful",
        "weathered",
      ],
      color: [
        "pale",
        "fair",
        "olive",
        "brown",
        "dark",
        "black",
        "white",
        "green",
        "blue",
        "red",
        "gray",
        "tan",
        "bronze",
        "copper",
        "golden",
        "silver",
        "purple",
        "pink",
        "yellow",
        "orange",
      ],
    },
    height: {
      cm: Array.from({ length: 100 }, (_, i) => i + 100), // 100cm to 200cm
      feet: Array.from({ length: 7 }, (_, i) => i + 3), // 3' to 10'
      inches: Array.from({ length: 12 }, (_, i) => i), // 0" to 11"
    },
    build: [
      "slim",
      "athletic",
      "muscular",
      "stocky",
      "fat",
      "regular",
      "beefy",
      "lean",
      "skinny",
      "chubby",
      "plump",
      "tall",
      "short",
      "average",
    ],
    face: {
      shape: [
        "round",
        "oval",
        "square",
        "heart",
        "diamond",
        "triangular",
        "rectangular",
        "long",
        "wide",
        "narrow",
      ],
      features: [
        "plain",
        "handsome",
        "beautiful",
        "ugly",
        "common",
        "uncommon",
        "striking",
        "memorable",
        "forgettable",
        "bland",
        "mediocre",
        "average",
        "slightly common",
        "incredibly bland",
        "extremely mediocre",
      ],
      additional: [
        "with a very long moustache",
        "with a short beard",
        "with a long beard",
        "with a goatee",
        "with a scar",
        "with freckles",
        "with dimples",
        "with high cheekbones",
        "with a strong jaw",
        "with a weak chin",
        "with a prominent nose",
        "with a small nose",
        "with a wide smile",
        "with thin lips",
        "with full lips",
      ],
    },
    distinguishingFeatures: [
      "is branded as a prisoner on {possessive} left arm",
      'rolls {possessive} "R"s profusely',
      "is mute",
      "smells of dogs",
      "is slightly allergic to dragonborns",
      "has a distinctive birthmark on {possessive} face",
      "walks with a slight limp",
      "speaks with a lisp",
      "has a nervous tick",
      "always wears gloves",
      "has a prosthetic limb",
      "has a magical aura",
      "glows faintly in the dark",
      "has a constant cough",
      "has a distinctive laugh",
      "has a collection of scars",
      "has a unique tattoo",
      "has a distinctive voice",
      "has a particular way of walking",
      "has a specific smell",
    ],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
    const deity = deities[Math.floor(Math.random() * deities.length)];
    const npcPronouns = pronouns[formData.sex];

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
        formData.name
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
      ability_scores: generateAbilityScores(),
      personality_traits: generatePersonalityTraits(),
      physical_description: generatePhysicalDescription(),
    };

    setGeneratedNPC(npc);
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">NPC Generator</h2>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Race
            </label>
            <select
              name="race"
              value={formData.race}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select a race</option>
              {races.map((race) => (
                <option key={race} value={race}>
                  {race}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sex
            </label>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Alignment
            </label>
            <select
              name="alignment"
              value={formData.alignment}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select alignment</option>
              {alignments.map((alignment) => (
                <option key={alignment} value={alignment}>
                  {alignment}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Occupation
            </label>
            <select
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select occupation</option>
              {occupations.map((occupation) => (
                <option key={occupation} value={occupation}>
                  {occupation}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Generate NPC
        </button>
      </form>

      {generatedNPC && (
        <div className="mt-8">
          <StatBlock npc={generatedNPC} />
        </div>
      )}
    </div>
  );
};

export default NPCGenerator;
