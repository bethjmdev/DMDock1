import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../auth/AuthContext";
import "./TownGenerator.css";

const AddTown = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const { currentUser } = useAuth();
  const [town, setTown] = useState({
    name: "",
    population: 0,
    acres: 0,
    wealth: {
      total: 0,
      maxSale: 0,
      maxPawn: 0,
    },
    demographics: {
      tiefling: 0,
      dragonborn: 0,
      halfElf: 0,
      gnome: 0,
      human: 0,
      dwarf: 0,
      halfling: 0,
      tabaxi: 0,
      elf: 0,
      halfOrc: 0,
    },
    defenses: [],
    organizations: [],
    shops: [],
  });

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
    specials: [],
    patrons: [],
  });

  const [newSpecialItem, setNewSpecialItem] = useState({
    name: "",
    price: "",
    source: "",
  });
  const [newPatron, setNewPatron] = useState({
    name: "",
    race: "",
    gender: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const townData = {
        ...town,
        campaignId,
        dm: currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await addDoc(collection(db, "Towns"), townData);
      navigate(`/campaign/${campaignId}/towns`);
    } catch (error) {
      console.error("Error adding town:", error);
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
    console.log("Adding organization:", newOrganization);
    if (newOrganization.trim()) {
      const updatedOrganizations = [
        ...town.organizations,
        newOrganization.trim(),
      ];
      console.log("Updated organizations:", updatedOrganizations);
      setTown({
        ...town,
        organizations: updatedOrganizations,
      });
      setNewOrganization("");
    }
  };

  const handleShopAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Adding shop:", newShop);
    if (newShop.name.trim()) {
      const updatedShops = [...town.shops, { ...newShop }];
      console.log("Updated shops:", updatedShops);
      setTown({
        ...town,
        shops: updatedShops,
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
        specials: [],
        patrons: [],
      });
    }
  };

  const handleSpecialItemAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Adding special item:", newSpecialItem);
    if (newSpecialItem.name.trim() && newSpecialItem.price.trim()) {
      const updatedItems = [
        ...newShop.specials,
        {
          name: newSpecialItem.name.trim(),
          price: parseInt(newSpecialItem.price),
          source: newSpecialItem.source.trim(),
        },
      ];
      console.log("Updated special items:", updatedItems);
      setNewShop({
        ...newShop,
        specials: updatedItems,
      });
      setNewSpecialItem({ name: "", price: "", source: "" });
    }
  };

  const handlePatronAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Adding patron:", newPatron);
    if (
      newPatron.name.trim() &&
      newPatron.race.trim() &&
      newPatron.gender.trim()
    ) {
      const updatedPatrons = [
        ...newShop.patrons,
        {
          name: newPatron.name.trim(),
          race: newPatron.race.trim(),
          gender: newPatron.gender.trim(),
        },
      ];
      console.log("Updated patrons:", updatedPatrons);
      setNewShop({
        ...newShop,
        patrons: updatedPatrons,
      });
      setNewPatron({ name: "", race: "", gender: "" });
    }
  };

  return (
    <div className="add-town-container">
      <h2>Add New Town</h2>
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
              value={town.wealth.total}
              onChange={(e) =>
                setTown({
                  ...town,
                  wealth: { ...town.wealth, total: parseInt(e.target.value) },
                })
              }
            />
          </div>
          <div className="form-group">
            <label>Max Sale Value (gp):</label>
            <input
              type="number"
              value={town.wealth.maxSale}
              onChange={(e) =>
                setTown({
                  ...town,
                  wealth: { ...town.wealth, maxSale: parseInt(e.target.value) },
                })
              }
            />
          </div>
          <div className="form-group">
            <label>Max Pawn Value (gp):</label>
            <input
              type="number"
              value={town.wealth.maxPawn}
              onChange={(e) =>
                setTown({
                  ...town,
                  wealth: { ...town.wealth, maxPawn: parseInt(e.target.value) },
                })
              }
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Demographics</h3>
          {Object.entries(town.demographics).map(([race, percentage]) => (
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
              value={town.defenses[0] || ""}
              onChange={(e) => {
                const newDefenses = [...town.defenses];
                newDefenses[0] = e.target.value;
                setTown({
                  ...town,
                  defenses: newDefenses,
                });
              }}
            />
          </div>
          <div className="form-group">
            <label>Trained Warriors:</label>
            <input
              type="number"
              value={town.defenses[1] || ""}
              onChange={(e) => {
                const newDefenses = [...town.defenses];
                newDefenses[1] = e.target.value;
                setTown({
                  ...town,
                  defenses: newDefenses,
                });
              }}
            />
          </div>
          <div className="form-group">
            <label>Militia:</label>
            <input
              type="number"
              value={town.defenses[2] || ""}
              onChange={(e) => {
                const newDefenses = [...town.defenses];
                newDefenses[2] = e.target.value;
                setTown({
                  ...town,
                  defenses: newDefenses,
                });
              }}
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
            {town.organizations.map((org, index) => (
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
                  <input
                    type="text"
                    value={newSpecialItem.source}
                    onChange={(e) =>
                      setNewSpecialItem({
                        ...newSpecialItem,
                        source: e.target.value,
                      })
                    }
                    placeholder="Source"
                  />
                  <button type="button" onClick={handleSpecialItemAdd}>
                    Add Item
                  </button>
                </div>
              </div>
              <ul>
                {newShop.specials.map((item, index) => (
                  <li key={index}>
                    {item.name} ({item.source}) - {item.price} gp
                    <button
                      type="button"
                      onClick={() => {
                        setNewShop({
                          ...newShop,
                          specials: newShop.specials.filter(
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
                {newShop.patrons.map((patron, index) => (
                  <li key={index}>
                    {patron.name} ({patron.gender} {patron.race})
                    <button
                      type="button"
                      onClick={() => {
                        setNewShop({
                          ...newShop,
                          patrons: newShop.patrons.filter(
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
              {town.shops.map((shop, index) => (
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
                      {shop.specials.map((item, itemIndex) => (
                        <li key={itemIndex}>
                          {item.name} ({item.source}) - {item.price} gp
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Current Patrons:</strong>
                    <ul>
                      {shop.patrons.map((patron, patronIndex) => (
                        <li key={patronIndex}>
                          {patron.name} ({patron.gender} {patron.race})
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">
            Save Town
          </button>
          <button
            type="button"
            onClick={() => navigate(`/campaign/${campaignId}/towns`)}
            className="cancel-button"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTown;
