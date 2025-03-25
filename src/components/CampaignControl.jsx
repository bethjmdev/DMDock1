import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import "./CampaignControl.css";

const CampaignControl = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="campaign-container">
      <div className="campaign-content">
        <div className="campaign-header">
          <h1>Campaign Control</h1>
        </div>

        <div className="campaign-actions">
          <button
            className="add-campaign-button"
            onClick={() => navigate("/new-campaign")}
          >
            Add Campaign
          </button>
          <button onClick={handleSignOut} className="sign-out-button">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignControl;
