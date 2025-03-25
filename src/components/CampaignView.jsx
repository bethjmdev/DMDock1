import React from "react";
import { useNavigate } from "react-router-dom";
import "./CampaignControl.css";

const CampaignView = () => {
  const navigate = useNavigate();

  const buttons = [
    { title: "Players", path: "/campaign/players" },
    { title: "NPC", path: "/campaign/npc" },
    { title: "Weather Generator", path: "/campaign/weather" },
    { title: "Encounter Generator", path: "/campaign/encounter" },
    { title: "Town Generator", path: "/campaign/town" },
    { title: "NPC Generator", path: "/campaign/npc-generator" },
    { title: "Spell Slot Tracker", path: "/campaign/spell-slots" },
    { title: "Date Tracker", path: "/campaign/date" },
    { title: "Encounter", path: "/campaign/encounter-list" },
    { title: "List of Monsters", path: "/campaign/monsters" },
    { title: "Notes", path: "/campaign/notes" },
  ];

  return (
    <div className="p-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')]">
      <h1 className="text-3xl font-bold mb-8 text-center">Campaign Tools</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {buttons.map((button) => (
          <button
            key={button.path}
            onClick={() => navigate(button.path)}
            className="campaign-button"
          >
            {button.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CampaignView;
