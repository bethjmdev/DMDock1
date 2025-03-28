import React, { useState } from "react";
import { getTable, getTableNames } from "../../../utils/npc/tables";
import { chooseRandomWithWeight } from "../../../utils/npc/utils";

// Utility functions
const getGroups = (val) => {
  if (typeof val !== "string" || val.length === 0) {
    throw new Error("Empty value to get group");
  }
  val = val.replace("{\\n}", "\n");
  const reGroup = /{((\\{|\\}|[^{}])*)}|((\\{|\\}|[^{}])+)/g;
  const matches = val.match(reGroup) || [];
  return matches.map((g) => {
    if (g[0] === "{") {
      // Handle operators here
      return g;
    }
    return g;
  });
};

const processGroups = (groups, context, options) => {
  let result = "";
  for (const instruction of groups) {
    if (typeof instruction === "string") {
      result += instruction;
    } else if (typeof instruction === "function") {
      const insRes = instruction(context, options);
      if (insRes !== undefined) {
        if (Array.isArray(insRes)) {
          result += processGroups(insRes, context, options);
        } else {
          result += insRes;
        }
      }
    } else if (Array.isArray(instruction)) {
      result += processGroups(instruction, context, options);
    }
  }
  return result;
};

const generateNPC = (npcOptions) => {
  const context = { vars: {} };
  const options = {
    race: npcOptions.race ? parseInt(npcOptions.race) : null,
    subrace: npcOptions.subrace ? parseInt(npcOptions.subrace) : null,
    classorprof: npcOptions.classorprof
      ? parseInt(npcOptions.classorprof)
      : null,
    occupation1: npcOptions.occupation1
      ? parseInt(npcOptions.occupation1)
      : null,
    occupation2: npcOptions.occupation2
      ? parseInt(npcOptions.occupation2)
      : null,
    alignment: npcOptions.alignment ? parseInt(npcOptions.alignment) : null,
    plothook: npcOptions.plothook ? parseInt(npcOptions.plothook) : null,
    gender: npcOptions.gender ? parseInt(npcOptions.gender) : null,
  };

  try {
    // Get race
    const raceTable = getTable("race");
    const race =
      options.race !== null
        ? raceTable.options[options.race].v
        : chooseRandomWithWeight(raceTable.options, raceTable.w);

    // Get subrace if applicable
    let subrace = "";
    if (options.subrace !== null) {
      const selectedRace = raceTable.options[options.race];
      if (selectedRace && selectedRace.table) {
        const subraceTableName = `race${selectedRace.table}`;
        const subraceTable = getTable(subraceTableName);
        if (subraceTable && subraceTable.options[options.subrace]) {
          subrace = subraceTable.options[options.subrace].v;
        }
      }
    }

    // Get class/profession
    const classTable = getTable("class");
    const professionTable = getTable("profession");
    const classOrProf =
      options.classorprof !== null
        ? options.classorprof === 0
          ? classTable.options[options.occupation1].v
          : professionTable.options[options.occupation1].v
        : chooseRandomWithWeight(classTable.options, classTable.w);

    // Get alignment
    const alignmentTable = getTable("forcealign");
    const alignment =
      options.alignment !== null
        ? alignmentTable.options[options.alignment].v
        : chooseRandomWithWeight(alignmentTable.options, alignmentTable.w);

    // Get gender
    const genderTable = getTable("gender");
    const gender =
      options.gender !== null
        ? genderTable.options[options.gender].v
        : chooseRandomWithWeight(genderTable.options, genderTable.w);

    // Get name based on race and gender
    let name = "";
    if (race.includes("Human")) {
      const nameTable = gender.includes("Female")
        ? getTable("femalehumanname")
        : getTable("malehumanname");
      name = chooseRandomWithWeight(nameTable.options, nameTable.w);
    } else if (race.includes("Elf")) {
      const nameTable = gender.includes("Female")
        ? getTable("femaleelfname")
        : getTable("maleelfname");
      name = chooseRandomWithWeight(nameTable.options, nameTable.w);
    } else if (race.includes("Dwarf")) {
      const nameTable = gender.includes("Female")
        ? getTable("femaledwarfname")
        : getTable("maledwarfname");
      name = chooseRandomWithWeight(nameTable.options, nameTable.w);
    }

    // Get personality traits
    const personalityTable = getTable("personality");
    const personality = chooseRandomWithWeight(
      personalityTable.options,
      personalityTable.w
    );

    // Get background hook
    const hooksTable = getTable("hooks");
    const background =
      options.plothook !== null
        ? hooksTable.options[options.plothook].v
        : chooseRandomWithWeight(hooksTable.options, hooksTable.w);

    return {
      name: name || "Unknown",
      race: subrace ? `${subrace} ${race}` : race,
      class: classOrProf,
      alignment,
      gender,
      personality,
      background,
      occupation: classOrProf,
    };
  } catch (error) {
    console.error("Error in generateNPC:", error);
    throw error;
  }
};

