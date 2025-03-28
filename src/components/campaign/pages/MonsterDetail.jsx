import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

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

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!monster) return <div className="p-4">Monster not found</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{monster.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Size:</span> {monster.size}
            </p>
            <p>
              <span className="font-medium">Type:</span> {monster.type}
            </p>
            <p>
              <span className="font-medium">Alignment:</span>{" "}
              {monster.alignment}
            </p>
            <p>
              <span className="font-medium">Challenge Rating:</span>{" "}
              {monster.challenge_rating} (XP: {monster.xp})
            </p>
            <p>
              <span className="font-medium">Armor Class:</span>{" "}
              {monster.armor_class[0].value} ({monster.armor_class[0].type})
            </p>
            <p>
              <span className="font-medium">Hit Points:</span>{" "}
              {monster.hit_points} ({monster.hit_points_roll})
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Abilities</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">STR:</span> {monster.strength}
            </div>
            <div>
              <span className="font-medium">DEX:</span> {monster.dexterity}
            </div>
            <div>
              <span className="font-medium">CON:</span> {monster.constitution}
            </div>
            <div>
              <span className="font-medium">INT:</span> {monster.intelligence}
            </div>
            <div>
              <span className="font-medium">WIS:</span> {monster.wisdom}
            </div>
            <div>
              <span className="font-medium">CHA:</span> {monster.charisma}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Special Abilities</h2>
          <div className="space-y-4">
            {monster.special_abilities.map((ability, index) => (
              <div key={index}>
                <h3 className="font-medium">{ability.name}</h3>
                <p className="text-gray-600">{ability.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-4">
            {monster.actions.map((action, index) => (
              <div key={index}>
                <h3 className="font-medium">{action.name}</h3>
                <p className="text-gray-600">{action.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {monster.legendary_actions && (
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Legendary Actions</h2>
            <div className="space-y-4">
              {monster.legendary_actions.map((action, index) => (
                <div key={index}>
                  <h3 className="font-medium">{action.name}</h3>
                  <p className="text-gray-600">{action.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonsterDetail;
