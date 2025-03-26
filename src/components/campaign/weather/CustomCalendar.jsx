import React, { useState } from "react";

const CustomCalendar = () => {
  const [months, setMonths] = useState("");
  const [days, setDays] = useState("");
  const [monthNames, setMonthNames] = useState(Array(12).fill("")); // Default to 12 empty month names

  const handleMonthsChange = (e) => {
    const value =
      e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0); // Allow empty input
    setMonths(value);
    setMonthNames(Array(value).fill("")); // Reset month names array based on the number of months
  };

  const handleDaysChange = (e) => {
    const value =
      e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0); // Allow empty input
    setDays(value);
  };

  const handleMonthNameChange = (index, e) => {
    const newMonthNames = [...monthNames];
    newMonthNames[index] = e.target.value; // Update the specific month name
    setMonthNames(newMonthNames);
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
      {months !== "" && ( // Conditionally render the days input
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
      {days !== "" &&
        months > 0 && ( // Conditionally render month names input
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
      {/* Additional logic to render the custom calendar can be added here */}
    </div>
  );
};

export default CustomCalendar;
