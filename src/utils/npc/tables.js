import { getGroups } from "./groups";
import { Option } from "./types";

// Import all the table data
import race from "./tables/race.json";
import class_ from "./tables/class.json";
import profession from "./tables/profession.json";
import forcealign from "./tables/forcealign.json";
import gender from "./tables/gender.json";
import personality from "./tables/personality.json";
import hooks from "./tables/hooks.json";
import femalehumanname from "./tables/femalehumanname.json";
import malehumanname from "./tables/malehumanname.json";
import femaleelfname from "./tables/femaleelfname.json";
import maleelfname from "./tables/maleelfname.json";
import femaledwarfname from "./tables/femaledwarfname.json";
import maledwarfname from "./tables/maledwarfname.json";
// Import subrace tables
import racedwarf from "./tables/racedwarf.json";
import raceelf from "./tables/raceelf.json";
import racegnome from "./tables/racegnome.json";
import racehalfling from "./tables/racehalfling.json";

const tables = {
  race,
  class: class_,
  profession,
  forcealign,
  gender,
  personality,
  hooks,
  femalehumanname,
  malehumanname,
  femaleelfname,
  maleelfname,
  femaledwarfname,
  maledwarfname,
  // Add subrace tables
  racedwarf,
  raceelf,
  racegnome,
  racehalfling,
};

// Initialize tables with weights and groups
function initializeTables() {
  for (const [name, table] of Object.entries(tables)) {
    let totalWeight = 0;
    const options = table.map((row) => {
      const w = row.w > 0 ? row.w : 0;
      totalWeight += w;
      // Preserve all properties from the original row
      return {
        w,
        v: row.v,
        original: row.v,
        table: row.table,
        name: row.name,
      };
    });
    tables[name] = { w: totalWeight, options };
  }
}

initializeTables();

export function getTable(tableName) {
  if (!(tableName in tables)) {
    throw new Error(`Unable to find table [${tableName}]`);
  }
  return tables[tableName];
}

export function getTableNames() {
  return Object.keys(tables);
}

export function getNamedTableOptions(tableName) {
  const options = getTable(tableName).options;
  return options
    .map((o, i) => ({ name: o.name, value: i }))
    .filter((o) => !!o.name);
}

export function getTableReferenceOptions(tableName) {
  const options = getTable(tableName).options;
  for (const opt of options) {
    if (!("table" in opt)) {
      throw new Error(
        `Missing "table" property in table ${tableName} option ${opt.original}`
      );
    }
  }
  return options
    .map((o, i) => ({
      name: o.name,
      value: i,
      table: o.table,
    }))
    .filter((o) => !!o.name);
}

export function getTableWeight(tableName) {
  return getTable(tableName).w;
}

export function getTableOptions(tableName) {
  return getTable(tableName).options;
}
