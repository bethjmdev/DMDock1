import React, { useState } from "react";

const CustomCalendar = () => {
  const [months, setMonths] = useState("");
  const [weeks, setWeeks] = useState(""); // New state for weeks
  const [daysInMonth, setDaysInMonth] = useState(""); // New state for days in a month
  const [days, setDays] = useState("");
  const [monthNames, setMonthNames] = useState(Array(12).fill("")); // Default to 12 empty month names
  const [dayNames, setDayNames] = useState(Array(7).fill("")); // Default to 7 empty day names
  const [seasons, setSeasons] = useState(""); // State for number of seasons
  const [seasonNames, setSeasonNames] = useState(Array(4).fill("")); // Default to 4 empty season names
  const [seasonDates, setSeasonDates] = useState([]); // State for season dates

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
      e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0); // Allow empty input
    setSeasons(value); // Update seasons state
    setSeasonNames(Array(value).fill("")); // Reset season names array based on the number of seasons
    setSeasonDates(
      Array.from({ length: value }, () => ({
        startMonth: "",
        startDay: "",
        endMonth: "",
        endDay: "",
      }))
    ); // Reset season dates array
  };

  const handleSeasonNameChange = (index, e) => {
    const newSeasonNames = [...seasonNames];
    newSeasonNames[index] = e.target.value; // Update the specific season name
    setSeasonNames(newSeasonNames);
  };

  const handleSeasonDateChange = (index, field, e) => {
    const newSeasonDates = [...seasonDates];
    newSeasonDates[index][field] = e.target.value; // Update the specific date field for the season
    setSeasonDates(newSeasonDates);
  };

  return (
    <div>
      <h1>Custom Calendar</h1>
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
            <h2>What are the names of the seasons:</h2>
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
                    <input
                      type="text"
                      value={seasonDates[index].startMonth}
                      onChange={(e) =>
                        handleSeasonDateChange(index, "startMonth", e)
                      }
                    />
                  </label>
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
                  <label>
                    End Month:
                    <input
                      type="text"
                      value={seasonDates[index].endMonth}
                      onChange={(e) =>
                        handleSeasonDateChange(index, "endMonth", e)
                      }
                    />
                  </label>
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
      {/* Additional logic to render the custom calendar can be added here */}
    </div>
  );
};

export default CustomCalendar;
