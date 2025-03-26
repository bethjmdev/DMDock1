import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
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

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [monthNames, setMonthNames] = useState([]);

  // Firestore initialization
  const db = getFirestore();

  // Fetch monthNames from Calendar collection when "Select Date" is clicked
  const fetchMonthNames = async () => {
    const q = query(
      collection(db, "Calendar"),
      where("campaignId", "==", campaignId)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Month Names:", data.monthNames);
        setMonthNames(data.monthNames);
      });
    } else {
      console.log("No such document!");
    }
  };

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
                fetchMonthNames(); // Fetch month names when button is clicked
                setShowDatePicker(true);
              }}
            >
              Select Date
            </button>
          ) : null}
        </h1>

        {showDatePicker && (
          <div className="date-picker-modal">
            <h2>Select Date</h2>
            <input
              type="number"
              placeholder="Month (1-12)"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
            <input
              type="number"
              placeholder="Day"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            />
            <input
              type="number"
              placeholder="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
            <button
              onClick={() => {
                console.log(`Selected Date: ${month}/${day}/${year}`);
                setShowDatePicker(false);
              }}
            >
              Submit Date
            </button>
            <button onClick={() => setShowDatePicker(false)}>Cancel</button>
          </div>
        )}

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
