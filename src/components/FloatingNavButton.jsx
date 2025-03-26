import React from "react";
import { useNavigate } from "react-router-dom";
import "./FloatingNavButton.css"; // Create this CSS file for styling

const FloatingNavButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/campaigns"); // Use navigate to change routes
  };

  console.log("FloatingNavButton rendered");

  return (
    <div className="floating-nav-button" onClick={handleClick}>
      Home
    </div>
  );
};

export default FloatingNavButton;
