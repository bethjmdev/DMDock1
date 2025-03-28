import React, { useState, useEffect } from "react";

const BATCH_SIZE = 20; // Number of monsters to fetch at once

const EncounterGenerator = () => {
  const [encounterParams, setEncounterParams] = useState({
    partyLevel: 1,
    difficulty: "medium",
    environment: "plains",
    location: "underground",
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

  // Fetch monsters from D&D 5e API in batches
  useEffect(() => {
    const fetchMonsters = async () => {
      try {
        setFetchingMonsters(true);
        setMonsterFetchError(null);
        console.log("Starting monster fetch...");

        // First, get the list of all monsters
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

        console.log("All monsters fetched successfully");
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

      // Filter monsters by environment
      const filteredMonsters = filterMonstersByEnvironment(monsters);
      console.log("Filtered monsters:", filteredMonsters.length);

      // Calculate target CR
      const targetCR = calculateTargetCR();
      console.log("Target CR:", targetCR);

      // Determine number of monsters
      const numMonsters = getRandomNumber(
        parseInt(encounterParams.minMonsters),
        parseInt(encounterParams.maxMonsters)
      );
      console.log("Number of monsters to generate:", numMonsters);

      // Select monsters based on CR
      const selectedMonsters = [];
      let remainingCR = targetCR;

      for (let i = 0; i < numMonsters; i++) {
        const individualTargetCR = remainingCR / (numMonsters - i);
        console.log(`Monster ${i + 1} target CR:`, individualTargetCR);

        const crFilteredMonsters = filteredMonsters.filter((monster) => {
          const monsterCR = parseFloat(monster.challenge_rating);
          return Math.abs(monsterCR - individualTargetCR) <= 1;
        });
        console.log(
          `Found ${crFilteredMonsters.length} monsters matching CR criteria`
        );

        if (crFilteredMonsters.length === 0) {
          console.log("No monsters found matching CR criteria, breaking loop");
          break;
        }

        const randomIndex = Math.floor(
          Math.random() * crFilteredMonsters.length
        );
        const selectedMonster = crFilteredMonsters[randomIndex];
        console.log("Selected monster:", {
          name: selectedMonster.name,
          cr: selectedMonster.challenge_rating,
          hasActions: !!selectedMonster.actions,
          actionCount: selectedMonster.actions?.length,
        });

        selectedMonsters.push(selectedMonster);
        remainingCR -= parseFloat(selectedMonster.challenge_rating);
      }

      console.log("Final encounter:", {
        monsterCount: selectedMonsters.length,
        totalCR: targetCR,
        remainingCR,
        monsters: selectedMonsters.map((m) => ({
          name: m.name,
          cr: m.challenge_rating,
          hasActions: !!m.actions,
          actionCount: m.actions?.length,
        })),
      });

      setGeneratedEncounter({
        monsters: selectedMonsters,
        totalCR: targetCR,
        environment: encounterParams.environment,
        location: encounterParams.location,
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
          <li key={index}>
            <span className="font-medium">{actionName}:</span> {description}
            <ul className="list-disc list-inside ml-4">
              {action.actions.map((nestedAction, nestedIndex) =>
                renderAction(nestedAction, `${index}-${nestedIndex}`)
              )}
            </ul>
          </li>
        );
      }

      return (
        <li key={index}>
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
      <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
        <h3 className="text-lg font-bold mb-2">
          {safeRender(monster.name) || "Unnamed Monster"}
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-semibold">CR:</span>{" "}
            {safeRender(monster.challenge_rating)}
          </div>
          <div>
            <span className="font-semibold">Type:</span>{" "}
            {safeRender(monster.type)}
          </div>
          <div>
            <span className="font-semibold">Size:</span>{" "}
            {safeRender(monster.size)}
          </div>
          <div>
            <span className="font-semibold">Alignment:</span>{" "}
            {safeRender(monster.alignment)}
          </div>
          <div>
            <span className="font-semibold">AC:</span>{" "}
            {safeRender(monster.armor_class)}
          </div>
          <div>
            <span className="font-semibold">HP:</span>{" "}
            {safeRender(monster.hit_points)}
          </div>
        </div>
        {encounterParams.showMonsters && hasValidActions && (
          <div className="mt-2 text-sm">
            <p className="font-semibold">Actions:</p>
            <ul className="list-disc list-inside">
              {monster.actions.map((action, index) =>
                renderAction(action, index)
              )}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">D&D 5e Encounter Generator</h1>

      {monsterFetchError && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error loading monsters: {monsterFetchError}
        </div>
      )}

      {fetchingMonsters && (
        <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          Loading monsters... This may take a few moments.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Party Level */}
        <div>
          <label className="block text-sm font-medium mb-1">Party Level</label>
          <input
            type="number"
            name="partyLevel"
            value={encounterParams.partyLevel}
            onChange={handleParamChange}
            min="1"
            max="20"
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium mb-1">Difficulty</label>
          <select
            name="difficulty"
            value={encounterParams.difficulty}
            onChange={handleParamChange}
            className="w-full p-2 border rounded"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="deadly">Deadly</option>
          </select>
        </div>

        {/* Environment */}
        <div>
          <label className="block text-sm font-medium mb-1">Environment</label>
          <select
            name="environment"
            value={encounterParams.environment}
            onChange={handleParamChange}
            className="w-full p-2 border rounded"
          >
            <option value="plains">Plains</option>
            <option value="forest">Forest</option>
            <option value="hills">Hills</option>
            <option value="mountain">Mountain</option>
            <option value="marsh">Marsh</option>
            <option value="desert">Desert</option>
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <select
            name="location"
            value={encounterParams.location}
            onChange={handleParamChange}
            className="w-full p-2 border rounded"
          >
            <option value="underground">Underground</option>
            <option value="aquatic">Aquatic</option>
            <option value="underdark">Underdark</option>
            <option value="abyss">Abyss</option>
            <option value="nine_hells">Nine Hells</option>
            <option value="gehenna">Gehenna</option>
          </select>
        </div>

        {/* Monster Count Range */}
        <div>
          <label className="block text-sm font-medium mb-1">Min Monsters</label>
          <input
            type="number"
            name="minMonsters"
            value={encounterParams.minMonsters}
            onChange={handleParamChange}
            min="1"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Max Monsters</label>
          <input
            type="number"
            name="maxMonsters"
            value={encounterParams.maxMonsters}
            onChange={handleParamChange}
            min="1"
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Mixed Types Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="mixedTypes"
            checked={encounterParams.mixedTypes}
            onChange={handleParamChange}
            className="mr-2"
          />
          <label className="text-sm font-medium">
            Allow Mixed Monster Types
          </label>
        </div>

        {/* Show Monsters Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="showMonsters"
            checked={encounterParams.showMonsters}
            onChange={handleParamChange}
            className="mr-2"
          />
          <label className="text-sm font-medium">Show Monster Details</label>
        </div>
      </div>

      <button
        onClick={generateEncounter}
        disabled={loading || fetchingMonsters}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
      >
        {loading ? "Generating..." : "Generate Encounter"}
      </button>

      {/* Results Section */}
      {generatedEncounter && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-bold mb-4">Generated Encounter</h2>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Environment: {generatedEncounter.environment} | Location:{" "}
              {generatedEncounter.location}
            </p>
            <p className="text-sm text-gray-600">
              Total Challenge Rating: {generatedEncounter.totalCR.toFixed(1)}
            </p>
          </div>
          <div className="space-y-4">
            {generatedEncounter.monsters.map((monster, index) => (
              <MonsterCard key={index} monster={monster} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EncounterGenerator;
