import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./MonsterDetail.css";

const MonsterDetail = () => {
  const { monsterId } = useParams();
  const [monster, setMonster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMonsterDetails = async () => {
      try {
        const response = await axios.get(
          `https://www.dnd5eapi.co/api/monsters/${monsterId}`
        );
        setMonster(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch monster details");
        setLoading(false);
      }
    };

    fetchMonsterDetails();
  }, [monsterId]);

  if (loading)
    return <div className="monster-detail-container">Loading...</div>;
  if (error)
    return (
      <div className="monster-detail-container error-message">{error}</div>
    );
  if (!monster)
    return <div className="monster-detail-container">Monster not found</div>;

  return (
    <div className="monster-detail-container">
      <div className="monster-detail-content">
        <div className="monster-detail-header">
          <h1 className="monster-detail-title">{monster.name}</h1>
        </div>

        <div className="stat-grid">
          <div className="stat-block">
            <h2 className="stat-block-title">Basic Information</h2>
            <div className="stat-list">
              <div className="stat-item">
                <span className="stat-label">Size:</span> {monster.size}
              </div>
              <div className="stat-item">
                <span className="stat-label">Type:</span> {monster.type}
              </div>
              <div className="stat-item">
                <span className="stat-label">Alignment:</span>{" "}
                {monster.alignment}
              </div>
              <div className="stat-item">
                <span className="stat-label">Challenge Rating:</span>{" "}
                {monster.challenge_rating} (XP: {monster.xp})
              </div>
              <div className="stat-item">
                <span className="stat-label">Armor Class:</span>{" "}
                {monster.armor_class[0].value} ({monster.armor_class[0].type})
              </div>
              <div className="stat-item">
                <span className="stat-label">Hit Points:</span>{" "}
                {monster.hit_points} ({monster.hit_points_roll})
              </div>
              <div className="stat-item">
                <span className="stat-label">Speed:</span>{" "}
                {Object.entries(monster.speed)
                  .map(([type, value]) => `${type}: ${value}`)
                  .join(", ")}
              </div>
              <div className="stat-item">
                <span className="stat-label">Languages:</span>{" "}
                {monster.languages}
              </div>
            </div>
          </div>

          <div className="stat-block">
            <h2 className="stat-block-title">Abilities</h2>
            <div className="ability-grid">
              <div className="stat-item">
                <span className="stat-label">STR:</span> {monster.strength}
              </div>
              <div className="stat-item">
                <span className="stat-label">DEX:</span> {monster.dexterity}
              </div>
              <div className="stat-item">
                <span className="stat-label">CON:</span> {monster.constitution}
              </div>
              <div className="stat-item">
                <span className="stat-label">INT:</span> {monster.intelligence}
              </div>
              <div className="stat-item">
                <span className="stat-label">WIS:</span> {monster.wisdom}
              </div>
              <div className="stat-item">
                <span className="stat-label">CHA:</span> {monster.charisma}
              </div>
            </div>
          </div>

          <div className="stat-block">
            <h2 className="stat-block-title">Proficiencies</h2>
            <div className="stat-list">
              {monster.proficiencies.map((prof, index) => (
                <div key={index} className="stat-item">
                  <span className="stat-label">{prof.proficiency.name}:</span> +
                  {prof.value}
                </div>
              ))}
            </div>
          </div>

          <div className="stat-block">
            <h2 className="stat-block-title">Senses & Resistances</h2>
            <div className="stat-list">
              <div className="stat-item">
                <span className="stat-label">Senses:</span>{" "}
                {Object.entries(monster.senses)
                  .map(([sense, value]) => `${sense}: ${value}`)
                  .join(", ")}
              </div>
              {monster.damage_vulnerabilities.length > 0 && (
                <div className="stat-item">
                  <span className="stat-label">Damage Vulnerabilities:</span>{" "}
                  {monster.damage_vulnerabilities.join(", ")}
                </div>
              )}
              {monster.damage_resistances.length > 0 && (
                <div className="stat-item">
                  <span className="stat-label">Damage Resistances:</span>{" "}
                  {monster.damage_resistances.join(", ")}
                </div>
              )}
              {monster.damage_immunities.length > 0 && (
                <div className="stat-item">
                  <span className="stat-label">Damage Immunities:</span>{" "}
                  {monster.damage_immunities.join(", ")}
                </div>
              )}
              {monster.condition_immunities.length > 0 && (
                <div className="stat-item">
                  <span className="stat-label">Condition Immunities:</span>{" "}
                  {monster.condition_immunities.join(", ")}
                </div>
              )}
            </div>
          </div>

          <div className="stat-block">
            <h2 className="stat-block-title">Special Abilities</h2>
            <div className="stat-list">
              {monster.special_abilities.map((ability, index) => (
                <div key={index} className="ability-block">
                  <h3 className="ability-name">{ability.name}</h3>
                  <p className="ability-description">{ability.desc}</p>
                  {ability.dc && (
                    <p className="ability-dc">
                      DC: {ability.dc.dc_value} ({ability.dc.dc_type.name})
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="stat-block">
            <h2 className="stat-block-title">Actions</h2>
            <div className="stat-list">
              {monster.actions.map((action, index) => (
                <div key={index} className="ability-block">
                  <h3 className="ability-name">{action.name}</h3>
                  <p className="ability-description">{action.desc}</p>
                  {action.attack_bonus && (
                    <p className="ability-attack">
                      Attack Bonus: +{action.attack_bonus}
                    </p>
                  )}
                  {action.dc && (
                    <p className="ability-dc">
                      DC: {action.dc.dc_value} ({action.dc.dc_type.name})
                    </p>
                  )}
                  {action.damage && (
                    <p className="ability-damage">
                      Damage:{" "}
                      {action.damage
                        .map((d) => `${d.damage_dice} ${d.damage_type.name}`)
                        .join(", ")}
                    </p>
                  )}
                  {action.usage && (
                    <p className="ability-usage">
                      Usage: {action.usage.times} times {action.usage.type}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {monster.legendary_actions && (
            <div className="stat-block legendary-actions">
              <h2 className="stat-block-title">Legendary Actions</h2>
              <div className="stat-list">
                {monster.legendary_actions.map((action, index) => (
                  <div key={index} className="ability-block">
                    <h3 className="ability-name">{action.name}</h3>
                    <p className="ability-description">{action.desc}</p>
                    {action.attack_bonus && (
                      <p className="ability-attack">
                        Attack Bonus: +{action.attack_bonus}
                      </p>
                    )}
                    {action.damage && (
                      <p className="ability-damage">
                        Damage:{" "}
                        {action.damage
                          .map((d) => `${d.damage_dice} ${d.damage_type.name}`)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonsterDetail;
