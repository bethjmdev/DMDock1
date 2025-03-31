import React, { useState, useEffect } from "react";
import "./EncounterGenerator.css";
import { useParams } from "react-router-dom";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { useAuth } from "../../../components/auth/AuthContext"; // Adjust path as needed

const BATCH_SIZE = 40; // Number of monsters to fetch at once
const CACHE_KEY = "dnd_monsters_cache";
const CACHE_DURATION = 14 * 24 * 60 * 60 * 1000; // 2 weeks in milliseconds

const EncounterGenerator = () => {
  const { campaignId } = useParams();
  const { currentUser } = useAuth();
  const [encounterParams, setEncounterParams] = useState({
    partyLevel: 1,
    difficulty: "random",
    environment: "random",
    location: "random",
    mixedTypes: false,
    minMonsters: 1,
    maxMonsters: 4,
    showMonsters: true,
    specificMonsters: [],
    monsterType: "any",
  });

  const [monsters, setMonsters] = useState([]);
  const [generatedEncounter, setGeneratedEncounter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingMonsters, setFetchingMonsters] = useState(false);
  const [monsterFetchError, setMonsterFetchError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const db = getFirestore();

  // Add these helper functions at the top of the component, after the state declarations
  const difficultyOptions = ["easy", "medium", "hard", "deadly"];
  const environmentOptions = [
    "plains",
    "forest",
    "hills",
    "mountain",
    "marsh",
    "desert",
  ];
  const locationOptions = [
    "underground",
    "aquatic",
    "underdark",
    "abyss",
    "nine_hells",
    "gehenna",
  ];

  // Add monster type options after the existing options arrays
  const monsterTypeOptions = [
    "any",
    "aberration",
    "beast",
    "celestial",
    "construct",
    "dragon",
    "elemental",
    "fey",
    "fiend",
    "giant",
    "humanoid",
    "monstrosity",
    "ooze",
    "plant",
    "undead",
  ];

  // Helper function to get random item from array
  const getRandomOption = (options) => {
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
  };

  // Fetch monsters from D&D 5e API in batches
  useEffect(() => {
    const fetchMonsters = async () => {
      try {
        setFetchingMonsters(true);
        setMonsterFetchError(null);
        console.log("Starting monster fetch...");

        // Check localStorage for cached data
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          const isExpired = Date.now() - timestamp > CACHE_DURATION;

          if (!isExpired) {
            console.log("Using cached monster data");
            setMonsters(data);
            setFetchingMonsters(false);
            return;
          }
        }

        // If no cache or expired, fetch from API
        const response = await fetch("https://www.dnd5eapi.co/api/monsters");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(
          "Initial monster list fetched:",
          data.results.length,
          "monsters"
        );

        // Process monsters in batches
        const allMonsters = [];
        for (let i = 0; i < data.results.length; i += BATCH_SIZE) {
          const batch = data.results.slice(i, i + BATCH_SIZE);
          console.log(
            `Fetching batch ${i / BATCH_SIZE + 1} of ${Math.ceil(
              data.results.length / BATCH_SIZE
            )}`
          );

          const batchPromises = batch.map(async (monster) => {
            try {
              const monsterResponse = await fetch(
                `https://www.dnd5eapi.co${monster.url}`
              );
              if (!monsterResponse.ok) {
                throw new Error(
                  `HTTP error! status: ${monsterResponse.status}`
                );
              }
              const monsterData = await monsterResponse.json();
              console.log(`Fetched monster: ${monsterData.name}`);
              return monsterData;
            } catch (error) {
              console.error(`Error fetching monster ${monster.name}:`, error);
              return null;
            }
          });

          const batchResults = await Promise.all(batchPromises);
          const validMonsters = batchResults.filter((m) => m !== null);
          allMonsters.push(...validMonsters);

          // Update monsters state after each batch
          setMonsters((prevMonsters) => [...prevMonsters, ...validMonsters]);
        }

        // Store in localStorage with timestamp
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: allMonsters,
            timestamp: Date.now(),
          })
        );

        console.log("All monsters fetched and cached successfully");
      } catch (error) {
        console.error("Error in monster fetch:", error);
        setMonsterFetchError(error.message);
      } finally {
        setFetchingMonsters(false);
      }
    };

    fetchMonsters();
  }, []);

  const handleParamChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEncounterParams((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Calculate target CR based on party level and difficulty
  const calculateTargetCR = () => {
    const { partyLevel, difficulty } = encounterParams;
    const baseCR = partyLevel;
    const difficultyMultipliers = {
      easy: 0.75,
      medium: 1,
      hard: 1.5,
      deadly: 2,
    };
    return baseCR * difficultyMultipliers[difficulty];
  };

  // Filter monsters by environment and location
  const filterMonstersByEnvironment = (monsters) => {
    const { environment, location } = encounterParams;
    return monsters.filter((monster) => {
      // Check if monster has environment tags
      if (monster.environments && monster.environments.length > 0) {
        return monster.environments.some(
          (env) =>
            env.toLowerCase().includes(environment) ||
            env.toLowerCase().includes(location)
        );
      }
      return true; // If no environment tags, include the monster
    });
  };

  // Generate a random number between min and max
  const getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const generateEncounter = () => {
    setLoading(true);
    try {
      console.log(
        "Starting encounter generation with params:",
        encounterParams
      );

      // Handle random selections first
      const effectiveParams = {
        ...encounterParams,
        difficulty:
          encounterParams.difficulty === "random"
            ? getRandomOption(difficultyOptions)
            : encounterParams.difficulty,
        environment:
          encounterParams.environment === "random"
            ? getRandomOption(environmentOptions)
            : encounterParams.environment,
        location:
          encounterParams.location === "random"
            ? getRandomOption(locationOptions)
            : encounterParams.location,
      };

      console.log("Using effective params:", effectiveParams);

      // Calculate target CR using the resolved difficulty
      const targetCR = (() => {
        const baseCR = parseInt(effectiveParams.partyLevel);
        const difficultyMultipliers = {
          easy: 0.75,
          medium: 1,
          hard: 1.5,
          deadly: 2,
        };
        return baseCR * difficultyMultipliers[effectiveParams.difficulty];
      })();

      console.log("Calculated target CR:", targetCR);

      // Filter monsters by environment and type
      let filteredMonsters = monsters.filter((monster) => {
        // First check environment
        const environmentMatch =
          !monster.environments ||
          monster.environments.length === 0 ||
          monster.environments.some(
            (env) =>
              env.toLowerCase().includes(effectiveParams.environment) ||
              env.toLowerCase().includes(effectiveParams.location)
          );

        // Then check type if specified
        const typeMatch =
          effectiveParams.monsterType === "any" ||
          monster.type.toLowerCase() ===
            effectiveParams.monsterType.toLowerCase();

        return environmentMatch && typeMatch;
      });

      // Initialize selected monsters array
      let selectedMonsters = [];
      let remainingCR = targetCR;

      // If specific monsters are requested, handle them first
      if (effectiveParams.specificMonsters.length > 0) {
        // Find all requested specific monsters
        const foundSpecificMonsters = filteredMonsters.filter((monster) =>
          effectiveParams.specificMonsters.includes(monster.name)
        );

        if (foundSpecificMonsters.length > 0) {
          // Calculate total CR of specific monsters
          const specificMonstersCR = foundSpecificMonsters.reduce(
            (sum, monster) => sum + parseFloat(monster.challenge_rating),
            0
          );

          // If specific monsters exceed target CR, use only specific monsters
          if (specificMonstersCR >= targetCR) {
            selectedMonsters = foundSpecificMonsters;
            remainingCR = 0;
          } else {
            // Add specific monsters and adjust remaining CR
            selectedMonsters = foundSpecificMonsters;
            remainingCR -= specificMonstersCR;

            // Update filtered monsters to exclude already selected specific monsters
            filteredMonsters = filteredMonsters.filter(
              (monster) =>
                !effectiveParams.specificMonsters.includes(monster.name)
            );
          }
        } else {
          console.log(
            "No specific monsters found, falling back to type-based selection"
          );
        }
      }

      // If we still need more monsters to reach the target CR
      if (remainingCR > 0) {
        // Determine how many additional monsters we need
        const numAdditionalMonsters = getRandomNumber(
          Math.max(
            1,
            parseInt(effectiveParams.minMonsters) - selectedMonsters.length
          ),
          Math.max(
            1,
            parseInt(effectiveParams.maxMonsters) - selectedMonsters.length
          )
        );

        // Select additional monsters based on remaining CR
        for (let i = 0; i < numAdditionalMonsters && remainingCR > 0; i++) {
          const individualTargetCR = remainingCR / (numAdditionalMonsters - i);

          const crFilteredMonsters = filteredMonsters.filter((monster) => {
            const monsterCR = parseFloat(monster.challenge_rating);
            return Math.abs(monsterCR - individualTargetCR) <= 1;
          });

          if (crFilteredMonsters.length === 0) {
            console.log(
              "No suitable monsters found for CR:",
              individualTargetCR
            );
            break;
          }

          const selectedMonster =
            crFilteredMonsters[
              Math.floor(Math.random() * crFilteredMonsters.length)
            ];

          selectedMonsters.push(selectedMonster);
          remainingCR -= parseFloat(selectedMonster.challenge_rating);
        }
      }

      // Set the generated encounter with the resolved parameters
      setGeneratedEncounter({
        monsters: selectedMonsters,
        totalCR: targetCR,
        environment: effectiveParams.environment,
        location: effectiveParams.location,
        difficulty: effectiveParams.difficulty,
      });
    } catch (error) {
      console.error("Error generating encounter:", error);
    } finally {
      setLoading(false);
    }
  };

  // Monster Card Component
  const MonsterCard = ({ monster }) => {
    // First, validate the monster object
    if (!monster || typeof monster !== "object") {
      console.error("Invalid monster object:", monster);
      return null;
    }

    console.log("=== MonsterCard Render Start ===");
    console.log("Monster:", {
      name: monster.name,
      hasActions: !!monster.actions,
      actionCount: monster.actions?.length,
      firstAction: monster.actions?.[0],
      actions: monster.actions,
      fullMonster: JSON.stringify(monster, null, 2),
    });

    // Log all object properties to find the problematic one
    Object.entries(monster).forEach(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        console.log(`Property ${key}:`, {
          type: typeof value,
          isArray: Array.isArray(value),
          keys: Object.keys(value),
          value: value,
        });
      }
    });

    // Helper function to format action description
    const formatActionDesc = (desc) => {
      if (!desc) return "No description available";

      // If it's already a string, return it
      if (typeof desc === "string") return desc;

      // If it's an object with a value property, return that
      if (typeof desc === "object" && desc !== null && desc.value) {
        return desc.value;
      }

      // If it's an object with type "list", handle the items
      if (typeof desc === "object" && desc !== null && desc.type === "list") {
        return (
          desc.items
            ?.map((item) =>
              typeof item === "string"
                ? item
                : item.value || JSON.stringify(item)
            )
            .join(", ") || "No description available"
        );
      }

      // For any other object, convert to string
      return JSON.stringify(desc);
    };

    // Check if monster has valid actions
    const hasValidActions =
      monster.actions &&
      Array.isArray(monster.actions) &&
      monster.actions.length > 0;

    // Helper function to safely render action
    const renderAction = (action, index) => {
      if (!action || typeof action !== "object") {
        console.error("Invalid action:", action);
        return null;
      }

      // Ensure we have a valid name and description
      const actionName = action.name || "Unnamed Action";
      const description = formatActionDesc(action.desc);

      // Handle nested actions
      if (action.actions && Array.isArray(action.actions)) {
        return (
          <li key={index} style={{ listStyle: "none" }}>
            <span className="font-medium">{actionName}:</span> {description}
            <ul style={{ listStyle: "none", marginLeft: "1rem" }}>
              {action.actions.map((nestedAction, nestedIndex) =>
                renderAction(nestedAction, `${index}-${nestedIndex}`)
              )}
            </ul>
          </li>
        );
      }

      return (
        <li key={index} style={{ listStyle: "none" }}>
          <span className="font-medium">{actionName}:</span> {description}
        </li>
      );
    };

    // Helper function to safely render a value
    const safeRender = (value) => {
      if (value === null || value === undefined) return "N/A";
      if (typeof value === "string") return value;
      if (typeof value === "number") return value.toString();
      if (Array.isArray(value)) {
        // Handle armor_class array format
        if (value.length > 0 && value[0].type === "dex") {
          return value[0].value.toString();
        }
        return value
          .map((item) =>
            typeof item === "object" && item.value
              ? item.value
              : JSON.stringify(item)
          )
          .join(", ");
      }
      if (typeof value === "object") {
        if (value.value) return value.value;
        return JSON.stringify(value);
      }
      return String(value);
    };

    return (
      <div className="monster-card">
        <h3 className="monster-name">
          {safeRender(monster.name) || "Unnamed Monster"}
        </h3>
        <div className="monster-stats">
          <div className="stat-box">
            <span className="stat-label">CR:</span>{" "}
            {safeRender(monster.challenge_rating)}
          </div>
          <div className="stat-box">
            <span className="stat-label">Type:</span> {safeRender(monster.type)}
          </div>
          <div className="stat-box">
            <span className="stat-label">Size:</span> {safeRender(monster.size)}
          </div>
          <div className="stat-box">
            <span className="stat-label">Alignment:</span>{" "}
            {safeRender(monster.alignment)}
          </div>
          <div className="stat-box">
            <span className="stat-label">AC:</span>{" "}
            {safeRender(monster.armor_class)}
          </div>
          <div className="stat-box">
            <span className="stat-label">HP:</span>{" "}
            {safeRender(monster.hit_points)}
          </div>
        </div>
        {encounterParams.showMonsters && hasValidActions && (
          <div className="actions-section">
            <p className="actions-title">Actions:</p>
            <ul
              className="actions-list"
              style={{ listStyle: "none", padding: 0 }}
            >
              {monster.actions.map((action, index) => (
                <li
                  key={index}
                  className="action-item"
                  style={{ listStyle: "none" }}
                >
                  <span className="action-name">{action.name}:</span>{" "}
                  {formatActionDesc(action.desc)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Define spellcasting monster types
  const SPELLCASTING_MONSTER_TYPES = {
    FULL_CASTER: "Full Caster", // Like Archmage, Lich
    HALF_CASTER: "Half Caster", // Like Death Knight, Drow Priestess
    INNATE_CASTER: "Innate Caster", // Like Dragons, Beholders
    SPECIAL: "Special", // Like Beholder, Mind Flayer
  };

  // Define spell slot progression for monsters
  const SPELL_SLOT_PROGRESSION = {
    [SPELLCASTING_MONSTER_TYPES.FULL_CASTER]: {
      startLevel: 1,
      slots: {
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
      },
    },
    // ... other monster types ...
  };

  const getSpellSlots = (spellcastingType, level) => {
    const progression = SPELL_SLOT_PROGRESSION[spellcastingType];
    if (!progression) return null;

    const maxLevel = Math.min(level, 20);
    return progression.slots[maxLevel] || null;
  };

  // Add this new function to handle saving
  const saveEncounter = async () => {
    if (!generatedEncounter) return;

    // Prompt for encounter name
    const encounterName = prompt("Please enter a name for this encounter:");
    if (!encounterName || encounterName.trim() === "") {
      alert("Encounter name is required to save!");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const timestamp = new Date();

      // Save the encounter first
      const encounterData = {
        name: encounterName.trim(),
        campaignId,
        userId: currentUser.uid,
        createdAt: timestamp,
        lastModified: timestamp,
        partyLevel: encounterParams.partyLevel,
        difficulty: generatedEncounter.difficulty,
        environment: generatedEncounter.environment,
        location: generatedEncounter.location,
        totalCR: generatedEncounter.totalCR,
        monsters: generatedEncounter.monsters.map((monster) => ({
          name: monster.name,
          challenge_rating: monster.challenge_rating,
          type: monster.type,
          size: monster.size,
          alignment: monster.alignment,
          armor_class: monster.armor_class,
          hit_points: monster.hit_points,
          actions: monster.actions || [],
        })),
      };

      const docRef = await addDoc(collection(db, "Encounter"), encounterData);

      // For each monster in the encounter, check if it's a spellcaster
      const spellSlotPromises = generatedEncounter.monsters
        .map(async (monster) => {
          // Check if monster has spellcasting abilities
          const isSpellcaster =
            monster.spellcasting ||
            monster.spells ||
            (monster.special_abilities &&
              monster.special_abilities.some(
                (ability) =>
                  ability.name.toLowerCase().includes("spellcasting") ||
                  ability.name.toLowerCase().includes("spells")
              ));

          if (isSpellcaster) {
            // Determine spellcasting type based on monster properties
            let spellcastingType = SPELLCASTING_MONSTER_TYPES.FULL_CASTER; // Default to full caster

            // Check for specific monster types
            if (
              monster.name.toLowerCase().includes("priest") ||
              monster.name.toLowerCase().includes("paladin") ||
              monster.name.toLowerCase().includes("ranger")
            ) {
              spellcastingType = SPELLCASTING_MONSTER_TYPES.HALF_CASTER;
            } else if (
              monster.name.toLowerCase().includes("dragon") ||
              monster.name.toLowerCase().includes("beholder") ||
              monster.name.toLowerCase().includes("mind flayer")
            ) {
              spellcastingType = SPELLCASTING_MONSTER_TYPES.INNATE_CASTER;
            }

            // Create spell slot entry
            const spellSlotData = {
              characterName: monster.name,
              characterType: "Monster",
              characterClass: spellcastingType,
              characterLevel: Math.ceil(parseFloat(monster.challenge_rating)),
              campaignId,
              dmId: currentUser.uid,
              spellSlots: getSpellSlots(
                spellcastingType,
                Math.ceil(parseFloat(monster.challenge_rating))
              ),
              usedSpellSlots: {},
              createdAt: timestamp,
              lastModified: timestamp,
              encounterId: docRef.id,
            };

            return addDoc(collection(db, "SpellSlot"), spellSlotData);
          }
        })
        .filter(Boolean); // Remove undefined promises (non-spellcasting monsters)

      await Promise.all(spellSlotPromises);

      alert(`Encounter "${encounterName}" saved successfully!`);
    } catch (error) {
      console.error("Error saving encounter:", error);
      setSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Add this new function after the existing helper functions
  const handleAddSpecificMonster = (e) => {
    const monsterName = e.target.value;
    if (
      monsterName &&
      !encounterParams.specificMonsters.includes(monsterName)
    ) {
      setEncounterParams((prev) => ({
        ...prev,
        specificMonsters: [...prev.specificMonsters, monsterName],
      }));
      e.target.value = ""; // Reset the dropdown
    }
  };

  const handleRemoveSpecificMonster = (monsterToRemove) => {
    setEncounterParams((prev) => ({
      ...prev,
      specificMonsters: prev.specificMonsters.filter(
        (monster) => monster !== monsterToRemove
      ),
    }));
  };

  return (
    <div className="encounter-generator">
      <div className="encounter-container">
        <h1 className="encounter-title">D&D 5e Encounter Generator</h1>

        {monsterFetchError && (
          <div className="error-message">
            Error loading monsters: {monsterFetchError}
          </div>
        )}

        {fetchingMonsters && (
          <div className="loading-message">
            Loading monsters... This may take a few moments.
          </div>
        )}

        <div className="controls-grid">
          {/* Party Level */}
          <div className="control-group">
            <label className="control-label">Party Level</label>
            <input
              type="number"
              name="partyLevel"
              value={encounterParams.partyLevel}
              onChange={handleParamChange}
              min="1"
              max="20"
              className="control-input"
            />
          </div>

          {/* Difficulty */}
          <div className="control-group">
            <label className="control-label">Difficulty</label>
            <select
              name="difficulty"
              value={encounterParams.difficulty}
              onChange={handleParamChange}
              className="control-input"
            >
              <option value="random">Random</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="deadly">Deadly</option>
            </select>
          </div>

          {/* Environment */}
          <div className="control-group">
            <label className="control-label">Environment</label>
            <select
              name="environment"
              value={encounterParams.environment}
              onChange={handleParamChange}
              className="control-input"
            >
              <option value="random">Random</option>
              <option value="plains">Plains</option>
              <option value="forest">Forest</option>
              <option value="hills">Hills</option>
              <option value="mountain">Mountain</option>
              <option value="marsh">Marsh</option>
              <option value="desert">Desert</option>
            </select>
          </div>

          {/* Location */}
          <div className="control-group">
            <label className="control-label">Location</label>
            <select
              name="location"
              value={encounterParams.location}
              onChange={handleParamChange}
              className="control-input"
            >
              <option value="random">Random</option>
              <option value="underground">Underground</option>
              <option value="aquatic">Aquatic</option>
              <option value="underdark">Underdark</option>
              <option value="abyss">Abyss</option>
              <option value="nine_hells">Nine Hells</option>
              <option value="gehenna">Gehenna</option>
            </select>
          </div>

          {/* Monster Count Range */}
          <div className="control-group">
            <label className="control-label">Min Monsters</label>
            <input
              type="number"
              name="minMonsters"
              value={encounterParams.minMonsters}
              onChange={handleParamChange}
              min="1"
              className="control-input"
            />
          </div>

          <div className="control-group">
            <label className="control-label">Max Monsters</label>
            <input
              type="number"
              name="maxMonsters"
              value={encounterParams.maxMonsters}
              onChange={handleParamChange}
              min="1"
              className="control-input"
            />
          </div>

          {/* Mixed Types Toggle */}
          <div className="control-group checkbox-group">
            <input
              type="checkbox"
              name="mixedTypes"
              checked={encounterParams.mixedTypes}
              onChange={handleParamChange}
              className="checkbox-input"
            />
            <label className="control-label">Allow Mixed Monster Types</label>
          </div>

          {/* Show Monsters Toggle */}
          <div className="control-group checkbox-group">
            <input
              type="checkbox"
              name="showMonsters"
              checked={encounterParams.showMonsters}
              onChange={handleParamChange}
              className="checkbox-input"
            />
            <label className="control-label">Show Monster Details</label>
          </div>

          {/* Replace the Specific Monster Selection with this new version */}
          <div className="control-group">
            <label className="control-label">Add Specific Monster</label>
            <select
              onChange={handleAddSpecificMonster}
              className="control-input"
            >
              <option value="">Select a monster...</option>
              {monsters.map((monster) => (
                <option key={monster.name} value={monster.name}>
                  {monster.name} (CR: {monster.challenge_rating})
                </option>
              ))}
            </select>
          </div>

          {/* Add this new section for displaying selected monsters */}
          {encounterParams.specificMonsters.length > 0 && (
            <div className="control-group">
              <label className="control-label">Selected Monsters:</label>
              <div className="selected-monsters-list">
                {encounterParams.specificMonsters.map((monsterName) => (
                  <div key={monsterName} className="selected-monster-item">
                    <span>{monsterName}</span>
                    <button
                      onClick={() => handleRemoveSpecificMonster(monsterName)}
                      className="remove-monster-button"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monster Type Selection */}
          <div className="control-group">
            <label className="control-label">Monster Type</label>
            <select
              name="monsterType"
              value={encounterParams.monsterType}
              onChange={handleParamChange}
              className="control-input"
            >
              {monsterTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={generateEncounter}
          disabled={loading || fetchingMonsters}
          className="generate-button"
        >
          {loading ? "Generating..." : "Generate Encounter"}
        </button>

        {/* Results Section */}
        {generatedEncounter && (
          <div className="results-section">
            <h2 className="results-title">Generated Encounter</h2>
            <div className="results-info">
              <p>
                Environment: {generatedEncounter.environment} | Location:{" "}
                {generatedEncounter.location}
              </p>
              <p>
                Total Challenge Rating: {generatedEncounter.totalCR.toFixed(1)}
              </p>
              <button
                onClick={saveEncounter}
                disabled={isSaving}
                className="save-button"
              >
                {isSaving ? "Saving..." : "Save Encounter"}
              </button>
              {saveError && (
                <p className="error-message">
                  Error saving encounter: {saveError}
                </p>
              )}
            </div>
            <div className="monster-list">
              {generatedEncounter.monsters.map((monster, index) => (
                <MonsterCard key={index} monster={monster} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EncounterGenerator;
