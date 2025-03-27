import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { db } from "../../../firebase";
import { collection, addDoc } from "firebase/firestore";
import "../../CampaignControl.css";

const NewCampaign = () => {
  const [campaignName, setCampaignName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!campaignName.trim()) {
        setError("Campaign name is required");
        return;
      }

      if (!currentUser) {
        setError("You must be signed in to create a campaign");
        return;
      }

      const campaignData = {
        name: campaignName,
        dmId: currentUser.uid,
        createdAt: new Date().toISOString(),
        date: null,
        weather: null,
        custom_weather: false,
      };

      await addDoc(collection(db, "Campaign"), campaignData);
      navigate("/campaigns");
    } catch (error) {
      console.error("Error creating campaign:", error);
      setError("Failed to create campaign. Please try again.");
    }
  };

  return (
    <div className="campaign-container">
      <div className="campaign-content">
        <div className="campaign-header">
          <h1>Create New Campaign</h1>
        </div>

        <form onSubmit={handleSubmit} className="campaign-form">
          {error && <p className="error-message">{error}</p>}

          <div className="form-group">
            <label htmlFor="campaignName">Campaign Name</label>
            <input
              id="campaignName"
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Enter campaign name"
              className="input_field"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="campaign-button">
              Create Campaign
            </button>
            <button
              type="button"
              className="campaign-button secondary"
              onClick={() => navigate("/campaigns")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCampaign;
