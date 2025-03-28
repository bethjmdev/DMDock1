import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./MonsterList.css";
import "./Players.css";

const CACHE_KEY = "dnd_monsters_cache";
const CACHE_DURATION = 14 * 24 * 60 * 60 * 1000; // 2 weeks in milliseconds

const MonsterList = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [monsters, setMonsters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(() => {
    const location = window.location;
    return location.state?.previousPage || 1;
  });
  const monstersPerPage = 12;

  useEffect(() => {
    const fetchMonsters = async () => {
      try {
        // Check localStorage for cached data
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          const isExpired = Date.now() - timestamp > CACHE_DURATION;

          if (!isExpired) {
            setMonsters(data);
            setLoading(false);
            return;
          }
        }

        // If no cache or expired, fetch from API
        const response = await axios.get(
          "https://www.dnd5eapi.co/api/monsters"
        );
        const monsterPromises = response.data.results.map(async (monster) => {
          const monsterResponse = await axios.get(
            `https://www.dnd5eapi.co${monster.url}`
          );
          return monsterResponse.data;
        });
        const monsterData = await Promise.all(monsterPromises);

        // Store in localStorage with timestamp
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: monsterData,
            timestamp: Date.now(),
          })
        );

        setMonsters(monsterData);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch monsters");
        setLoading(false);
      }
    };

    fetchMonsters();
  }, []);

  const indexOfLastMonster = currentPage * monstersPerPage;
  const indexOfFirstMonster = indexOfLastMonster - monstersPerPage;
  const currentMonsters = monsters.slice(
    indexOfFirstMonster,
    indexOfLastMonster
  );

  const totalPages = Math.ceil(monsters.length / monstersPerPage);

  const handleMonsterClick = (monsterIndex) => {
    navigate(`/campaign/${campaignId}/monsters/${monsterIndex}`, {
      state: { previousPage: currentPage },
    });
  };

  return (
    <div className="players-container">
      <div className="players-header">
        <h2 className="monster-title">List of Monsters</h2>
      </div>

      {loading ? (
        <h2 className="loading-text">Loading Monsters...</h2>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="players-grid">
            {currentMonsters.map((monster) => (
              <div
                key={monster.index}
                className="player-card monster-card"
                onClick={() => handleMonsterClick(monster.index)}
              >
                <div className="player-header">
                  <div>
                    <h3 className="monster-name">{monster.name}</h3>
                    <p className="monster-type">
                      {monster.size} {monster.type}
                    </p>
                  </div>
                  <div className="monster-cr">
                    <p>CR: {monster.challenge_rating}</p>
                  </div>
                </div>
                <div className="player-stats">
                  <div className="stat-item">
                    <span className="stat-label">STR:</span> {monster.strength}
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">DEX:</span> {monster.dexterity}
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">CON:</span>{" "}
                    {monster.constitution}
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">INT:</span>{" "}
                    {monster.intelligence}
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">WIS:</span> {monster.wisdom}
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">CHA:</span> {monster.charisma}
                  </div>
                </div>
                <div className="monster-footer">
                  <span className="stat-label">HP:</span> {monster.hit_points}
                  <span className="stat-label stat-spacer">AC:</span>{" "}
                  {monster.armor_class[0].value}
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MonsterList;
