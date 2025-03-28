import React, { useState, useEffect } from "react";
import "./EncounterGenerator.css";

const BATCH_SIZE = 40; // Number of monsters to fetch at once
const CACHE_KEY = "dnd_monsters_cache";
const CACHE_DURATION = 14 * 24 * 60 * 60 * 1000; // 2 weeks in milliseconds

const EncounterGenerator = () => {
  const [encounterParams, setEncounterParams] = useState({
    partyLevel: 1,
    difficulty: "random",
    environment: "random",
    location: "random",
    mixedTypes: false,
    minMonsters: 1,
    maxMonsters: 4,
    showMonsters: true,
  });

  const [monsters, setMonsters] = useState([]);
  const [generatedEncounter, setGeneratedEncounter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingMonsters, setFetchingMonsters] = useState(false);
  const [monsterFetchError, setMonsterFetchError] = useState(null);

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

      // Filter monsters by environment using the resolved environment/location
      const filteredMonsters = monsters.filter((monster) => {
        if (!monster.environments || monster.environments.length === 0) {
          return true; // Include monsters without environment tags
        }
        return monster.environments.some(
          (env) =>
            env.toLowerCase().includes(effectiveParams.environment) ||
            env.toLowerCase().includes(effectiveParams.location)
        );
      });

      console.log("Filtered monsters count:", filteredMonsters.length);

      // Determine number of monsters
      const numMonsters = getRandomNumber(
        parseInt(effectiveParams.minMonsters),
        parseInt(effectiveParams.maxMonsters)
      );

      // Select monsters based on CR
      const selectedMonsters = [];
      let remainingCR = targetCR;

      for (let i = 0; i < numMonsters; i++) {
        const individualTargetCR = remainingCR / (numMonsters - i);

        const crFilteredMonsters = filteredMonsters.filter((monster) => {
          const monsterCR = parseFloat(monster.challenge_rating);
          return Math.abs(monsterCR - individualTargetCR) <= 1;
        });

        if (crFilteredMonsters.length === 0) {
          console.log("No suitable monsters found for CR:", individualTargetCR);
          break;
        }

        const selectedMonster =
          crFilteredMonsters[
            Math.floor(Math.random() * crFilteredMonsters.length)
          ];

        selectedMonsters.push(selectedMonster);
        remainingCR -= parseFloat(selectedMonster.challenge_rating);
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
