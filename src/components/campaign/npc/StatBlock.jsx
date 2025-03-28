import React from "react";
import PersonalityTraits from "./PersonalityTraits";

const StatBlock = ({ npc }) => {
  const calculateModifier = (score) => {
    return Math.floor((score - 10) / 2);
  };

  return (
    <div className="stat-block">
      <div className="stat-block-header">
        <h3 className="stat-block-title">{npc.name}</h3>
        <p className="stat-block-subtitle">
          {npc.race} • {npc.sex} • {npc.alignment} • {npc.occupation}
        </p>
      </div>

      <div className="ability-scores-grid">
        <div className="ability-score">
          <span className="ability-label">STR:</span>{" "}
          {npc.ability_scores.strength}
          <span className="ability-modifier">
            ({calculateModifier(npc.ability_scores.strength)})
          </span>
        </div>
        <div className="ability-score">
          <span className="ability-label">DEX:</span>{" "}
          {npc.ability_scores.dexterity}
          <span className="ability-modifier">
            ({calculateModifier(npc.ability_scores.dexterity)})
          </span>
        </div>
        <div className="ability-score">
          <span className="ability-label">CON:</span> {npc.ability_scores.con}
          <span className="ability-modifier">
            ({calculateModifier(npc.ability_scores.con)})
          </span>
        </div>
        <div className="ability-score">
          <span className="ability-label">INT:</span>{" "}
          {npc.ability_scores.intellect}
          <span className="ability-modifier">
            ({calculateModifier(npc.ability_scores.intellect)})
          </span>
        </div>
        <div className="ability-score">
          <span className="ability-label">WIS:</span>{" "}
          {npc.ability_scores.wisdom}
          <span className="ability-modifier">
            ({calculateModifier(npc.ability_scores.wisdom)})
          </span>
        </div>
        <div className="ability-score">
          <span className="ability-label">CHA:</span>{" "}
          {npc.ability_scores.charisma}
          <span className="ability-modifier">
            ({calculateModifier(npc.ability_scores.charisma)})
          </span>
        </div>
      </div>

      <div className="description-section">
        <h4 className="section-title">Physical Description</h4>
        <div className="description-content">
          {npc.physical_description.map((line, index) => (
            <p key={index} className="description-text">
              {line}
            </p>
          ))}
        </div>
      </div>

      <div className="description-section">
        <h4 className="section-title">Personality & Beliefs</h4>
        <PersonalityTraits traits={npc.personality_traits} />
      </div>
    </div>
  );
};

export default StatBlock;
