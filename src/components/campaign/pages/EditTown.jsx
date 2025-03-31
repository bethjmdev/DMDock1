import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../auth/AuthContext";
import "./TownGenerator.css";

const EditTown = () => {
  const navigate = useNavigate();
  const { campaignId, townId } = useParams();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [town, setTown] = useState(null);
  const [newOrganization, setNewOrganization] = useState("");
  const [newShop, setNewShop] = useState({
    name: "",
    type: "",
    owner: {
      name: "",
      race: "",
      gender: "",
    },
    location: "",
    description: "",
    specialItems: [],
    currentPatrons: [],
  });

  const [newSpecialItem, setNewSpecialItem] = useState({ name: "", price: "" });
  const [newPatron, setNewPatron] = useState({
    name: "",
    race: "",
    gender: "",
  });

  useEffect(() => {
    const fetchTown = async () => {
      try {
        const townDoc = await getDoc(doc(db, "Towns", townId));
        if (townDoc.exists()) {
          setTown({ id: townDoc.id, ...townDoc.data() });
        } else {
          console.error("Town not found");
          navigate(`/campaign/${campaignId}/towns`);
        }
      } catch (error) {
        console.error("Error fetching town:", error);
        navigate(`/campaign/${campaignId}/towns`);
      } finally {
        setLoading(false);
      }
    };

    fetchTown();
  }, [townId, campaignId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const townData = {
        ...town,
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(doc(db, "Towns", townId), townData);
      navigate(`/campaign/${campaignId}/towns/${townId}`);
    } catch (error) {
      console.error("Error updating town:", error);
    }
  };

  const handleDemographicChange = (race, value) => {
    setTown({
      ...town,
      demographics: {
        ...town.demographics,
        [race]: parseFloat(value),
      },
    });
  };

  const handleDefenseChange = (field, value) => {
    setTown({
      ...town,
      defenses: {
        ...town.defenses,
        [field]: value,
      },
    });
  };

  const handleOrganizationAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (newOrganization.trim()) {
      setTown({
        ...town,
        organizations: [...town.organizations, newOrganization.trim()],
      });
      setNewOrganization("");
    }
  };

  const handleShopAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (newShop.name.trim()) {
      setTown({
        ...town,
        shops: [...town.shops, { ...newShop }],
      });
      setNewShop({
        name: "",
        type: "",
        owner: {
          name: "",
          race: "",
          gender: "",
        },
        location: "",
        description: "",
        specialItems: [],
        currentPatrons: [],
      });
    }
  };

  const handleSpecialItemAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (newSpecialItem.name.trim() && newSpecialItem.price.trim()) {
      setNewShop({
        ...newShop,
        specialItems: [
          ...newShop.specialItems,
          {
            name: newSpecialItem.name.trim(),
            price: parseInt(newSpecialItem.price),
          },
        ],
      });
      setNewSpecialItem({ name: "", price: "" });
    }
  };

  const handlePatronAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      newPatron.name.trim() &&
      newPatron.race.trim() &&
      newPatron.gender.trim()
    ) {
      setNewShop({
        ...newShop,
        currentPatrons: [
          ...newShop.currentPatrons,
          {
            name: newPatron.name.trim(),
            race: newPatron.race.trim(),
            gender: newPatron.gender.trim(),
          },
        ],
      });
      setNewPatron({ name: "", race: "", gender: "" });
    }
  };

  if (loading) return <div className="loading">Loading town data...</div>;
  if (!town) return <div className="error">Town not found</div>;

  return (
    <div className="add-town-container">
      <h2>Edit Town</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={town.name}
              onChange={(e) => setTown({ ...town, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Population:</label>
            <input
              type="number"
              value={town.population}
              onChange={(e) =>
                setTown({ ...town, population: parseInt(e.target.value) })
              }
            />
          </div>
          <div className="form-group">
            <label>Size (acres):</label>
            <input
              type="number"
              value={town.acres}
              onChange={(e) =>
                setTown({ ...town, acres: parseInt(e.target.value) })
              }
            />
          </div>
          <div className="form-group">
            <label>Total Wealth (gp):</label>
            <input
              type="number"
              value={town.totalWealth}
              onChange={(e) =>
                setTown({ ...town, totalWealth: parseInt(e.target.value) })
              }
            />
          </div>
          <div className="form-group">
            <label>Max Sale Value (gp):</label>
            <input
              type="number"
              value={town.maxSaleValue}
              onChange={(e) =>
                setTown({ ...town, maxSaleValue: parseInt(e.target.value) })
              }
            />
          </div>
          <div className="form-group">
            <label>Max Pawn Value (gp):</label>
            <input
              type="number"
              value={town.maxPawnValue}
              onChange={(e) =>
                setTown({ ...town, maxPawnValue: parseInt(e.target.value) })
              }
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Demographics</h3>
          {Object.entries(town.demographics || {}).map(([race, percentage]) => (
            <div key={race} className="form-group">
              <label>{race}:</label>
              <input
                type="number"
                value={percentage}
                onChange={(e) => handleDemographicChange(race, e.target.value)}
              />
              <span>%</span>
            </div>
          ))}
        </div>

        <div className="form-section">
          <h3>Defenses</h3>
          <div className="form-group">
            <label>Walls:</label>
            <input
              type="text"
              value={town.defenses?.walls || ""}
              onChange={(e) => handleDefenseChange("walls", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Trained Warriors:</label>
            <input
              type="number"
              value={town.defenses?.trainedWarriors || 0}
              onChange={(e) =>
                handleDefenseChange("trainedWarriors", parseInt(e.target.value))
              }
            />
          </div>
          <div className="form-group">
            <label>Militia:</label>
            <input
              type="number"
              value={town.defenses?.militia || 0}
              onChange={(e) =>
                handleDefenseChange("militia", parseInt(e.target.value))
              }
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Organizations</h3>
          <div className="sub-form">
            <div className="form-group">
              <input
                type="text"
                value={newOrganization}
                onChange={(e) => setNewOrganization(e.target.value)}
                placeholder="Add organization"
              />
              <button type="button" onClick={handleOrganizationAdd}>
                Add
              </button>
            </div>
          </div>
          <ul>
            {(town.organizations || []).map((org, index) => (
              <li key={index}>
                {org}
                <button
                  type="button"
                  onClick={() => {
                    setTown({
                      ...town,
                      organizations: town.organizations.filter(
                        (_, i) => i !== index
                      ),
                    });
                  }}
                  className="remove-button"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="form-section">
          <h3>Shops</h3>
          <div className="shop-form">
            <div className="form-group">
              <label>Shop Name:</label>
              <input
                type="text"
                value={newShop.name}
                onChange={(e) =>
                  setNewShop({ ...newShop, name: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Type:</label>
              <input
                type="text"
                value={newShop.type}
                onChange={(e) =>
                  setNewShop({ ...newShop, type: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Owner Name:</label>
              <input
                type="text"
                value={newShop.owner.name}
                onChange={(e) =>
                  setNewShop({
                    ...newShop,
                    owner: { ...newShop.owner, name: e.target.value },
                  })
                }
              />
            </div>
            <div className="form-group">
              <label>Owner Race:</label>
              <input
                type="text"
                value={newShop.owner.race}
                onChange={(e) =>
                  setNewShop({
                    ...newShop,
                    owner: { ...newShop.owner, race: e.target.value },
                  })
                }
              />
            </div>
            <div className="form-group">
              <label>Owner Gender:</label>
              <input
                type="text"
                value={newShop.owner.gender}
                onChange={(e) =>
                  setNewShop({
                    ...newShop,
                    owner: { ...newShop.owner, gender: e.target.value },
                  })
                }
              />
            </div>
            <div className="form-group">
              <label>Location:</label>
              <input
                type="text"
                value={newShop.location}
                onChange={(e) =>
                  setNewShop({ ...newShop, location: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Description:</label>
              <textarea
                value={newShop.description}
                onChange={(e) =>
                  setNewShop({ ...newShop, description: e.target.value })
                }
              />
            </div>

            <div className="form-section">
              <h4>Special Items</h4>
              <div className="sub-form">
                <div className="form-group">
                  <input
                    type="text"
                    value={newSpecialItem.name}
                    onChange={(e) =>
                      setNewSpecialItem({
                        ...newSpecialItem,
                        name: e.target.value,
                      })
                    }
                    placeholder="Item name"
                  />
                  <input
                    type="number"
                    value={newSpecialItem.price}
                    onChange={(e) =>
                      setNewSpecialItem({
                        ...newSpecialItem,
                        price: e.target.value,
                      })
                    }
                    placeholder="Price in gp"
                  />
                  <button type="button" onClick={handleSpecialItemAdd}>
                    Add Item
                  </button>
                </div>
              </div>
              <ul>
                {(newShop.specialItems || []).map((item, index) => (
                  <li key={index}>
                    {item.name} - {item.price} gp
                    <button
                      type="button"
                      onClick={() => {
                        setNewShop({
                          ...newShop,
                          specialItems: newShop.specialItems.filter(
                            (_, i) => i !== index
                          ),
                        });
                      }}
                      className="remove-button"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="form-section">
              <h4>Current Patrons</h4>
              <div className="sub-form">
                <div className="form-group">
                  <input
                    type="text"
                    value={newPatron.name}
                    onChange={(e) =>
                      setNewPatron({ ...newPatron, name: e.target.value })
                    }
                    placeholder="Patron name"
                  />
                  <input
                    type="text"
                    value={newPatron.race}
                    onChange={(e) =>
                      setNewPatron({ ...newPatron, race: e.target.value })
                    }
                    placeholder="Race"
                  />
                  <input
                    type="text"
                    value={newPatron.gender}
                    onChange={(e) =>
                      setNewPatron({ ...newPatron, gender: e.target.value })
                    }
                    placeholder="Gender"
                  />
                  <button type="button" onClick={handlePatronAdd}>
                    Add Patron
                  </button>
                </div>
              </div>
              <ul>
                {(newShop.currentPatrons || []).map((patron, index) => (
                  <li key={index}>
                    {patron.name} ({patron.gender} {patron.race})
                    <button
                      type="button"
                      onClick={() => {
                        setNewShop({
                          ...newShop,
                          currentPatrons: newShop.currentPatrons.filter(
                            (_, i) => i !== index
                          ),
                        });
                      }}
                      className="remove-button"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={handleShopAdd}
              className="add-shop-button"
            >
              Add Shop
            </button>
          </div>

          <div className="shops-list">
            <h4>Added Shops</h4>
            <ul>
              {(town.shops || []).map((shop, index) => (
                <li key={index} className="shop-item">
                  <h5>
                    {shop.name} ({shop.type})
                  </h5>
                  <p>
                    Owner: {shop.owner.name} ({shop.owner.gender}{" "}
                    {shop.owner.race})
                  </p>
                  <p>Location: {shop.location}</p>
                  <p>Description: {shop.description}</p>
                  <div>
                    <strong>Special Items:</strong>
                    <ul>
                      {(shop.specialItems || []).map((item, itemIndex) => (
                        <li key={itemIndex}>
                          {item.name} - {item.price} gp
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Current Patrons:</strong>
                    <ul>
                      {(shop.currentPatrons || []).map(
                        (patron, patronIndex) => (
                          <li key={patronIndex}>
                            {patron.name} ({patron.gender} {patron.race})
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTown({
                        ...town,
                        shops: town.shops.filter((_, i) => i !== index),
                      });
                    }}
                    className="remove-button"
                  >
                    Remove Shop
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => navigate(`/campaign/${campaignId}/towns/${townId}`)}
            className="cancel-button"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTown;
