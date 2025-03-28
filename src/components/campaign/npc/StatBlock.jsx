import React from "react";
import PersonalityTraits from "./PersonalityTraits";

const StatBlock = ({ npc }) => {
  const calculateModifier = (score) => {
    return Math.floor((score - 10) / 2);
  };

  return (
    <div className="stat-block bg-white p-4 rounded-lg shadow-md">
      <div className="border-b-2 border-gray-800 mb-4">
        <h3 className="text-xl font-bold text-center">{npc.name}</h3>
        <p className="text-center text-gray-600">
          {npc.race} • {npc.sex} • {npc.alignment} • {npc.occupation}
        </p>
      </div>

      <div className="player-stats grid grid-cols-3 gap-4 mb-4">
        <div className="text-gray-800">
          <span className="font-medium">STR:</span>{" "}
          {npc.ability_scores.strength}
          <span className="text-sm text-gray-600">
            ({calculateModifier(npc.ability_scores.strength)})
          </span>
        </div>
        <div className="text-gray-800">
          <span className="font-medium">DEX:</span>{" "}
          {npc.ability_scores.dexterity}
          <span className="text-sm text-gray-600">
            ({calculateModifier(npc.ability_scores.dexterity)})
          </span>
        </div>
        <div className="text-gray-800">
          <span className="font-medium">CON:</span> {npc.ability_scores.con}
          <span className="text-sm text-gray-600">
            ({calculateModifier(npc.ability_scores.con)})
          </span>
        </div>
        <div className="text-gray-800">
          <span className="font-medium">INT:</span>{" "}
          {npc.ability_scores.intellect}
          <span className="text-sm text-gray-600">
            ({calculateModifier(npc.ability_scores.intellect)})
          </span>
        </div>
        <div className="text-gray-800">
          <span className="font-medium">WIS:</span> {npc.ability_scores.wisdom}
          <span className="text-sm text-gray-600">
            ({calculateModifier(npc.ability_scores.wisdom)})
          </span>
        </div>
        <div className="text-gray-800">
          <span className="font-medium">CHA:</span>{" "}
          {npc.ability_scores.charisma}
          <span className="text-sm text-gray-600">
            ({calculateModifier(npc.ability_scores.charisma)})
          </span>
        </div>
      </div>

      <div className="mt-6 border-t-2 border-gray-200 pt-4">
        <h4 className="font-bold text-lg mb-2">Physical Description</h4>
        <div className="space-y-2">
          {npc.physical_description.map((line, index) => (
            <p key={index} className="text-gray-700">
              {line}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-6 border-t-2 border-gray-200 pt-4">
        <h4 className="font-bold text-lg mb-2">Personality & Beliefs</h4>
        <PersonalityTraits traits={npc.personality_traits} />
      </div>
    </div>
  );
};

export default StatBlock;
