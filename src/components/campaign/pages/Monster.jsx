import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { db } from "../../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./Players.css";

const Monster = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const { currentUser } = useAuth();
  const [monsters, setMonsters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonsters = async () => {
      try {
        const monstersRef = collection(db, "Monsters");
        const q = query(
          monstersRef,
          where("campaignId", "==", campaignId),
          where("dm", "==", currentUser.uid)
        );

        const querySnapshot = await getDocs(q);
        const monstersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMonsters(monstersList);
      } catch (error) {
        console.error("Error fetching monsters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonsters();
  }, [campaignId, currentUser.uid]);

  const handleAddMonster = () => {
    navigate(`/campaign/${campaignId}/monster/add`);
  };

  if (loading) {
    return <h2 className="text-gray-800">Loading Monsters...</h2>;
  }

  return (
    <div className="players-container">
      <div className="players-header">
        <h2 className="text-2xl font-bold text-gray-800">Monsters</h2>
        <button
          onClick={handleAddMonster}
          className="auth-button text-gray-800"
          style={{ width: "auto", padding: "0.5rem 1rem" }}
        >
          Add Monster
        </button>
      </div>

      {monsters.length === 0 ? (
        <p className="text-center text-gray-600">
          No monsters found. Add your first monster!
        </p>
      ) : (
        <div className="players-grid">
          {monsters.map((monster) => (
            <div key={monster.id} className="monster-card">
              <div className="monster-header">
                <h3 className="monster-name">{monster.name}</h3>
                <p className="monster-meta">
                  {monster.size} {monster.type}, {monster.alignment}
                </p>
              </div>

              <div className="monster-stats">
                <div className="stat-row">
                  <span>AC: {monster.armor_class?.[0]?.value}</span>
                  <span>HP: {monster.hit_points}</span>
                  <span>CR: {monster.challenge_rating}</span>
                </div>

                <div className="ability-scores">
                  <div className="ability">
                    <span>STR</span>
                    <span>{monster.strength}</span>
                  </div>
                  <div className="ability">
                    <span>DEX</span>
                    <span>{monster.dexterity}</span>
                  </div>
                  <div className="ability">
                    <span>CON</span>
                    <span>{monster.constitution}</span>
                  </div>
                  <div className="ability">
                    <span>INT</span>
                    <span>{monster.intelligence}</span>
                  </div>
                  <div className="ability">
                    <span>WIS</span>
                    <span>{monster.wisdom}</span>
                  </div>
                  <div className="ability">
                    <span>CHA</span>
                    <span>{monster.charisma}</span>
                  </div>
                </div>

                {monster.special_abilities && (
                  <div className="special-abilities">
                    <h4>Special Abilities</h4>
                    {monster.special_abilities.map((ability, index) => (
                      <p key={index}>{ability.name}</p>
                    ))}
                  </div>
                )}
              </div>

              <div className="monster-actions">
                <button
                  onClick={() =>
                    navigate(
                      `/campaign/${campaignId}/monsters/${monster.index}`
                    )
                  }
                  className="view-details-button"
                >
                  View Full Details
                </button>
                <button
                  onClick={() =>
                    navigate(
                      `/campaign/${campaignId}/monsters/edit/${monster.id}`
                    )
                  }
                  className="edit-button"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Monster;
