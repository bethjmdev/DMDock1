import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { db } from "../../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./Players.css";

const NPC = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const { currentUser } = useAuth();
  const [NPCs, setNPCs] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log("NPCS", NPCs);
  useEffect(() => {
    const fetchNPCs = async () => {
      try {
        const NPCsRef = collection(db, "NPC");
        const q = query(
          NPCsRef,
          where("campaignId", "==", campaignId),
          where("dm", "==", currentUser.uid)
        );

        const querySnapshot = await getDocs(q);
        const NPCsList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            ability_scores: {
              strength: data.ability_scores?.strength || "0",
              dexterity: data.ability_scores?.dexterity || "0",
              con: data.ability_scores?.con || "0",
              intellect: data.ability_scores?.intellect || "0",
              wisdom: data.ability_scores?.wisdom || "0",
              charisma: data.ability_scores?.charisma || "0",
            },
            personality_traits: Array.isArray(data.personality_traits)
              ? data.personality_traits.join(", ")
              : data.personality_traits || "",
          };
        });

        setNPCs(NPCsList);
      } catch (error) {
        console.error("Error fetching npc's:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNPCs();
  }, [campaignId, currentUser.uid]);

  const handleAddNPC = () => {
    navigate(`/campaign/${campaignId}/npc/add`);
  };

  if (loading) {
    return <h2 className="text-gray-800">Loading NPCSs...</h2>;
  }

  return (
    <div className="players-container">
      <div className="players-header">
        <h2 className="text-2xl font-bold text-gray-800">NPCs</h2>
        <button
          onClick={handleAddNPC}
          className="auth-button text-gray-800"
          style={{ width: "auto", padding: "0.5rem 1rem" }}
        >
          Add NPC
        </button>
      </div>

      {NPCs.length === 0 ? (
        <p className="text-center text-gray-600">
          No NPCs found. Add your first NPC!
        </p>
      ) : (
        <div className="players-grid">
          {NPCs.map((NPC) => (
            <div key={NPC.id} className="player-card">
              <div className="player-header">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {NPC.name}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">
                    Alignment: {NPC.alignment}
                  </p>
                </div>
              </div>

              <div className="players-stats">
                <p className="text-sm text-gray-600">
                  Occupation: {NPC.occupation}
                </p>
                <p className="text-sm text-gray-600">
                  Description: {NPC.description}
                </p>
                <div className="text-gray-800">
                  <span className="font-medium">STR:</span>{" "}
                  {NPC.ability_scores.strength}
                </div>
                <div className="text-gray-800">
                  <span className="font-medium">DEX:</span>{" "}
                  {NPC.ability_scores.dexterity}
                </div>
                <div className="text-gray-800">
                  <span className="font-medium">CON:</span>{" "}
                  {NPC.ability_scores.con}
                </div>
                <div className="text-gray-800">
                  <span className="font-medium">INT:</span>{" "}
                  {NPC.ability_scores.intellect}
                </div>
                <div className="text-gray-800">
                  <span className="font-medium">WIS:</span>{" "}
                  {NPC.ability_scores.wisdom}
                </div>
                <div className="text-gray-800">
                  <span className="font-medium">CHA:</span>{" "}
                  {NPC.ability_scores.charisma}
                </div>
                <p className="text-sm text-gray-600">Notes: {NPC.notes}</p>
              </div>
              <button
                onClick={() =>
                  navigate(`/campaign/${campaignId}/npcs/edit/${NPC.id}`)
                }
                className="edit-button"
              >
                Edit / Add Notes
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NPC;
