import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./Players.css";

const Players = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const { currentUser } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const playersRef = collection(db, "Players");
        const q = query(
          playersRef,
          where("campaign_id", "==", campaignId),
          where("dm", "==", currentUser.uid)
        );

        const querySnapshot = await getDocs(q);
        const playersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPlayers(playersList);
      } catch (error) {
        console.error("Error fetching players:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [campaignId, currentUser.uid]);

  const handleAddPlayer = () => {
    navigate(`/campaigns/${campaignId}/players/add`);
  };

  if (loading) {
    return <h2 className="text-gray-800">Loading Players...</h2>;
  }

  return (
    <div className="players-container">
      <div className="players-header">
        <h2 className="text-2xl font-bold text-gray-800">Players</h2>
        <button
          onClick={handleAddPlayer}
          className="auth-button text-gray-800"
          style={{ width: "auto", padding: "0.5rem 1rem" }}
        >
          Add Player
        </button>
      </div>

      {players.length === 0 ? (
        <p className="text-center text-gray-600">
          No players found. Add your first player!
        </p>
      ) : (
        <div className="players-grid">
          {players.map((player) => (
            <div key={player.id} className="player-card">
              <div className="player-header">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {player.character_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Player: {player.player_name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">
                    AC: {player.ac}
                  </p>
                </div>
              </div>
              <div className="player-stats">
                <div className="text-gray-800">
                  <span className="font-medium">STR:</span> {player.strength}
                </div>
                <div className="text-gray-800">
                  <span className="font-medium">DEX:</span> {player.dexterity}
                </div>
                <div className="text-gray-800">
                  <span className="font-medium">CON:</span>{" "}
                  {player.constitution}
                </div>
                <div className="text-gray-800">
                  <span className="font-medium">INT:</span>{" "}
                  {player.intelligence}
                </div>
                <div className="text-gray-800">
                  <span className="font-medium">WIS:</span> {player.wisdom}
                </div>
                <div className="text-gray-800">
                  <span className="font-medium">CHA:</span> {player.charisma}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Players;
