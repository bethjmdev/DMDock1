import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../auth/AuthContext";
import "../pages/TownGenerator.css";

const EditTown = () => {
  const navigate = useNavigate();
  const { campaignId, townId } = useParams();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [townData, setTownData] = useState(null);

  useEffect(() => {
    const fetchTown = async () => {
      try {
        const townDoc = await getDoc(doc(db, "Towns", townId));
        if (townDoc.exists()) {
          setTownData(townDoc.data());
        } else {
          console.error("Town not found");
          navigate(`/campaign/${campaignId}/towns`);
        }
      } catch (error) {
        console.error("Error fetching town:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTown();
  }, [townId, campaignId, navigate]);

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

  const handleOrganizationChange = (index, value) => {
    const newOrganizations = [...townData.organizations];
    newOrganizations[index] = value;
    setTownData((prev) => ({
      ...prev,
      organizations: newOrganizations,
    }));
  };

  const handleOrganizationAdd = () => {
    setTownData((prev) => ({
      ...prev,
      organizations: [...prev.organizations, ""],
    }));
  };

  const handleOrganizationRemove = (index) => {
    setTownData((prev) => ({
      ...prev,
      organizations: prev.organizations.filter((_, i) => i !== index),
    }));
  };

  const handleShopChange = (index, field, value) => {
    const newShops = [...townData.shops];
    newShops[index] = {
      ...newShops[index],
      [field]: value,
    };
    setTownData((prev) => ({
      ...prev,
      shops: newShops,
    }));
  };

  const handleShopOwnerChange = (shopIndex, field, value) => {
    const newShops = [...townData.shops];
    newShops[shopIndex] = {
      ...newShops[shopIndex],
      owner: {
        ...newShops[shopIndex].owner,
        [field]: value,
      },
    };
    setTownData((prev) => ({
      ...prev,
      shops: newShops,
    }));
  };

  const handleSpecialItemChange = (shopIndex, itemIndex, field, value) => {
    const newShops = [...townData.shops];
    newShops[shopIndex].specials[itemIndex] = {
      ...newShops[shopIndex].specials[itemIndex],
      [field]: field === "price" ? Number(value) : value,
    };
    setTownData((prev) => ({
      ...prev,
      shops: newShops,
    }));
  };

  const handleAddSpecialItem = (shopIndex) => {
    const newShops = [...townData.shops];
    newShops[shopIndex].specials.push({
      name: "",
      source: "",
      price: 0,
    });
    setTownData((prev) => ({
      ...prev,
      shops: newShops,
    }));
  };

  const handleRemoveSpecialItem = (shopIndex, itemIndex) => {
    const newShops = [...townData.shops];
    newShops[shopIndex].specials.splice(itemIndex, 1);
    setTownData((prev) => ({
      ...prev,
      shops: newShops,
    }));
  };

  const handlePatronChange = (shopIndex, patronIndex, field, value) => {
    const newShops = [...townData.shops];
    newShops[shopIndex].patrons[patronIndex] = {
      ...newShops[shopIndex].patrons[patronIndex],
      [field]: value,
    };
    setTownData((prev) => ({
      ...prev,
      shops: newShops,
    }));
  };

  const handleAddPatron = (shopIndex) => {
    const newShops = [...townData.shops];
    newShops[shopIndex].patrons.push({
      name: "",
      gender: "",
      race: "",
    });
    setTownData((prev) => ({
      ...prev,
      shops: newShops,
    }));
  };

  const handleRemovePatron = (shopIndex, patronIndex) => {
    const newShops = [...townData.shops];
    newShops[shopIndex].patrons.splice(patronIndex, 1);
    setTownData((prev) => ({
      ...prev,
      shops: newShops,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const townRef = doc(db, "Towns", townId);
      await updateDoc(townRef, {
        ...townData,
        lastUpdated: new Date(),
      });
      navigate(`/campaign/${campaignId}/towns/${townId}`);
    } catch (error) {
      console.error("Error updating town:", error);
      alert("Failed to update town");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!townData) return <p>Town not found</p>;

  return (
    <div className="edit-town-container">
      <div className="edit-town-header">
        <h2 className="towns-title">Edit Town: {townData.name}</h2>
        <button
          onClick={() => navigate(`/campaign/${campaignId}/towns/${townId}`)}
          className="back-button"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="edit-town-form">
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
          {Object.entries(townData.demographics).map(([race, percentage]) => (
            <div key={race} className="form-group">
              <label htmlFor={race}>
                {race.charAt(0).toUpperCase() + race.slice(1)} (%)
              </label>
              <input
                type="number"
                id={race}
                name={race}
                value={percentage}
                onChange={handleDemographicsChange}
                min="0"
                max="100"
                className="form-input"
              />
            </div>
          ))}
        </div>

        <h3>Organizations</h3>
        {townData.organizations.map((org, index) => (
          <div key={index} className="form-group organization-input">
            <input
              type="text"
              value={org}
              onChange={(e) => handleOrganizationChange(index, e.target.value)}
              className="form-input"
              placeholder="Organization name"
            />
            <button
              type="button"
              onClick={() => handleOrganizationRemove(index)}
              className="remove-button"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleOrganizationAdd}
          className="add-button"
        >
          Add Organization
        </button>

        <h3>Shops and Buildings</h3>
        {townData.shops.map((shop, shopIndex) => (
          <div key={shopIndex} className="shop-edit-card">
            <div className="form-row">
              <div className="form-group">
                <label>Shop Name</label>
                <input
                  type="text"
                  value={shop.name}
                  onChange={(e) =>
                    handleShopChange(shopIndex, "name", e.target.value)
                  }
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <input
                  type="text"
                  value={shop.type}
                  onChange={(e) =>
                    handleShopChange(shopIndex, "type", e.target.value)
                  }
                  className="form-input"
                />
              </div>
            </div>

            <h4>Owner</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={shop.owner.name}
                  onChange={(e) =>
                    handleShopOwnerChange(shopIndex, "name", e.target.value)
                  }
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <input
                  type="text"
                  value={shop.owner.gender}
                  onChange={(e) =>
                    handleShopOwnerChange(shopIndex, "gender", e.target.value)
                  }
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Race</label>
                <input
                  type="text"
                  value={shop.owner.race}
                  onChange={(e) =>
                    handleShopOwnerChange(shopIndex, "race", e.target.value)
                  }
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={shop.location}
                onChange={(e) =>
                  handleShopChange(shopIndex, "location", e.target.value)
                }
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={shop.description}
                onChange={(e) =>
                  handleShopChange(shopIndex, "description", e.target.value)
                }
                className="form-textarea"
                rows="3"
              />
            </div>

            <h4>Special Items</h4>
            {shop.specials.map((item, itemIndex) => (
              <div key={itemIndex} className="special-item-row">
                <div className="form-row">
                  <div className="form-group">
                    <label>Item Name</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        handleSpecialItemChange(
                          shopIndex,
                          itemIndex,
                          "name",
                          e.target.value
                        )
                      }
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Source</label>
                    <input
                      type="text"
                      value={item.source}
                      onChange={(e) =>
                        handleSpecialItemChange(
                          shopIndex,
                          itemIndex,
                          "source",
                          e.target.value
                        )
                      }
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Price (gp)</label>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) =>
                        handleSpecialItemChange(
                          shopIndex,
                          itemIndex,
                          "price",
                          e.target.value
                        )
                      }
                      className="form-input"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveSpecialItem(shopIndex, itemIndex)
                    }
                    className="remove-button"
                  >
                    Remove Item
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddSpecialItem(shopIndex)}
              className="add-button"
            >
              Add Special Item
            </button>

            <h4>Current Patrons</h4>
            {shop.patrons.map((patron, patronIndex) => (
              <div key={patronIndex} className="patron-row">
                <div className="form-row">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={patron.name}
                      onChange={(e) =>
                        handlePatronChange(
                          shopIndex,
                          patronIndex,
                          "name",
                          e.target.value
                        )
                      }
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <input
                      type="text"
                      value={patron.gender}
                      onChange={(e) =>
                        handlePatronChange(
                          shopIndex,
                          patronIndex,
                          "gender",
                          e.target.value
                        )
                      }
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Race</label>
                    <input
                      type="text"
                      value={patron.race}
                      onChange={(e) =>
                        handlePatronChange(
                          shopIndex,
                          patronIndex,
                          "race",
                          e.target.value
                        )
                      }
                      className="form-input"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePatron(shopIndex, patronIndex)}
                    className="remove-button"
                  >
                    Remove Patron
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddPatron(shopIndex)}
              className="add-button"
            >
              Add Patron
            </button>
          </div>
        ))}

        <button type="submit" className="save-changes-button">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditTown;