const NPCGenerator = () => {
  const [npc, setNpc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState({
    race: "",
    subrace: "",
    classorprof: "",
    occupation1: "",
    occupation2: "",
    alignment: "",
    plothook: "",
    gender: "",
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const generatedNPC = generateNPC(options);
      setNpc(generatedNPC);
    } catch (error) {
      console.error("Error generating NPC:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get table options for dropdowns
  const processDisplayValue = (value) => {
    // First try to extract from $variable=value pattern
    const match = value.match(/\$[a-zA-Z]+=([^}]+)/);
    if (match) return match[1];

    // For race values, look for race prefix
    const raceMatch = value.match(/\{race([^}]+)\}/);
    if (raceMatch) return raceMatch[1];

    // For alignment values, clean up the %good% pattern
    if (value.includes("%good%") || value.includes("%evil%")) {
      return value
        .replace(/%/g, "")
        .replace(
          /good|evil/gi,
          (match) => match.charAt(0).toUpperCase() + match.slice(1)
        );
    }

    // If no special patterns found, clean up the value
    return value
      .replace(/[{}]/g, "")
      .replace(/race(?:dwarf|elf|gnome|halfling|orc|human)/, "")
      .replace(/[%+-][0-9]+/g, "")
      .replace(/[a-z]+(?:god|skin|beard|age|gender|quirks)/g, "")
      .trim();
  };

  const raceOptions = getTable("race").options.map((option) => ({
    value: option.v,
    label: option.name || processDisplayValue(option.v),
    table: option.table,
    name: option.name,
  }));

  // Get subrace options based on selected race
  const getSubraceOptions = () => {
    const selectedRace = raceOptions.find(
      (option) => option.value === options.race
    );
    if (!selectedRace || !selectedRace.table) return [];

    // Map race table names to subrace table names
    const subraceTableMap = {
      dwarf: "racedwarf",
      elf: "raceelf",
      gnome: "racegnome",
      halfling: "racehalfling",
    };

    const subraceTableName = subraceTableMap[selectedRace.table];
    if (!subraceTableName) return [];

    try {
      const subraceTable = getTable(subraceTableName);
      if (!subraceTable) return [];

      return subraceTable.options.map((option) => ({
        value: option.v,
        label: option.name || processDisplayValue(option.v),
      }));
    } catch (error) {
      console.error(`Error getting subrace table ${subraceTableName}:`, error);
      return [];
    }
  };

  const classOptions = getTable("class").options.map((option) => ({
    value: option.v,
    label: processDisplayValue(option.v),
  }));
  const alignmentOptions = [
    { value: "", label: "Random" },
    { value: 0, label: "Good" },
    { value: 1, label: "Evil" },
  ];
  const genderOptions = getTable("gender").options.map((option, index) => ({
    value: index,
    label: processDisplayValue(option.v),
  }));

  const handleOptionChange = (e) => {
    const { name, value } = e.target;
    console.log(`Selected ${name}:`, value);

    // Reset subrace when race changes
    if (name === "race") {
      setOptions((prev) => ({
        ...prev,
        [name]: value,
        subrace: "",
      }));
      return;
    }

    // For subrace, store the value directly
    if (name === "subrace") {
      setOptions((prev) => ({
        ...prev,
        [name]: value,
      }));
      return;
    }

    // For other options, handle as before
    const table = getTable(
      name === "classorprof"
        ? "class"
        : name === "alignment"
        ? "forcealign"
        : name
    );
    if (table && table.options[value]) {
      console.log(`Option details for ${name}:`, table.options[value]);
      console.log(
        `Processed display value:`,
        processDisplayValue(table.options[value].v)
      );
    }
    setOptions((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Debug log to check subrace options
  console.log("Selected race:", options.race);
  console.log("Subrace options:", getSubraceOptions());

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">NPC Generator</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Generation Options
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Race
            </label>
            <select
              name="race"
              value={options.race}
              onChange={handleOptionChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Race</option>
              {raceOptions.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {options.race && getSubraceOptions().length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subrace
              </label>
              <select
                name="subrace"
                value={options.subrace}
                onChange={handleOptionChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Subrace</option>
                {getSubraceOptions().map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              name="classorprof"
              value={options.classorprof}
              onChange={handleOptionChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Class</option>
              {classOptions.map((option, index) => (
                <option key={index} value={index}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alignment
            </label>
            <select
              name="alignment"
              value={options.alignment}
              onChange={handleOptionChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Alignment</option>
              {alignmentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              name="gender"
              value={options.gender}
              onChange={handleOptionChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Gender</option>
              {genderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate NPC"}
        </button>
      </div>

      {npc && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Generated NPC
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{npc.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Race</p>
              <p className="font-medium">{npc.race}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Class</p>
              <p className="font-medium">{npc.class}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Alignment</p>
              <p className="font-medium">{npc.alignment}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Gender</p>
              <p className="font-medium">{npc.gender}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Personality</p>
              <p className="font-medium">{npc.personality}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Background</p>
              <p className="font-medium">{npc.background}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NPCGenerator;
