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
          where("campaign_id", "==", campaignId),
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
            <div key={monster.id} className="player-card">
              <div className="player-header">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {monster.character_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Monster: {monster.monster_name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">
                    AC: {monster.ac}
                  </p>
                </div>
              </div>
              <div className="player-stats">
                <div className="text-gray-800">
                  <span className="font-medium">STR:</span> {monster.strength}
                </div>
                <div className="text-gray-800">
                  <span className="font-medium">DEX:</span> {monster.dexterity}
                </div>
                <div className="text-gray-800">
                  <span className="font-medium">CON:</span>{" "}
                  {monster.constitution}
                </div>
                <div className="text-gray-800">
                  <span className="font-medium">INT:</span>{" "}
                  {monster.intelligence}
                </div>
                <div className="text-gray-800">
                  <span className="font-medium">WIS:</span> {monster.wisdom}
                </div>
                <div className="text-gray-800">
                  <span className="font-medium">CHA:</span> {monster.charisma}
                </div>
              </div>
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
          ))}
        </div>
      )}
    </div>
  );
};

export default Monster;
