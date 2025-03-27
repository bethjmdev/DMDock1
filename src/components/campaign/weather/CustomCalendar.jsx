import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../../firebase"; // Adjust the import based on your Firebase setup
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../auth/AuthContext"; // Import useAuth

// Add this constant for weather patterns
const WEATHER_PATTERNS = {
  COLD: "cold",
  MODERATE_COLD: "moderate-cold",
  MODERATE_WARM: "moderate-warm",
  WARM: "warm",
};

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
  const [calendarMathValid, setCalendarMathValid] = useState(false);

  // Function to validate calendar math
  const validateCalendarMath = () => {
    // Check if all values are present and non-zero
    if (!months || !weeks || !daysInMonth || !days) {
      setCalendarMathValid(false);
      return false;
    }

    // Convert to numbers and check if any are zero
    const roundedMonths = Math.round(Number(months));
    const roundedWeeks = Math.round(Number(weeks));
    const roundedDaysInMonth = Math.round(Number(daysInMonth));
    const roundedDays = Math.round(Number(days));

    if (
      roundedMonths === 0 ||
      roundedWeeks === 0 ||
      roundedDaysInMonth === 0 ||
      roundedDays === 0
    ) {
      setCalendarMathValid(false);
      return false;
    }

    const totalDaysMethod1 = roundedMonths * roundedDaysInMonth;
    const totalDaysMethod2 = roundedWeeks * roundedDays;

    const tolerance = 2;
    const difference = Math.abs(totalDaysMethod1 - totalDaysMethod2);

    if (difference > tolerance) {
      setCalendarMathValid(false);
      // Calculate mathematically correct suggestions
      const totalDays = totalDaysMethod1; // Use months×days_per_month as base

      // If keeping months, calculate other values that work
      const keepingMonths = {
        months: roundedMonths,
        daysInMonth: roundedDaysInMonth,
        weeks: Math.round(totalDays / roundedDays), // Calculate weeks needed
        daysInWeek: roundedDays,
      };

      // If keeping weeks, calculate other values that work
      const keepingWeeks = {
        months: roundedMonths,
        daysInMonth: Math.round(totalDaysMethod2 / roundedMonths), // Calculate days per month needed
        weeks: roundedWeeks,
        daysInWeek: roundedDays,
      };

      // If keeping days in month, use same calc as keeping months
      const keepingDaysInMonth = {
        months: roundedMonths,
        daysInMonth: roundedDaysInMonth,
        weeks: Math.round(totalDays / roundedDays),
        daysInWeek: roundedDays,
      };

      // If keeping days in week, use same calc as keeping weeks
      const keepingDaysInWeek = {
        months: roundedMonths,
        daysInMonth: Math.round(totalDaysMethod2 / roundedMonths),
        weeks: roundedWeeks,
        daysInWeek: roundedDays,
      };

      const suggestions = `Your current calendar:
      ${roundedMonths} months × ${roundedDaysInMonth} days per month = ${totalDaysMethod1} total days
      ${roundedWeeks} weeks × ${roundedDays} days per week = ${totalDaysMethod2} total days

      Here are ways to make your calendar work:

      If you keep ${roundedMonths} months in a year:
      • ${keepingMonths.months} months in a year
      • ${keepingMonths.weeks} weeks in a year
      • ${keepingMonths.daysInMonth} days in a month
      • ${keepingMonths.daysInWeek} days in a week
      (Total days: ${keepingMonths.months * keepingMonths.daysInMonth})

      If you keep ${roundedWeeks} weeks in a year:
      • ${keepingWeeks.months} months in a year
      • ${keepingWeeks.weeks} weeks in a year
      • ${keepingWeeks.daysInMonth} days in a month
      • ${keepingWeeks.daysInWeek} days in a week
      (Total days: ${keepingWeeks.weeks * keepingWeeks.daysInWeek})

      If you keep ${roundedDaysInMonth} days in a month:
      • ${keepingDaysInMonth.months} months in a year
      • ${keepingDaysInMonth.weeks} weeks in a year
      • ${keepingDaysInMonth.daysInMonth} days in a month
      • ${keepingDaysInMonth.daysInWeek} days in a week
      (Total days: ${
        keepingDaysInMonth.months * keepingDaysInMonth.daysInMonth
      })

      If you keep ${roundedDays} days in a week:
      • ${keepingDaysInWeek.months} months in a year
      • ${keepingDaysInWeek.weeks} weeks in a year
      • ${keepingDaysInWeek.daysInMonth} days in a month
      • ${keepingDaysInWeek.daysInWeek} days in a week
      (Total days: ${keepingDaysInWeek.weeks * keepingDaysInWeek.daysInWeek})

      Common calendar examples:
      • Standard Earth: 12 months × 30 days = 52 weeks × 7 days = 364 days
      • Fantasy Example: 10 months × 36 days = 60 weeks × 6 days = 360 days
      • Simple Format: 12 months × 30 days = 60 weeks × 6 days = 360 days`;

      setValidationError(
        `Calendar math is off by ${difference} days.

        ${suggestions}`
      );
      setIsFormValid(false);
      return false;
    } else {
      // When math is valid, clear the calendar math error
      setCalendarMathValid(true);
      // Only clear validation error if it's a calendar math error
      // (keep any season validation errors)
      if (validationError && validationError.includes("Calendar math")) {
        setValidationError("");
      }
      return true;
    }
  };

  // Add back the season validation
  const validateSeasonDates = () => {
    if (!seasonDates.length || !daysInMonth) return "";

    const errors = [];
    const roundedDaysInMonth = Math.round(Number(daysInMonth));

    // Only validate if all season dates are filled in
    const allSeasonDatesFilled = seasonDates.every(
      (date) =>
        date.startMonth &&
        date.startDay &&
        date.endMonth &&
        date.endDay &&
        date.weatherPattern
    );

    if (!allSeasonDatesFilled) return "";

    for (let i = 0; i < seasonDates.length; i++) {
      const season = seasonDates[i];
      const seasonName = seasonNames[i] || `Season ${i + 1}`;

      // Convert dates to day numbers for easier comparison
      const startMonthIndex = monthNames.indexOf(season.startMonth);
      const endMonthIndex = monthNames.indexOf(season.endMonth);

      // Validate if months exist in the calendar
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

            // Fix overlap detection logic
            if (
              startDayNum <= otherEndDayNum &&
              endDayNum >= otherStartDayNum
            ) {
              // Only add error if there's actually an overlap
              if (
                !(endDayNum < otherStartDayNum || startDayNum > otherEndDayNum)
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
    }

    // Clear any previous error if there are no current errors
    if (errors.length === 0) {
      setValidationError("");
    }

    return errors.length ? errors.join("\n\n") : "";
  };

  // Modify checkFormValidity to handle both validations
  const checkFormValidity = () => {
    // Check calendar math first
    const calendarMathValid = validateCalendarMath();

    // Only check seasons if calendar math is valid
    const allSeasonDatesFilled = seasonDates.every(
      (date) =>
        date.startMonth &&
        date.startDay &&
        date.endMonth &&
        date.endDay &&
        date.weatherPattern
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

    // Only show season errors if calendar math is valid
    setValidationError(calendarMathValid ? seasonErrors : validationError);

    // Form is only valid if all checks pass
    setIsFormValid(allFieldsFilled && !seasonErrors && calendarMathValid);
  };

  // Keep the handleSeasonDateChange to trigger validation
  const handleSeasonDateChange = (index, field, e) => {
    const newSeasonDates = [...seasonDates];
    newSeasonDates[index][field] = e.target.value;
    setSeasonDates(newSeasonDates);
    checkFormValidity(); // This will now check both calendar math and seasons
  };

  // Keep the existing useEffect for overall validation
  React.useEffect(() => {
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
      e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0);
    setMonths(value);
    setMonthNames(Array(value).fill(""));
    validateCalendarMath();
  };

  const handleWeeksChange = (e) => {
    const value =
      e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0);
    setWeeks(value);
    validateCalendarMath();
  };

  const handleDaysInMonthChange = (e) => {
    const value =
      e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0);
    setDaysInMonth(value);
    validateCalendarMath();
  };

  const handleDaysChange = (e) => {
    const value =
      e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0);
    setDays(value);
    setDayNames(Array(value).fill(""));
  };

  // Add this new useEffect specifically for calendar math validation
  React.useEffect(() => {
    // Only validate if all calendar values are present and non-zero
    if (months && weeks && daysInMonth && days) {
      validateCalendarMath();
    }
  }, [months, weeks, daysInMonth, days]); // Dependencies are all calendar-related values

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
        weatherPattern: "", // Add weather pattern field
      }))
    );
  };

  const handleSeasonNameChange = (index, e) => {
    const newSeasonNames = [...seasonNames];
    newSeasonNames[index] = e.target.value; // Update the specific season name
    setSeasonNames(newSeasonNames);
  };

  const handleWeatherPatternChange = (index, e) => {
    const newSeasonDates = [...seasonDates];
    newSeasonDates[index] = {
      ...newSeasonDates[index],
      weatherPattern: e.target.value,
    };
    setSeasonDates(newSeasonDates);
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
        {months !== "" && (
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
        {weeks !== "" && (
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
        {daysInMonth !== "" && (
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
        {/* Only show seasons input if calendar math is valid */}
        {days !== "" && calendarMathValid && (
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
        {/* Only show subsequent sections if calendar math is valid */}
        {calendarMathValid && seasons !== "" && (
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
        {calendarMathValid && monthNames.every((name) => name) && days > 0 && (
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
        {calendarMathValid && dayNames.every((name) => name) && seasons > 0 && (
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
                    Weather Pattern:
                    <select
                      value={seasonDates[index]?.weatherPattern || ""}
                      onChange={(e) => handleWeatherPatternChange(index, e)}
                    >
                      <option value="">Select Weather Pattern</option>
                      <option value={WEATHER_PATTERNS.COLD}>
                        Cold (like winter)
                      </option>
                      <option value={WEATHER_PATTERNS.MODERATE_COLD}>
                        Moderate Cold (like fall)
                      </option>
                      <option value={WEATHER_PATTERNS.MODERATE_WARM}>
                        Moderate Warm (like spring)
                      </option>
                      <option value={WEATHER_PATTERNS.WARM}>
                        Warm (like summer)
                      </option>
                    </select>
                  </label>
                </div>
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
