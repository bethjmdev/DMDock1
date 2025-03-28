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

      <div className="grid grid-cols-2 gap-4">
        <div className="ability-score">
          <h4 className="font-bold">STR</h4>
          <p className="text-lg">{npc.ability_scores.strength}</p>
          <p className="text-sm text-gray-600">
            ({calculateModifier(npc.ability_scores.strength)})
          </p>
        </div>
        <div className="ability-score">
          <h4 className="font-bold">DEX</h4>
          <p className="text-lg">{npc.ability_scores.dexterity}</p>
          <p className="text-sm text-gray-600">
            ({calculateModifier(npc.ability_scores.dexterity)})
          </p>
        </div>
        <div className="ability-score">
          <h4 className="font-bold">CON</h4>
          <p className="text-lg">{npc.ability_scores.con}</p>
          <p className="text-sm text-gray-600">
            ({calculateModifier(npc.ability_scores.con)})
          </p>
        </div>
        <div className="ability-score">
          <h4 className="font-bold">INT</h4>
          <p className="text-lg">{npc.ability_scores.intellect}</p>
          <p className="text-sm text-gray-600">
            ({calculateModifier(npc.ability_scores.intellect)})
          </p>
        </div>
        <div className="ability-score">
          <h4 className="font-bold">WIS</h4>
          <p className="text-lg">{npc.ability_scores.wisdom}</p>
          <p className="text-sm text-gray-600">
            ({calculateModifier(npc.ability_scores.wisdom)})
          </p>
        </div>
        <div className="ability-score">
          <h4 className="font-bold">CHA</h4>
          <p className="text-lg">{npc.ability_scores.charisma}</p>
          <p className="text-sm text-gray-600">
            ({calculateModifier(npc.ability_scores.charisma)})
          </p>
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
