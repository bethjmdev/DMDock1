import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./CampaignView.css";

const CampaignView = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const location = useLocation();
  const campaign = location.state?.campaign;
  const date = location.state?.date;

  // Assuming you have userId available in this component
  const userId = "exampleUserId"; // Replace with actual userId logic

  console.log(campaignId);
  console.log("campaign from campaign view", campaign);

  const buttons = [
    { title: "Players", path: `/campaign/${campaignId}/players` },
    { title: "NPC", path: `/campaign/${campaignId}/npc` },
    { title: "Monster", path: `/campaign/${campaignId}/monster` },
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
        <h1 className="campaign-view-title">
          {campaign.name || "Campaign Tools"}
          <br />
          <br />
          {campaign.custom_weather === false ? (
            <button
              className="set-weather-button"
              onClick={() =>
                navigate(`/campaign/${campaignId}/customcalendar`, {
                  state: { campaignId, userId, campaign },
                })
              }
            >
              Set your campaign calendar and active weather
            </button>
          ) : null}
          {campaign.custom_weather === true && campaign.date === null ? (
            <button
              className="select-date-button"
              onClick={() => {
                // Add your navigation logic here
                navigate(`/campaign/${campaignId}/select-date`, {
                  state: { campaignId, userId, campaign },
                });
              }}
            >
              Select Date
            </button>
          ) : null}
        </h1>
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
