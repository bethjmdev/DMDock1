import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
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

const DateTracker = () => {
  const { campaignId } = useParams();
  const location = useLocation();
  const currentDate = location.state?.date;
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [specificDay, setSpecificDay] = useState("");
  const [year, setYear] = useState("");
  const [monthNames, setMonthNames] = useState([]);
  const [dayNames, setDayNames] = useState([]);

  const db = getFirestore();

  // Fetch monthNames and dayNames from Calendar collection
  const fetchDateInfo = async () => {
    const q = query(
      collection(db, "Calendar"),
      where("campaignId", "==", campaignId)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        setMonthNames(data.monthNames);
        setDayNames(data.dayNames);
      });
    }
  };

  const handleSubmitDate = async () => {
    const dateObject = {
      month: month,
      number_day: specificDay,
      week_day: day,
      year: year,
    };

    const campaignRef = doc(db, "Campaign", campaignId);
    const docSnap = await getDoc(campaignRef);

    if (!docSnap.exists()) {
      console.log("No such document!");
      return;
    }

    try {
      // Update the date field in the Campaign document
      await updateDoc(campaignRef, {
        date: dateObject,
      });

      // Show success alert
      alert(
        `Date successfully updated to ${day}, ${month} ${specificDay}, ${year}`
      );
    } catch (error) {
      // Show error alert if update fails
      alert("Failed to update date. Please try again.");
      console.error("Error updating date:", error);
    }
  };

  // Add this useEffect to fetch date info when component mounts
  useEffect(() => {
    if (currentDate) {
      setMonth(currentDate.month || "");
      setDay(currentDate.week_day || "");
      setSpecificDay(currentDate.number_day || "");
      setYear(currentDate.year || "");
    }
    fetchDateInfo(); // Fetch the calendar info when component mounts
  }, [currentDate]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Date Tracker</h1>

      <div className="mt-4 p-4 border rounded">
        <h2 className="text-xl mb-4">Update Campaign Date</h2>
        <div className="space-y-4">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="" disabled>
              Select Month
            </option>
            {monthNames.map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-full p-2 border rounded"
          >
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
            className="w-full p-2 border rounded"
          />

          <input
            type="number"
            placeholder="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full p-2 border rounded"
          />

          <div className="space-x-2">
            <button
              onClick={handleSubmitDate}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Update Date
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateTracker;
