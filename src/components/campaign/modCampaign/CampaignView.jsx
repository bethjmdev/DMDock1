import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
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
  const [specificDay, setSpecificDay] = useState("");
  const [year, setYear] = useState("");
  const [monthNames, setMonthNames] = useState([]);
  const [dayNames, setDayNames] = useState([]);
  const [dateValue, setDateValue] = useState(null); // State to hold the date value

  // Firestore initialization
  const db = getFirestore();

  // Fetch monthNames and dayNames from Calendar collection when "Select Date" is clicked
  const fetchDateInfo = async () => {
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
        console.log("Day Names:", data.dayNames);
        setDayNames(data.dayNames);
      });
    } else {
      console.log("No such document!");
    }
  };

  const fetchDateValue = async () => {
    const campaignRef = doc(db, "Campaign", campaignId); // Use the correct collection name
    const docSnap = await getDoc(campaignRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("Fetched Date:", data.date); // Log the fetched date
      setDateValue(data.date); // Update the state with the new date value
    } else {
      console.log("No such document!");
    }
  };

  // Set the date value from the campaign object when the component mounts
  useEffect(() => {
    if (campaign.date) {
      setDateValue(campaign.date); // Set the dateValue from campaign.date if it exists
    }
  }, [campaign.date]);

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

  const handleSubmitDate = async () => {
    const dateObject = {
      month: month,
      number_day: specificDay,
      week_day: day,
      year: year,
    };

    const campaignRef = doc(db, "Campaign", campaignId); // Use the correct collection name

    const docSnap = await getDoc(campaignRef);
    console.log("Campaign Reference:", campaignRef.path);
    console.log("Document Exists:", docSnap.exists());

    if (!docSnap.exists()) {
      console.log("No such document!");
      return;
    }

    // Update the date field in the Campaign document
    await updateDoc(campaignRef, {
      date: dateObject,
    });

    console.log(`Date saved:`, dateObject);

    // Repull only the date value
    await fetchDateValue(); // Call the function to fetch the updated date value

    setShowDatePicker(false);
  };

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
          {campaign.custom_weather === true && !dateValue ? (
            <button
              className="select-date-button"
              onClick={() => {
                fetchDateInfo();
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
            <select value={month} onChange={(e) => setMonth(e.target.value)}>
              <option value="" disabled>
                Select Month
              </option>
              {monthNames.map((name, index) => (
                <option key={index} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <select value={day} onChange={(e) => setDay(e.target.value)}>
              <option value="" disabled>
                Select Day of Week
              </option>
              {dayNames.map((name, index) => (
                <option key={index} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Specific Day Number"
              value={specificDay}
              onChange={(e) => setSpecificDay(e.target.value)}
            />
            <input
              type="number"
              placeholder="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
            <button onClick={handleSubmitDate}>Submit Date</button>
            <button onClick={() => setShowDatePicker(false)}>Cancel</button>
          </div>
        )}

        {dateValue && (
          <div className="date-display">
            <h2>Current Date:</h2>
            <p>Month: {dateValue.month}</p>
            <p>Number Day: {dateValue.number_day}</p>
            <p>Week Day: {dateValue.week_day}</p>
            <p>Year: {dateValue.year}</p>
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
