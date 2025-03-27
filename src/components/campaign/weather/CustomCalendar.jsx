import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../../firebase"; // Adjust the import based on your Firebase setup
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../auth/AuthContext"; // Import useAuth

const CustomCalendar = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate
  const { currentUser } = useAuth(); // Get the current user
  const dmId = currentUser?.uid; // Set userId to the current user's ID
  const { campaignId, campaign } = location.state || {}; // Keep campaignId and campaign from location.state

  console.log("Received campaign:", campaign); // Log the received campaign object

  const [months, setMonths] = useState("");
  const [weeks, setWeeks] = useState(""); // New state for weeks
  const [daysInMonth, setDaysInMonth] = useState(""); // New state for days in a month
  const [days, setDays] = useState("");
  const [monthNames, setMonthNames] = useState(Array(12).fill("")); // Default to 12 empty month names
  const [dayNames, setDayNames] = useState(Array(7).fill("")); // Default to 7 empty day names
  const [seasons, setSeasons] = useState(""); // State for number of seasons
  const [seasonNames, setSeasonNames] = useState(Array(4).fill("")); // Default to 4 empty season names
  const [seasonDates, setSeasonDates] = useState([]); // State for season dates
  const [isFormValid, setIsFormValid] = useState(false); // State to track form validity
  const [validationError, setValidationError] = useState("");

  // Function to validate calendar math
  const validateCalendarMath = () => {
    if (!months || !weeks || !daysInMonth || !days) return;

    // Round all inputs to nearest whole number
    const roundedMonths = Math.round(Number(months));
    const roundedWeeks = Math.round(Number(weeks));
    const roundedDaysInMonth = Math.round(Number(daysInMonth));
    const roundedDays = Math.round(Number(days));

    const totalDaysMethod1 = roundedMonths * roundedDaysInMonth;
    const totalDaysMethod2 = roundedWeeks * roundedDays;

    // Allow for a difference of up to 2 days
    const tolerance = 2;
    const difference = Math.abs(totalDaysMethod1 - totalDaysMethod2);

    if (difference > tolerance) {
      // Calculate suggestions using rounded numbers
      const suggestedWeeks = Math.round(totalDaysMethod1 / roundedDays);
      const suggestedDaysPerWeek = Math.round(totalDaysMethod1 / roundedWeeks);
      const suggestedDaysPerMonth = Math.round(
        (roundedWeeks * roundedDays) / roundedMonths
      );

      const suggestions = `Here are some ways to make it work:

      Option 1: Keep ${roundedMonths} months and ${roundedDaysInMonth} days per month, but change to:
      - ${suggestedWeeks} weeks with ${roundedDays} days per week
      (Total days: ${suggestedWeeks * roundedDays})

      Option 2: Keep ${roundedMonths} months and ${roundedWeeks} weeks, but change to:
      - ${suggestedDaysPerMonth} days per month with ${roundedDays} days per week
      (Total days: ${roundedMonths * suggestedDaysPerMonth})

      Option 3: Keep ${roundedMonths} months and ${roundedWeeks} weeks, but change to:
      - ${roundedDaysInMonth} days per month with ${suggestedDaysPerWeek} days per week
      (Total days: ${roundedMonths * roundedDaysInMonth})

      Common calendar examples:
      • Standard Earth: 12 months × 30 days ≈ 52 weeks × 7 days = 364 days
      • Fantasy Example: 10 months × 36 days = 60 weeks × 6 days = 360 days
      • Simple Format: 12 months × 30 days = 60 weeks × 6 days = 360 days`;

      setValidationError(
        `Calendar math is off by ${difference} days:
        - ${roundedMonths} months × ${roundedDaysInMonth} days = ${totalDaysMethod1} total days
        - ${roundedWeeks} weeks × ${roundedDays} days = ${totalDaysMethod2} total days

        ${suggestions}`
      );
      setIsFormValid(false);
    } else if (difference > 0) {
      // If within tolerance, show a friendly message but allow submission
      setValidationError(
        `Note: Your calendar has a small difference of ${difference} days, which is fine:
        - ${roundedMonths} months × ${roundedDaysInMonth} days = ${totalDaysMethod1} total days
        - ${roundedWeeks} weeks × ${roundedDays} days = ${totalDaysMethod2} total days
        
        This small difference is acceptable - you can proceed with these numbers.`
      );
      setIsFormValid(true); // Allow submission despite small difference
    } else {
      setValidationError("");
    }
  };

  // Add this new validation function
  const validateSeasonDates = () => {
    if (!seasonDates.length || !daysInMonth) return "";

    const errors = [];
    const roundedDaysInMonth = Math.round(Number(daysInMonth));
    const totalDaysInYear = roundedDaysInMonth * monthNames.length;

    for (let i = 0; i < seasonDates.length; i++) {
      const season = seasonDates[i];
      const seasonName = seasonNames[i] || `Season ${i + 1}`;

      // Skip validation if this season's dates aren't fully filled in yet
      if (
        !season.startMonth ||
        !season.startDay ||
        !season.endMonth ||
        !season.endDay
      ) {
        continue;
      }

      // Convert dates to day numbers for easier comparison
      const startMonthIndex = monthNames.indexOf(season.startMonth);
      const endMonthIndex = monthNames.indexOf(season.endMonth);

      // Only validate if months exist in the calendar
      if (startMonthIndex !== -1 && endMonthIndex !== -1) {
        const startDayNum =
          startMonthIndex * roundedDaysInMonth + Number(season.startDay);
        const endDayNum =
          endMonthIndex * roundedDaysInMonth + Number(season.endDay);

        // Check if days are within valid range
        if (season.startDay > roundedDaysInMonth) {
          errors.push(
            `${seasonName}: Start day ${season.startDay} isn't possible - ${season.startMonth} only has ${roundedDaysInMonth} days`
          );
        }
        if (season.endDay > roundedDaysInMonth) {
          errors.push(
            `${seasonName}: End day ${season.endDay} isn't possible - ${season.endMonth} only has ${roundedDaysInMonth} days`
          );
        }

        // Check for overlaps with other completed seasons
        for (let j = i + 1; j < seasonDates.length; j++) {
          const otherSeason = seasonDates[j];
          const otherSeasonName = seasonNames[j] || `Season ${j + 1}`;

          // Only check if other season is fully filled in
          if (
            !otherSeason.startMonth ||
            !otherSeason.startDay ||
            !otherSeason.endMonth ||
            !otherSeason.endDay
          ) {
            continue;
          }

          const otherStartMonthIndex = monthNames.indexOf(
            otherSeason.startMonth
          );
          const otherEndMonthIndex = monthNames.indexOf(otherSeason.endMonth);

          if (otherStartMonthIndex !== -1 && otherEndMonthIndex !== -1) {
            const otherStartDayNum =
              otherStartMonthIndex * roundedDaysInMonth +
              Number(otherSeason.startDay);
            const otherEndDayNum =
              otherEndMonthIndex * roundedDaysInMonth +
              Number(otherSeason.endDay);

            if (
              !(endDayNum < otherStartDayNum || otherEndDayNum < startDayNum)
            ) {
              errors.push(
                `${seasonName} (${season.startMonth} ${season.startDay} to ${season.endMonth} ${season.endDay}) ` +
                  `overlaps with ${otherSeasonName} (${otherSeason.startMonth} ${otherSeason.startDay} to ${otherSeason.endMonth} ${otherSeason.endDay})`
              );
            }
          }
        }
      }
    }

    return errors.length ? errors.join("\n\n") : "";
  };

  // Modify the checkFormValidity function
  const checkFormValidity = () => {
    // Only validate seasons if all season dates are filled in
    const allSeasonDatesFilled = seasonDates.every(
      (date) => date.startMonth && date.startDay && date.endMonth && date.endDay
    );

    const seasonErrors = allSeasonDatesFilled ? validateSeasonDates() : "";

    const allFieldsFilled =
      months &&
      weeks &&
      daysInMonth &&
      days &&
      seasons &&
      monthNames.every((name) => name) &&
      dayNames.every((name) => name) &&
      seasonNames.every((name) => name) &&
      allSeasonDatesFilled;

    // Combine calendar math validation with season validation
    const combinedError = [validationError, seasonErrors]
      .filter((error) => error)
      .join("\n\n");

    setValidationError(combinedError);

    // Only set form as valid if all fields are filled AND there are no validation errors
    setIsFormValid(allFieldsFilled && !combinedError);
  };

  // Update the useEffect to include seasonDates in dependencies
  React.useEffect(() => {
    validateCalendarMath();
    checkFormValidity();
  }, [
    months,
    weeks,
    daysInMonth,
    days,
    seasons,
    monthNames,
    dayNames,
    seasonNames,
    seasonDates,
  ]);

  // You can now use campaignId and userId as needed
  console.log("Campaign ID:", campaignId);
  console.log("User ID:", dmId);

  const handleMonthsChange = (e) => {
    const value =
      e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0); // Allow empty input
    setMonths(value);
    setMonthNames(Array(value).fill("")); // Reset month names array based on the number of months
  };

  const handleWeeksChange = (e) => {
    const value =
      e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0); // Allow empty input
    setWeeks(value); // Update weeks state
  };

  const handleDaysInMonthChange = (e) => {
    const value =
      e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0); // Allow empty input
    setDaysInMonth(value); // Update days in month state
  };

  const handleDaysChange = (e) => {
    const value =
      e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0); // Allow empty input
    setDays(value);
    setDayNames(Array(value).fill("")); // Reset day names array based on the number of days
  };

  const handleMonthNameChange = (index, e) => {
    const newMonthNames = [...monthNames];
    newMonthNames[index] = e.target.value; // Update the specific month name
    setMonthNames(newMonthNames);
  };

  const handleDayNameChange = (index, e) => {
    const newDayNames = [...dayNames];
    newDayNames[index] = e.target.value; // Update the specific day name
    setDayNames(newDayNames);
  };

  const handleSeasonsChange = (e) => {
    const value =
      e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0);
    setSeasons(value);
    setSeasonNames(Array(value).fill(""));
    setSeasonDates(
      Array.from({ length: value }, () => ({
        startMonth: "",
        startDay: "",
        endMonth: "",
        endDay: "",
      }))
    );
    // Don't call checkFormValidity here - let it be called by the useEffect
  };

  const handleSeasonNameChange = (index, e) => {
    const newSeasonNames = [...seasonNames];
    newSeasonNames[index] = e.target.value; // Update the specific season name
    setSeasonNames(newSeasonNames);
  };

  const handleSeasonDateChange = (index, field, e) => {
    const newSeasonDates = [...seasonDates];
    newSeasonDates[index][field] = e.target.value;
    setSeasonDates(newSeasonDates);
    checkFormValidity(); // Validate whenever a season date changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare data to submit
    const calendarData = {
      campaignId,
      dmId, // Use the authenticated user's ID
      months,
      weeks,
      daysInMonth,
      days,
      monthNames,
      dayNames,
      seasons,
      seasonNames,
      seasonDates,
    };

    try {
      // Submit to Firestore
      const docRef = await addDoc(collection(db, "Calendar"), calendarData);
      console.log("Document written with ID: ", docRef.id);

      // Update the campaign's custom_weather to true
      const campaignRef = doc(db, "Campaign", campaignId); // Update the document where campaignId matches the document ID
      await updateDoc(campaignRef, { custom_weather: true });

      // Show success alert
      alert("Submitted successfully");

      // Navigate to the campaign page
      navigate(`/campaigns`);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <div>
      <h1>Custom Calendar</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            How many months in a year:
            <input
              type="number"
              value={months}
              onChange={handleMonthsChange}
              min="0"
            />
          </label>
        </div>
        {months !== "" && ( // Conditionally render the weeks input
          <div>
            <label>
              How many weeks in a year:
              <input
                type="number"
                value={weeks}
                onChange={handleWeeksChange}
                min="0"
              />
            </label>
          </div>
        )}
        {weeks !== "" && ( // Conditionally render the days in a month input
          <div>
            <label>
              How many days in a month:
              <input
                type="number"
                value={daysInMonth}
                onChange={handleDaysInMonthChange}
                min="0"
              />
            </label>
          </div>
        )}
        {daysInMonth !== "" && ( // Conditionally render the days input
          <div>
            <label>
              How many days in a week:
              <input
                type="number"
                value={days}
                onChange={handleDaysChange}
                min="0"
              />
            </label>
          </div>
        )}
        {days !== "" && ( // Conditionally render seasons input
          <div>
            <label>
              How many seasons are there in a year:
              <input
                type="number"
                value={seasons}
                onChange={handleSeasonsChange}
                min="0"
              />
            </label>
          </div>
        )}
        {seasons !== "" && ( // Conditionally render month names input
          <div>
            <h2>What are the names of the months:</h2>
            {Array.from({ length: months }, (_, index) => (
              <div key={index}>
                <label>
                  Month {index + 1}:
                  <input
                    type="text"
                    value={monthNames[index]}
                    onChange={(e) => handleMonthNameChange(index, e)}
                  />
                </label>
              </div>
            ))}
          </div>
        )}
        {monthNames.every((name) => name) &&
          days > 0 && ( // Conditionally render day names input
            <div>
              <h2>What are the names of the days of the week:</h2>
              {Array.from({ length: days }, (_, index) => (
                <div key={index}>
                  <label>
                    Day {index + 1}:
                    <input
                      type="text"
                      value={dayNames[index]}
                      onChange={(e) => handleDayNameChange(index, e)}
                    />
                  </label>
                </div>
              ))}
            </div>
          )}
        {dayNames.every((name) => name) &&
          seasons > 0 && ( // Conditionally render season names input
            <div>
              <h2>What are the names of the seasons and their dates:</h2>
              {Array.from({ length: seasons }, (_, index) => (
                <div key={index}>
                  <label>
                    Season {index + 1}:
                    <input
                      type="text"
                      value={seasonNames[index]}
                      onChange={(e) => handleSeasonNameChange(index, e)}
                    />
                  </label>
                  <div>
                    <label>
                      Start Month:
                      <select
                        value={seasonDates[index].startMonth}
                        onChange={(e) =>
                          handleSeasonDateChange(index, "startMonth", e)
                        }
                      >
                        <option value="">Select Month</option>
                        {monthNames.map((month, monthIndex) => (
                          <option key={monthIndex} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </label>
                    <br />
                    <label>
                      Start Day:
                      <input
                        type="number"
                        value={seasonDates[index].startDay}
                        onChange={(e) =>
                          handleSeasonDateChange(index, "startDay", e)
                        }
                        min="1" // Assuming days are 1-indexed (1-31)
                        max="31"
                      />
                    </label>
                    <br />
                    <label>
                      End Month:
                      <select
                        value={seasonDates[index].endMonth}
                        onChange={(e) =>
                          handleSeasonDateChange(index, "endMonth", e)
                        }
                      >
                        <option value="">Select Month</option>
                        {monthNames.map((month, monthIndex) => (
                          <option key={monthIndex} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </label>
                    <br />
                    <label>
                      End Day:
                      <input
                        type="number"
                        value={seasonDates[index].endDay}
                        onChange={(e) =>
                          handleSeasonDateChange(index, "endDay", e)
                        }
                        min="1" // Assuming days are 1-indexed (1-31)
                        max="31"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        {validationError && (
          <div
            style={{ color: "red", whiteSpace: "pre-line", margin: "10px 0" }}
          >
            {validationError}
          </div>
        )}
        {isFormValid && ( // Show submit button if the form is valid
          <button type="submit">Submit</button>
        )}
      </form>
      {/* Additional logic to render the custom calendar can be added here */}
    </div>
  );
};

export default CustomCalendar;
