import React, { useState } from "react";
import "./TownGenerator.css";

const TownGenerator = () => {
  const [townData, setTownData] = useState(null);
  const [formData, setFormData] = useState({
    size: "medium", // random, small, medium, large
    population: "medium", // random, small, medium, large
    wealth: "medium", // random, poor, medium, rich
  });

  const generateTownName = () => {
    const prefixes = [
      "Stone",
      "Iron",
      "Gold",
      "Silver",
      "Copper",
      "Crystal",
      "Emerald",
      "Ruby",
      "Sapphire",
      "Diamond",
      "Oak",
      "Pine",
      "Maple",
      "Cedar",
      "Willow",
    ];
    const suffixes = [
      "ville",
      "burg",
      "town",
      "city",
      "haven",
      "port",
      "gate",
      "bridge",
      "ford",
      "field",
      "wood",
      "hill",
      "dale",
      "vale",
      "brook",
    ];
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${
      suffixes[Math.floor(Math.random() * suffixes.length)]
    }`;
  };

  const generateRaceDemographics = () => {
    const races = [
      "human",
      "elf",
      "dwarf",
      "halfling",
      "dragonborn",
      "gnome",
      "halfElf",
      "halfOrc",
      "tiefling",
      "tabaxi",
    ];

    // Base weights for each race (higher number = more common)
    const weights = {
      human: 40,
      elf: 15,
      dwarf: 15,
      halfling: 10,
      dragonborn: 5,
      gnome: 5,
      halfElf: 3,
      halfOrc: 3,
      tiefling: 2,
      tabaxi: 2,
    };

    // Generate random percentages that sum to 100
    let remainingPercentage = 100;
    const demographics = {};

    races.forEach((race) => {
      if (remainingPercentage <= 0) {
        demographics[race] = 0;
        return;
      }

      // Calculate a random percentage based on the race's weight
      const maxPercentage = Math.min(remainingPercentage, weights[race]);
      const percentage = Math.floor(Math.random() * maxPercentage) + 1;

      demographics[race] = percentage;
      remainingPercentage -= percentage;
    });

    // If there's any remaining percentage, add it to humans
    if (remainingPercentage > 0) {
      demographics.human += remainingPercentage;
    }

    return demographics;
  };

  const calculatePopulation = (size) => {
    switch (size) {
      case "small":
        return Math.floor(Math.random() * 100) + 50;
      case "medium":
        return Math.floor(Math.random() * 9000) + 1000;
      case "large":
        return Math.floor(Math.random() * 90000) + 10000;
      default:
        return 1000;
    }
  };

  const calculateAcres = (population) => {
    return Math.ceil(population / 32); // Rough estimate: 32 people per acre
  };

  const calculateWealth = (wealth) => {
    switch (wealth) {
      case "poor":
        return {
          total: Math.floor(Math.random() * 1000) + 100,
          maxSale: Math.floor(Math.random() * 100) + 10,
          maxPawn: Math.floor(Math.random() * 500) + 50,
        };
      case "medium":
        return {
          total: Math.floor(Math.random() * 9000) + 1000,
          maxSale: Math.floor(Math.random() * 1000) + 100,
          maxPawn: Math.floor(Math.random() * 5000) + 500,
        };
      case "rich":
        return {
          total: Math.floor(Math.random() * 90000) + 10000,
          maxSale: Math.floor(Math.random() * 10000) + 1000,
          maxPawn: Math.floor(Math.random() * 50000) + 5000,
        };
      default:
        return {
          total: 1000,
          maxSale: 100,
          maxPawn: 500,
        };
    }
  };

  const generateDefenses = (size) => {
    const defenses = [];
    if (size === "large") {
      defenses.push("Stone walls");
      defenses.push(`${Math.floor(Math.random() * 100) + 50} trained warriors`);
      defenses.push(`Militia of ${Math.floor(Math.random() * 1000) + 500}`);
    } else if (size === "medium") {
      defenses.push("Wooden walls");
      defenses.push(`${Math.floor(Math.random() * 50) + 20} trained warriors`);
      defenses.push(`Militia of ${Math.floor(Math.random() * 500) + 100}`);
    } else {
      defenses.push("Simple wood and earth walls");
      defenses.push(`Militia of ${Math.floor(Math.random() * 10) + 1}`);
    }
    return defenses;
  };

  const generateOrganizations = (size) => {
    const organizations = [
      "The Silver Hand",
      "The Emerald Circle",
      "The Iron Fist",
      "The Golden Dawn",
      "The Sapphire Order",
      "The Ruby Brotherhood",
      "The Diamond League",
      "The Copper Company",
      "The Crystal Council",
      "The Obsidian Pact",
    ];
    const numOrgs = size === "large" ? 3 : size === "medium" ? 2 : 1;
    const selectedOrgs = [];
    for (let i = 0; i < numOrgs; i++) {
      const randomIndex = Math.floor(Math.random() * organizations.length);
      selectedOrgs.push(organizations[randomIndex]);
    }
    return selectedOrgs;
  };

  const generateShopName = (type) => {
    const prefixes = [
      "The",
      "The Noble",
      "The Royal",
      "The Golden",
      "The Silver",
      "The Iron",
      "The Copper",
      "The Crystal",
      "The Emerald",
      "The Ruby",
      "The Sapphire",
      "The Obsidian",
      "The Mithril",
      "The Adamantine",
      "The Dragon's",
    ];
    const names = {
      blacksmith: [
        "Anvil",
        "Forge",
        "Hammer",
        "Steel",
        "Ironworks",
        "Metalworks",
        "Smithy",
        "Armory",
        "Weaponsmith",
        "Armorsmith",
      ],
      alchemist: [
        "Potion",
        "Elixir",
        "Brew",
        "Cauldron",
        "Alembic",
        "Phial",
        "Vial",
        "Flask",
        "Crucible",
        "Retort",
      ],
      jeweler: [
        "Gem",
        "Jewel",
        "Amulet",
        "Ring",
        "Crown",
        "Treasure",
        "Crystal",
        "Diamond",
        "Pearl",
        "Ruby",
      ],
      enchanter: [
        "Enchantment",
        "Magic",
        "Spell",
        "Wizardry",
        "Arcana",
        "Mystic",
        "Witchcraft",
        "Sorcery",
        "Wizard's",
        "Mage's",
      ],
      general: [
        "Store",
        "Market",
        "Shop",
        "Trading Post",
        "Bazaar",
        "Emporium",
        "Boutique",
        "Warehouse",
        "Depot",
        "Exchange",
      ],
      church: [
        "Temple",
        "Sanctuary",
        "Chapel",
        "Cathedral",
        "Shrine",
        "Abbey",
        "Monastery",
        "Church",
        "Hall",
        "Sanctum",
      ],
    };

    return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${
      names[type][Math.floor(Math.random() * names[type].length)]
    }`;
  };

  const generateOwner = (demographics) => {
    const races = Object.entries(demographics)
      .filter(([_, percentage]) => percentage > 0)
      .map(([race]) => race);
    const race = races[Math.floor(Math.random() * races.length)];
    const gender = Math.random() > 0.5 ? "Male" : "Female";
    const firstNames = {
      male: [
        "Aragorn",
        "Boromir",
        "Gandalf",
        "Frodo",
        "Sam",
        "Merry",
        "Pippin",
        "Gimli",
        "Legolas",
        "Thorin",
        "Bilbo",
        "Gandalf",
        "Radagast",
        "Saruman",
        "Elrond",
        "Glorfindel",
        "Celeborn",
        "Thranduil",
        "Beorn",
        "Bard",
      ],
      female: [
        "Arwen",
        "Galadriel",
        "Eowyn",
        "Rosie",
        "Lobelia",
        "Belladonna",
        "Primula",
        "Diamond",
        "Pearl",
        "Ruby",
        "Sapphire",
        "Emerald",
        "Crystal",
        "Amethyst",
        "Jade",
        "Opal",
        "Topaz",
        "Garnet",
        "Jasper",
      ],
    };
    const lastNames = [
      "Smith",
      "Johnson",
      "Williams",
      "Brown",
      "Jones",
      "Garcia",
      "Miller",
      "Davis",
      "Rodriguez",
      "Martinez",
      "Hernandez",
      "Lopez",
      "Gonzalez",
      "Wilson",
      "Anderson",
      "Thomas",
      "Taylor",
      "Moore",
      "Jackson",
      "Martin",
      "Lee",
      "Perez",
      "Thompson",
      "White",
      "Harris",
      "Sanchez",
      "Clark",
      "Ramirez",
      "Lewis",
      "Robinson",
      "Walker",
      "Young",
      "Allen",
      "King",
      "Wright",
      "Scott",
      "Torres",
      "Nguyen",
      "Hill",
      "Flores",
      "Green",
      "Adams",
      "Nelson",
      "Baker",
      "Hall",
      "Rivera",
      "Campbell",
      "Mitchell",
      "Carter",
      "Roberts",
    ];

    const name = `${
      firstNames[gender.toLowerCase()][
        Math.floor(Math.random() * firstNames[gender.toLowerCase()].length)
      ]
    } ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;

    return {
      name,
      gender,
      race,
    };
  };

  const generateLocation = (type) => {
    const districts = [
      "main street",
      "market square",
      "temple district",
      "adventurer's district",
      "civic quarter",
      "residential area",
      "commercial district",
      "noble quarter",
      "slums",
      "port district",
      "craftsman's quarter",
      "arcane quarter",
      "merchant's row",
      "artisan's alley",
      "warehouse district",
    ];

    const streetFeatures = [
      "unusually full of carriages",
      "shaded by colorful trees",
      "watched by a squad of the town guard",
      "filled with market stalls",
      "covered in fallen leaves",
      "adjacent to a small office",
      "next to a large public square",
      "has drunken revelers",
      "has a town crier with the latest news",
      "has a pickpocket looking for marks",
      "has a beggar harassing passers-by",
      "has a weird smell",
      "is unusually quiet",
      "is bustling with activity",
      "has a royal carriage passing by",
    ];

    return `In a ${
      districts[Math.floor(Math.random() * districts.length)]
    }. The street outside ${
      streetFeatures[Math.floor(Math.random() * streetFeatures.length)]
    }.`;
  };

  const generateBuildingDescription = (type) => {
    const materials = [
      "wooden",
      "stone",
      "brick",
      "plaster",
      "concrete",
      "marble",
      "timber framed",
      "stone-walled",
      "brick and timber",
      "plaster and wood framed",
    ];

    const styles = [
      "cabin",
      "tower",
      "rowhouse",
      "single storey building",
      "two-storey building",
      "sprawling building",
      "simple building",
    ];

    const roofs = [
      "brown tile roof",
      "white tile roof",
      "red tile roof",
      "green tile roof",
      "blue tile roof",
      "orange shingled roof",
      "brown shingled roof",
      "white shingled roof",
      "tanned wooden roof",
      "gray shingled roof",
    ];

    const features = [
      "shiny hardwood floors",
      "nicely trimmed hedges",
      "dead hedges",
      "vines covering the walls",
      "a row of flowers around the building",
      "softly blowing chimes by the door",
      "a big brick chimney",
      "several shuttered windows",
      "moss-covered walls",
      "finely-crafted furniture",
    ];

    const interiors = {
      blacksmith: [
        "an empty cage and chains and wires hanging on the walls",
        "a large variety of metal tongs hanging on the walls",
        "a forge with various tools and materials",
        "weapons and armor on display",
        "metalworking equipment and supplies",
      ],
      alchemist: [
        "low ceilings and a small serving area with glowing potions",
        "a small wood oven and crumpled up notes scattered everywhere",
        "shelves filled with exotic ingredients",
        "a bubbling cauldron and various alchemical apparatus",
        "glass containers with colorful liquids",
      ],
      jeweler: [
        "antique cabinets filled with oddities and glass display cabinets with jewelry",
        "a small dragon's skull hanging over the hearth",
        "taxidermied birds hanging from the ceiling",
        "precious metals and gems on display",
        "delicate tools and workbenches",
      ],
      enchanter: [
        "an empty cage and a map of constellations on the floor",
        "stained glass windows",
        "magical diagrams drawn on the walls",
        "floating magical items",
        "arcane symbols etched into the floor",
      ],
      general: [
        "a set of gold scales and the walls are covered in paintings and advertisements",
        "a number of hunting trophies line the walls",
        "sacks full of fruit cover the floor",
        "well-organized shelves with various goods",
        "a large counter with various items on display",
      ],
      church: [
        "a deck with chairs and religious texts",
        "stained glass windows of religious art",
        "a large grandfather clock",
        "religious symbols and artwork",
        "a peaceful meditation area",
      ],
    };

    return `The ${type} is a ${
      materials[Math.floor(Math.random() * materials.length)]
    } ${styles[Math.floor(Math.random() * styles.length)]}, with a ${
      roofs[Math.floor(Math.random() * roofs.length)]
    } and ${
      features[Math.floor(Math.random() * features.length)]
    }. It contains ${
      interiors[type][Math.floor(Math.random() * interiors[type].length)]
    }.`;
  };

  const generateSpecialItems = (type, wealth) => {
    const items = {
      blacksmith: [
        { name: "Shield", source: "phb 145", price: 10 },
        { name: "Mariner's Armor", source: "dmg 181", price: 1457 },
        { name: "Scale Mail", source: "phb 145", price: 46 },
        { name: "Longsword", source: "phb 149", price: 15 },
        { name: "Chain Mail", source: "phb 145", price: 75 },
        { name: "Battle Axe", source: "phb 149", price: 10 },
        { name: "Crossbow", source: "phb 149", price: 25 },
        { name: "Plate Armor", source: "phb 145", price: 1500 },
      ],
      alchemist: [
        { name: "Potion of Vitality", source: "dmg 188", price: 934 },
        { name: "Potion of Fire Breath", source: "dmg 187", price: 150 },
        { name: "Potion of Invisibility", source: "dmg 188", price: 172 },
        { name: "Potion of Healing", source: "phb 153", price: 50 },
        { name: "Potion of Giant Strength", source: "dmg 187", price: 450 },
        { name: "Potion of Resistance", source: "dmg 188", price: 150 },
        { name: "Potion of Water Breathing", source: "dmg 188", price: 500 },
        { name: "Potion of Mind Reading", source: "dmg 188", price: 180 },
      ],
      jeweler: [
        { name: "Crystal Arcane Focus", source: "phb 151", price: 10 },
        { name: "Exquisite Earrings", source: "custom", price: 4 },
        { name: "Exquisite Ring", source: "custom", price: 3 },
        { name: "Diamond Ring", source: "custom", price: 100 },
        { name: "Sapphire Necklace", source: "custom", price: 75 },
        { name: "Ruby Bracelet", source: "custom", price: 50 },
        { name: "Emerald Tiara", source: "custom", price: 200 },
        { name: "Pearl Brooch", source: "custom", price: 25 },
      ],
      enchanter: [
        { name: "Quaal's Feather Token", source: "dmg 188", price: 48 },
        { name: "Bracers of Archery", source: "dmg 156", price: 1486 },
        { name: "Sending Stones", source: "dmg 199", price: 1900 },
        { name: "Bag of Holding", source: "dmg 153", price: 250 },
        { name: "Cloak of Protection", source: "dmg 159", price: 3500 },
        { name: "Ring of Warmth", source: "dmg 193", price: 100 },
        { name: "Wand of Magic Missiles", source: "dmg 211", price: 200 },
        { name: "Scroll of Fireball", source: "dmg 200", price: 150 },
      ],
      general: [
        { name: "Shovel", source: "phb 150", price: 2 },
        { name: "Potter's Tools", source: "phb 154", price: 10 },
        { name: "Pick, Miner's", source: "phb 150", price: 2 },
        { name: "Rope, Hempen", source: "phb 153", price: 1 },
        { name: "Lantern, Hooded", source: "phb 152", price: 5 },
        { name: "Lock", source: "phb 152", price: 10 },
        { name: "Crowbar", source: "phb 151", price: 2 },
        { name: "Grappling Hook", source: "phb 151", price: 2 },
      ],
    };

    const maxItems = wealth === "rich" ? 5 : wealth === "medium" ? 3 : 2;
    const selectedItems = [];
    const availableItems = [...items[type]];

    for (let i = 0; i < maxItems; i++) {
      if (availableItems.length === 0) break;
      const randomIndex = Math.floor(Math.random() * availableItems.length);
      selectedItems.push(availableItems[randomIndex]);
      availableItems.splice(randomIndex, 1);
    }

    return selectedItems;
  };

  const generatePatrons = (demographics, type) => {
    const numPatrons = Math.floor(Math.random() * 4); // 0-3 patrons
    if (numPatrons === 0) return [];

    const races = Object.entries(demographics)
      .filter(([_, percentage]) => percentage > 0)
      .map(([race]) => race);

    const patrons = [];
    for (let i = 0; i < numPatrons; i++) {
      const race = races[Math.floor(Math.random() * races.length)];
      const gender = Math.random() > 0.5 ? "Male" : "Female";
      const firstNames = {
        male: [
          "Aragorn",
          "Boromir",
          "Gandalf",
          "Frodo",
          "Sam",
          "Merry",
          "Pippin",
          "Gimli",
          "Legolas",
          "Thorin",
          "Bilbo",
          "Gandalf",
          "Radagast",
          "Saruman",
          "Elrond",
          "Glorfindel",
          "Celeborn",
          "Thranduil",
          "Beorn",
          "Bard",
        ],
        female: [
          "Arwen",
          "Galadriel",
          "Eowyn",
          "Rosie",
          "Lobelia",
          "Belladonna",
          "Primula",
          "Diamond",
          "Pearl",
          "Ruby",
          "Sapphire",
          "Emerald",
          "Crystal",
          "Amethyst",
          "Jade",
          "Opal",
          "Topaz",
          "Garnet",
          "Jasper",
        ],
      };
      const lastNames = [
        "Smith",
        "Johnson",
        "Williams",
        "Brown",
        "Jones",
        "Garcia",
        "Miller",
        "Davis",
        "Rodriguez",
        "Martinez",
        "Hernandez",
        "Lopez",
        "Gonzalez",
        "Wilson",
        "Anderson",
        "Thomas",
        "Taylor",
        "Moore",
        "Jackson",
        "Martin",
        "Lee",
        "Perez",
        "Thompson",
        "White",
        "Harris",
        "Sanchez",
        "Clark",
        "Ramirez",
        "Lewis",
        "Robinson",
        "Walker",
        "Young",
        "Allen",
        "King",
        "Wright",
        "Scott",
        "Torres",
        "Nguyen",
        "Hill",
        "Flores",
        "Green",
        "Adams",
        "Nelson",
        "Baker",
        "Hall",
        "Rivera",
        "Campbell",
        "Mitchell",
        "Carter",
        "Roberts",
      ];

      const name = `${
        firstNames[gender.toLowerCase()][
          Math.floor(Math.random() * firstNames[gender.toLowerCase()].length)
        ]
      } ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;

      patrons.push({
        name,
        gender,
        race,
      });
    }

    return patrons;
  };

  const generateShops = (size, demographics, wealth) => {
    const shopTypes = [
      "blacksmith",
      "alchemist",
      "jeweler",
      "enchanter",
      "general",
      "church",
    ];
    const numShops = size === "large" ? 6 : size === "medium" ? 4 : 2;
    const selectedTypes = [];
    const availableTypes = [...shopTypes];

    for (let i = 0; i < numShops; i++) {
      if (availableTypes.length === 0) break;
      const randomIndex = Math.floor(Math.random() * availableTypes.length);
      selectedTypes.push(availableTypes[randomIndex]);
      availableTypes.splice(randomIndex, 1);
    }

    return selectedTypes.map((type) => {
      const owner = generateOwner(demographics);
      return {
        type,
        name: generateShopName(type),
        owner,
        location: generateLocation(type),
        description: generateBuildingDescription(type),
        specials: generateSpecialItems(type, wealth),
        patrons: generatePatrons(demographics, type),
      };
    });
  };

  const getRandomOption = (options) => {
    const index = Math.floor(Math.random() * options.length);
    return options[index];
  };

  const generateTown = () => {
    const sizeOptions = ["small", "medium", "large"];
    const wealthOptions = ["poor", "medium", "rich"];

    const actualSize =
      formData.size === "random" ? getRandomOption(sizeOptions) : formData.size;

    const actualPopulation =
      formData.population === "random"
        ? getRandomOption(sizeOptions)
        : formData.population;

    const actualWealth =
      formData.wealth === "random"
        ? getRandomOption(wealthOptions)
        : formData.wealth;

    const population = calculatePopulation(actualSize);
    const acres = calculateAcres(population);
    const wealth = calculateWealth(actualWealth);
    const defenses = generateDefenses(actualSize);
    const organizations = generateOrganizations(actualSize);
    const demographics = generateRaceDemographics();
    const shops = generateShops(actualSize, demographics, actualWealth);

    setTownData({
      name: generateTownName(),
      population,
      acres,
      demographics,
      wealth,
      defenses,
      organizations,
      shops,
    });
  };

  return (
    <div className="town-generator">
      <div className="town-container">
        <h1 className="town-title">Town Generator</h1>

        <div className="parameters-section">
          <h2 className="parameters-title">Town Parameters</h2>
          <div className="parameters-grid">
            <div className="parameter-group">
              <label className="parameter-label">Size:</label>
              <select
                className="parameter-input"
                value={formData.size}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, size: e.target.value }))
                }
              >
                <option value="random">Random</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div className="parameter-group">
              <label className="parameter-label">Population:</label>
              <select
                className="parameter-input"
                value={formData.population}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    population: e.target.value,
                  }))
                }
              >
                <option value="random">Random</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div className="parameter-group">
              <label className="parameter-label">Wealth:</label>
              <select
                className="parameter-input"
                value={formData.wealth}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, wealth: e.target.value }))
                }
              >
                <option value="random">Random</option>
                <option value="poor">Poor</option>
                <option value="medium">Medium</option>
                <option value="rich">Rich</option>
              </select>
            </div>
          </div>
        </div>

        <button className="generate-button" onClick={generateTown}>
          Generate Town
        </button>

        {townData && (
          <div className="town-results">
            <h2 className="town-name">{townData.name}</h2>
            <div className="town-info-grid">
              <div className="info-section">
                <p>
                  <strong>Population:</strong>{" "}
                  {townData.population.toLocaleString()}
                </p>
                <p>
                  <strong>Size:</strong> {townData.acres} acres
                </p>
                <p>
                  <strong>Demographics:</strong>
                </p>
                <ul className="info-list">
                  {Object.entries(townData.demographics).map(
                    ([race, percentage]) => (
                      <li key={race} className="capitalize">
                        {race}: {percentage}%
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div className="info-section">
                <p>
                  <strong>Wealth:</strong>
                </p>
                <ul className="info-list">
                  <li>Total: {townData.wealth.total.toLocaleString()} gp</li>
                  <li>
                    Max value for sale:{" "}
                    {townData.wealth.maxSale.toLocaleString()} gp
                  </li>
                  <li>
                    Max pawn value: {townData.wealth.maxPawn.toLocaleString()}{" "}
                    gp
                  </li>
                </ul>
                <p className="mt-2">
                  <strong>Defenses:</strong>
                </p>
                <ul className="info-list">
                  {townData.defenses.map((defense, index) => (
                    <li key={index}>{defense}</li>
                  ))}
                </ul>
                <p className="mt-2">
                  <strong>Organizations:</strong>
                </p>
                <ul className="info-list">
                  {townData.organizations.map((org, index) => (
                    <li key={index}>{org}</li>
                  ))}
                </ul>
              </div>
            </div>

            <h2 className="section-title">Shops and Buildings</h2>
            {townData.shops.map((shop, index) => (
              <div key={index} className="shop-card">
                <h3 className="shop-title">
                  {shop.type}: {shop.name}
                </h3>
                <div className="shop-info">
                  <p>
                    <strong>Owner:</strong> {shop.owner.name},{" "}
                    {shop.owner.gender} {shop.owner.race}
                  </p>
                  <p>
                    <strong>Location:</strong> {shop.location}
                  </p>
                  <p>
                    <strong>Description:</strong> {shop.description}
                  </p>
                </div>
                {shop.specials.length > 0 && (
                  <>
                    <p>
                      <strong>Specials:</strong>
                    </p>
                    <ul className="shop-list">
                      {shop.specials.map((item, itemIndex) => (
                        <li key={itemIndex}>
                          {item.name} ({item.source}) ({item.price} gp)
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {shop.patrons.length > 0 && (
                  <>
                    <p>
                      <strong>Other Patrons:</strong>
                    </p>
                    <ul className="shop-list">
                      {shop.patrons.map((patron, patronIndex) => (
                        <li key={patronIndex}>
                          {patron.name}, {patron.gender} {patron.race}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TownGenerator;
