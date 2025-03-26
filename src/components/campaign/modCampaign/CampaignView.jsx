import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./CampaignView.css";

const CampaignView = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const location = useLocation();
  const title = location.state?.title;

  console.log(campaignId);
  console.log(title);

  const buttons = [
    { title: "Players", path: `/campaign/${campaignId}/players` },
    { title: "NPC", path: `/campaign/${campaignId}/npc` },
    { title: "Monster", path: `/campaign/${campaignId}/monster` },

    // { title: "Weather Generator", path: "/campaign/weather" },
    { title: "Encounter Generator", path: "/campaign/encounter" },
    { title: "Town Generator", path: "/campaign/town" },
    { title: "NPC Generator", path: "/campaign/npc-generator" },
    { title: "Spell Slot Tracker", path: "/campaign/spell-slots" },
    { title: "See Calendar", path: "/campaign/date" },
    { title: "Encounter", path: "/campaign/encounter-list" },
    { title: "List of Monsters", path: "/campaign/monsters" },
    { title: "Notes", path: "/campaign/notes" },
  ];

  return (
    <div className="campaign-view-container">
      <div className="campaign-view-content">
        <h1 className="campaign-view-title">{title || "Campaign Tools"}</h1>
        <div className="campaign-buttons-grid">
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
    </div>
  );
};

export default CampaignView;
