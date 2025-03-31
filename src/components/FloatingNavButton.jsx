// import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./FloatingNavButton.css"; // Create this CSS file for styling

const FloatingNavButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleHomeClick = () => {
    navigate("/campaigns");
  };

  const handleCampaignClick = () => {
    // Extract campaignId from the current URL path
    const pathParts = location.pathname.split("/");
    const campaignId = pathParts[2]; // Gets the ID from /campaign/ID/whatever
    navigate(`/campaign/${campaignId}`);
  };

  // Show both buttons when in campaign subpages
  const showBothButtons =
    location.pathname.includes("/campaign/") &&
    location.pathname.split("/").length > 3; // Only show on deeper paths

  // console.log("FloatingNavButton rendered");

  return (
    <div className="floating-nav-buttons">
      {showBothButtons ? (
        <>
          <div className="floating-nav-button" onClick={handleCampaignClick}>
            Back
          </div>
          <div
            className="floating-nav-button home-button"
            onClick={handleHomeClick}
          >
            Home
          </div>
        </>
      ) : (
        <div
          className="floating-nav-button home-button"
          onClick={handleHomeClick}
        >
          Home
        </div>
      )}
    </div>
  );
};

export default FloatingNavButton;
