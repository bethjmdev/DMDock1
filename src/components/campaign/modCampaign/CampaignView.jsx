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
  onSnapshot,
} from "firebase/firestore";
import "./CampaignView.css";

const CampaignView = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const location = useLocation();
  const [campaignData, setCampaignData] = useState(
    location.state?.campaign || {}
  );
  const date = location.state?.date;

  // Assuming you have userId available in this component
  const userId = "exampleUserId"; // Replace with actual userId logic

  console.log(campaignId);
  console.log("campaign from campaign view", campaignData);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [specificDay, setSpecificDay] = useState("");
  const [year, setYear] = useState("");
  const [monthNames, setMonthNames] = useState([]);
  const [dayNames, setDayNames] = useState([]);
  const [dateValue, setDateValue] = useState(null); // State to hold the date value

  // Add new state for calendar rules
  const [calendarRules, setCalendarRules] = useState(null);

  // Add new state for weather and seasons
  const [currentWeather, setCurrentWeather] = useState(null);
  const [seasonData, setSeasonData] = useState(null);

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
        // Store all calendar rules
        setCalendarRules({
          months: data.months,
          daysInMonth: data.daysInMonth,
          days: data.days, // days in week
          monthNames: data.monthNames,
          dayNames: data.dayNames,
        });
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
    if (campaignData.date) {
      setDateValue(campaignData.date); // Set the dateValue from campaignData.date if it exists
    }
  }, [campaignData.date]);

  // Add this useEffect for real-time updates
  useEffect(() => {
    if (!campaignId) return;

    const campaignRef = doc(db, "Campaign", campaignId);
    const unsubscribe = onSnapshot(campaignRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setCampaignData(data);
        if (data.date) {
          setDateValue(data.date);
        }
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [campaignId]);

  // Add this useEffect to fetch calendar rules when component mounts
  useEffect(() => {
    if (campaignId) {
      fetchDateInfo();
    }
  }, [campaignId]);

  // Add function to fetch season data
  const fetchSeasonData = async () => {
    const q = query(
      collection(db, "Calendar"),
      where("campaignId", "==", campaignId)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data();
      setSeasonData({
        seasonNames: data.seasonNames,
        seasonDates: data.seasonDates,
      });
    }
  };

  // Add this to your existing useEffect that fetches calendar data
  useEffect(() => {
    if (campaignId) {
      fetchDateInfo();
      fetchSeasonData();
    }
  }, [campaignId]);

  // Function to determine which season a date falls into
  const determineSeasonForDate = (monthName, dayNum) => {
    if (!seasonData || !calendarRules) return null;

    const monthIndex = calendarRules.monthNames.indexOf(monthName);
    const daysInMonth = calendarRules.daysInMonth;
    const totalDayNum = monthIndex * daysInMonth + Number(dayNum);

    return seasonData.seasonDates.find((season, index) => {
      const startMonthIndex = calendarRules.monthNames.indexOf(
        season.startMonth
      );
      const endMonthIndex = calendarRules.monthNames.indexOf(season.endMonth);
      const startDayNum =
        startMonthIndex * daysInMonth + Number(season.startDay);
      const endDayNum = endMonthIndex * daysInMonth + Number(season.endDay);

      return totalDayNum >= startDayNum && totalDayNum <= endDayNum;
    });
  };

  // Function to generate weather based on weather pattern
  const generateWeather = (weatherPattern) => {
    // Use exact same temperature ranges
    const tempRanges = {
      cold: {
        extreme: { min: -20, max: 5 },
        normal: { min: 5, max: 35 },
      },
      "moderate-cold": { min: 40, max: 70 },
      "moderate-warm": { min: 40, max: 65 },
      warm: { min: 65, max: 90 },
    };

    // Generate temperature using same logic
    let temp;
    if (weatherPattern === "cold") {
      const isExtremeCold = Math.random() < 0.03;
      const range = isExtremeCold
        ? tempRanges.cold.extreme
        : tempRanges.cold.normal;
      temp = Math.floor(
        Math.random() * (range.max - range.min + 1) + range.min
      );
    } else {
      const range = tempRanges[weatherPattern];
      temp = Math.floor(
        Math.random() * (range.max - range.min + 1) + range.min
      );
    }

    // Generate wind speed with same ranges
    const windSpeed = Math.floor(Math.random() * 30);
    const windStrength =
      windSpeed < 5
        ? "calm"
        : windSpeed < 10
        ? "light breeze"
        : windSpeed < 20
        ? "moderate wind"
        : windSpeed < 30
        ? "strong wind"
        : "gale force";

    // Calculate wind chill for cold weather
    let windChill = null;
    if (weatherPattern === "cold" && windSpeed > 5) {
      windChill = Math.round(
        35.74 +
          0.6215 * temp -
          35.75 * Math.pow(windSpeed, 0.16) +
          0.4275 * temp * Math.pow(windSpeed, 0.16)
      );
    }

    // Calculate heat index for warm weather
    let heatIndex = null;
    if (weatherPattern === "warm" && temp > 80) {
      heatIndex = Math.round(temp + 0.5 * (temp - 80));
    }

    // Generate precipitation with same chances
    const precipChance = Math.floor(Math.random() * 100);
    const hasPrecip = precipChance > 70;
    let precipType = "none";
    let precipAmount = 0;

    if (hasPrecip) {
      if (weatherPattern === "cold" && temp <= 32) {
        precipType = "snow";
        const snowstormRoll = Math.random();
        if (snowstormRoll < 0.005) {
          precipAmount = 60; // 5 feet
        } else if (snowstormRoll < 0.03) {
          precipAmount = 36; // 3 feet
        } else {
          precipAmount = Math.floor(Math.random() * 12) + 1;
        }
      } else if (weatherPattern === "cold" && temp > 32) {
        precipType = "sleet";
        precipAmount = (Math.random() * 0.4 + 0.1).toFixed(1);
      } else {
        precipType = "rain";
        precipAmount = (Math.random() * 1.9 + 0.1).toFixed(1);
      }
    }

    // Cloud coverage
    const cloudCoverage = hasPrecip
      ? Math.floor(Math.random() * 30) + 70
      : Math.floor(Math.random() * 100);

    // Road conditions
    let roadConditions = "clear";
    let whiteout = false;

    if (hasPrecip) {
      if (precipType === "snow") {
        roadConditions = "snow-covered";
        whiteout = Math.random() * 100 < 5;
      } else if (precipType === "sleet") {
        roadConditions = "icy";
      } else {
        roadConditions = "wet";
      }
    }

    // Fog conditions
    const fogChance =
      (weatherPattern === "moderate-cold" ||
        weatherPattern === "moderate-warm") &&
      hasPrecip
        ? 70
        : 30;
    const hasFog = Math.random() * 100 < fogChance;

    // Thunderstorm chance
    const thunderstormChance = weatherPattern === "warm" ? 20 : 5;
    const hasThunderstorm =
      hasPrecip && Math.random() * 100 < thunderstormChance;

    // Visibility
    let visibility = "clear";
    if (hasThunderstorm) {
      visibility = "very poor (100-500 feet)";
    } else if (whiteout) {
      visibility = "zero (whiteout conditions)";
    } else if (hasFog) {
      visibility = "poor (500-1000 feet)";
    } else if (hasPrecip) {
      visibility = "reduced (1000-3000 feet)";
    }

    return {
      temperature: temp,
      wind: { speed: windSpeed, strength: windStrength },
      windChill,
      heatIndex,
      precipitation: {
        chance: precipChance,
        type: precipType,
        amount: precipAmount,
      },
      cloudCoverage,
      roadConditions,
      fog: hasFog,
      whiteout,
      thunderstorm: hasThunderstorm,
      visibility,
    };
  };

  const buttons = [
    { title: "Players", path: `/campaign/${campaignId}/players` },
    { title: "NPCs", path: `/campaign/${campaignId}/npc` },
    { title: "Monsters", path: `/campaign/${campaignId}/monster` },
    { title: "Encounters", path: `/campaign/${campaignId}/encounter` },
    { title: "View Towns", path: `/campaign/${campaignId}/towns` },
    { title: "Notes", path: `/campaign/${campaignId}/notes` },
    { title: "Spell Slot Tracker", path: "/campaign/spell-slots" },

    { title: "NPC Generator", path: `/campaign/${campaignId}/npc-generator` },
    { title: "List of Monsters", path: `/campaign/${campaignId}/monsterslist` },
    {
      title: "Encounter Generator",
      path: `/campaign/${campaignId}/encounter-generator`,
    },
    { title: "Town Generator", path: `/campaign/${campaignId}/town-generator` },

    {
      title: "Change Date",
      path: `/campaign/${campaignId}/date`,
      state: { campaignId, date: dateValue, campaign: campaignData },
    },
    // { title: "Weather Generator", path: `/campaign/${campaignId}/weather` },
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

  // Modify handleNextDay to include weather storage
  const handleNextDay = async () => {
    if (!dateValue || !calendarRules || !seasonData) return;

    // Calculate next day's date
    let currentMonthIndex = calendarRules.monthNames.indexOf(dateValue.month);
    let currentDayIndex = calendarRules.dayNames.indexOf(dateValue.week_day);
    let nextDay = parseInt(dateValue.number_day) + 1;
    let nextMonth = dateValue.month;
    let nextYear = parseInt(dateValue.year);

    // Handle month/year rollover
    if (nextDay > calendarRules.daysInMonth) {
      nextDay = 1;
      currentMonthIndex++;
      if (currentMonthIndex >= calendarRules.monthNames.length) {
        currentMonthIndex = 0;
        nextYear++;
      }
      nextMonth = calendarRules.monthNames[currentMonthIndex];
    }

    // Calculate next day of week
    currentDayIndex = (currentDayIndex + 1) % calendarRules.dayNames.length;

    // Determine season and generate weather for next day
    const nextDaySeason = determineSeasonForDate(nextMonth, nextDay);
    const weatherForNextDay = nextDaySeason
      ? generateWeather(nextDaySeason.weatherPattern)
      : null;

    // Create weather narrative string
    const weatherString = weatherForNextDay
      ? `The weather is ${weatherForNextDay.temperature}°F` +
        `${
          weatherForNextDay.windChill
            ? ` (feels like ${weatherForNextDay.windChill}°F with wind chill)`
            : ""
        }` +
        `${
          weatherForNextDay.heatIndex
            ? ` (feels like ${weatherForNextDay.heatIndex}°F with heat index)`
            : ""
        }` +
        ` with ${weatherForNextDay.wind.strength} winds at ${weatherForNextDay.wind.speed} mph.` +
        `${
          weatherForNextDay.precipitation.type !== "none"
            ? ` There is a ${weatherForNextDay.precipitation.chance}% chance of ${weatherForNextDay.precipitation.type} with expected accumulation of ${weatherForNextDay.precipitation.amount} inches.`
            : " No precipitation is expected."
        }` +
        `${
          weatherForNextDay.cloudCoverage > 80
            ? " The sky is heavily overcast"
            : weatherForNextDay.cloudCoverage > 50
            ? " The sky is partly cloudy"
            : " The sky is mostly clear"
        }` +
        `${weatherForNextDay.fog ? " with fog present" : ""}.` +
        `${
          weatherForNextDay.thunderstorm ? " Thunderstorms are likely." : ""
        }` +
        `${
          weatherForNextDay.whiteout
            ? " Whiteout conditions are in effect."
            : ""
        }` +
        ` Road conditions are ${weatherForNextDay.roadConditions}` +
        ` with ${weatherForNextDay.visibility} visibility.`
      : "";

    // Create new date object
    const newDate = {
      month: nextMonth,
      number_day: nextDay,
      week_day: calendarRules.dayNames[currentDayIndex],
      year: nextYear,
    };

    // Update Firestore with both new date and weather
    const campaignRef = doc(db, "Campaign", campaignId);
    await updateDoc(campaignRef, {
      date: newDate,
      weather: weatherString, // Save the weather string to Firestore
    });

    // Update local state
    setCurrentWeather(weatherForNextDay);
  };

  return (
    <div className="campaign-view-container">
      <div className="campaign-view-content">
        <h1 className="campaign-view-title">
          {campaignData.name || "Campaign Tools"}
          <br />
          <br />
          {campaignData.custom_weather === false ? (
            <button
              className="set-weather-button"
              onClick={() =>
                navigate(`/campaign/${campaignId}/customcalendar`, {
                  state: { campaignId, userId, campaign: campaignData },
                })
              }
            >
              Set your campaign calendar and active weather
            </button>
          ) : null}
          {campaignData.custom_weather === true && !dateValue ? (
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
            <p>
              Today is {dateValue.week_day}, {dateValue.month}{" "}
              {dateValue.number_day}, {dateValue.year}
            </p>
            {calendarRules && (
              <button onClick={handleNextDay} className="next-day-button">
                Next Day →
              </button>
            )}

            <div className="weather-display">
              <p className="weather-narrative">
                {campaignData.weather || "No weather data available"}
              </p>
            </div>
          </div>
        )}

        <div className="campaign-buttons-grid">
          {buttons.map((button) => (
            <button
              key={button.path}
              onClick={() =>
                navigate(button.path, {
                  state: button.state,
                })
              }
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
