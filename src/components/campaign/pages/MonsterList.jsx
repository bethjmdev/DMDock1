import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const MonsterList = () => {
  const navigate = useNavigate();
  const [monsters, setMonsters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const monstersPerPage = 12;

  useEffect(() => {
    const fetchMonsters = async () => {
      try {
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
    navigate(`/monsters/${monsterIndex}`);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">List of Monsters</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentMonsters.map((monster) => (
          <div
            key={monster.index}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleMonsterClick(monster.index)}
          >
            <h2 className="text-xl font-semibold mb-2 text-blue-600 hover:text-blue-800">
              {monster.name}
            </h2>
            <div className="space-y-1 text-gray-600">
              <p>
                <span className="font-medium">Size:</span> {monster.size}
              </p>
              <p>
                <span className="font-medium">Type:</span> {monster.type}
              </p>
              <p>
                <span className="font-medium">CR:</span>{" "}
                {monster.challenge_rating}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center space-x-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default MonsterList;
