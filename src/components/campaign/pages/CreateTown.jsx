import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../auth/AuthContext";
import "./TownGenerator.css";

const CreateTown = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const { currentUser } = useAuth();

  const [townData, setTownData] = useState({
    // Basic Information
    name: "",
    population: "",
    acres: "",
    totalWealth: "",
    maxSaleValue: "",
    maxPawnValue: "",

    // Demographics (in percentages)
    demographics: {
      human: 0,
      dragonborn: 0,
      elf: 0,
      gnome: 0,
      dwarf: 0,
      halfOrc: 0,
      halfElf: 0,
      tabaxi: 0,
      halfling: 0,
      tiefling: 0,
    },

    // Defenses
    defenses: {
      wallType: "",
      trainedWarriors: 0,
      militia: 0,
    },

    // Organizations
    organizations: [],

    // Shops
    shops: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTownData((prev) => ({
      ...prev,
      [name]: name === "population" || name === "acres" ? Number(value) : value,
    }));
  };

  const handleDemographicsChange = (e) => {
    const { name, value } = e.target;
    setTownData((prev) => ({
      ...prev,
      demographics: {
        ...prev.demographics,
        [name]: Number(value),
      },
    }));
  };

  const handleDefensesChange = (e) => {
    const { name, value } = e.target;
    setTownData((prev) => ({
      ...prev,
      defenses: {
        ...prev.defenses,
        [name]: name === "wallType" ? value : Number(value),
      },
    }));
  };

  const handleOrganizationAdd = () => {
    setTownData((prev) => ({
      ...prev,
      organizations: [...prev.organizations, ""],
    }));
  };

  const handleOrganizationChange = (index, value) => {
    const newOrganizations = [...townData.organizations];
    newOrganizations[index] = value;
    setTownData((prev) => ({
      ...prev,
      organizations: newOrganizations,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "Towns"), {
        ...townData,
        campaignId,
        dm: currentUser.uid,
        createdAt: new Date(),
      });
      navigate(`/campaign/${campaignId}/towns`);
    } catch (error) {
      console.error("Error creating town:", error);
      alert("Failed to create town");
    }
  };

  return (
    <div className="create-town-container">
      <div className="create-town-header">
        <h2 className="towns-title">Create New Town</h2>
        <button
          onClick={() => navigate(`/campaign/${campaignId}/towns`)}
          className="back-button"
        >
          Back to Towns
        </button>
      </div>

      <form onSubmit={handleSubmit} className="create-town-form">
        <h3>Basic Information</h3>
        <div className="form-group">
          <label htmlFor="name">Town Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={townData.name}
            onChange={handleInputChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="population">Population</label>
            <input
              type="number"
              id="population"
              name="population"
              value={townData.population}
              onChange={handleInputChange}
              required
              min="1"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="acres">Acres</label>
            <input
              type="number"
              id="acres"
              name="acres"
              value={townData.acres}
              onChange={handleInputChange}
              required
              min="1"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="totalWealth">Total Wealth (gp)</label>
            <input
              type="number"
              id="totalWealth"
              name="totalWealth"
              value={townData.totalWealth}
              onChange={handleInputChange}
              required
              min="0"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="maxSaleValue">Max Sale Value (gp)</label>
            <input
              type="number"
              id="maxSaleValue"
              name="maxSaleValue"
              value={townData.maxSaleValue}
              onChange={handleInputChange}
              required
              min="0"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="maxPawnValue">Max Pawn Value (gp)</label>
            <input
              type="number"
              id="maxPawnValue"
              name="maxPawnValue"
              value={townData.maxPawnValue}
              onChange={handleInputChange}
              required
              min="0"
              className="form-input"
            />
          </div>
        </div>

        <h3>Demographics</h3>
        <div className="demographics-grid">
          {Object.keys(townData.demographics).map((race) => (
            <div key={race} className="form-group">
              <label htmlFor={race}>
                {race.charAt(0).toUpperCase() + race.slice(1)} (%)
              </label>
              <input
                type="number"
                id={race}
                name={race}
                value={townData.demographics[race]}
                onChange={handleDemographicsChange}
                min="0"
                max="100"
                className="form-input"
              />
            </div>
          ))}
        </div>

        <h3>Defenses</h3>
        <div className="form-group">
          <label htmlFor="wallType">Wall Type</label>
          <input
            type="text"
            id="wallType"
            name="wallType"
            value={townData.defenses.wallType}
            onChange={handleDefensesChange}
            className="form-input"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="trainedWarriors">Trained Warriors</label>
            <input
              type="number"
              id="trainedWarriors"
              name="trainedWarriors"
              value={townData.defenses.trainedWarriors}
              onChange={handleDefensesChange}
              min="0"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="militia">Militia Size</label>
            <input
              type="number"
              id="militia"
              name="militia"
              value={townData.defenses.militia}
              onChange={handleDefensesChange}
              min="0"
              className="form-input"
            />
          </div>
        </div>

        <h3>Organizations</h3>
        {townData.organizations.map((org, index) => (
          <div key={index} className="form-group">
            <input
              type="text"
              value={org}
              onChange={(e) => handleOrganizationChange(index, e.target.value)}
              className="form-input"
              placeholder="Organization name"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={handleOrganizationAdd}
          className="add-button"
        >
          Add Organization
        </button>

        <button type="submit" className="create-town-submit">
          Create Town
        </button>
      </form>
    </div>
  );
};

export default CreateTown;
