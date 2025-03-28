import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import "./TownGenerator.css";

const ViewTownDetails = () => {
  const [town, setTown] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { campaignId, townId } = useParams();

  useEffect(() => {
    const fetchTown = async () => {
      try {
        const townDoc = await getDoc(doc(db, "Towns", townId));
        if (townDoc.exists()) {
          setTown({ id: townDoc.id, ...townDoc.data() });
        } else {
          console.error("Town not found");
        }
      } catch (error) {
        console.error("Error fetching town:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTown();
  }, [townId]);

  if (loading) return <p>Loading town details...</p>;
  if (!town) return <p>Town not found</p>;

  return (
    <div className="town-details-container">
      <div className="town-details-header">
        <h2>{town.name}</h2>
        <button
          onClick={() => navigate(`/campaign/${campaignId}/towns`)}
          className="back-button"
        >
          Back to Towns
        </button>
      </div>

      <div className="town-details-content">
        <section className="town-basic-info">
          <h3>Basic Information</h3>
          <p>Population: {town.population.toLocaleString()}</p>
          <p>Size: {town.acres} acres</p>
          <p>Total Wealth: {town.wealth.total.toLocaleString()} gp</p>
          <p>Max Sale Value: {town.wealth.maxSale.toLocaleString()} gp</p>
          <p>Max Pawn Value: {town.wealth.maxPawn.toLocaleString()} gp</p>
        </section>

        <section className="town-demographics">
          <h3>Demographics</h3>
          {Object.entries(town.demographics).map(([race, percentage]) => (
            <p key={race} className="capitalize">
              {race}: {percentage}%
            </p>
          ))}
        </section>

        <section className="town-defenses">
          <h3>Defenses</h3>
          <ul>
            {town.defenses.map((defense, index) => (
              <li key={index}>{defense}</li>
            ))}
          </ul>
        </section>

        <section className="town-organizations">
          <h3>Organizations</h3>
          <ul>
            {town.organizations.map((org, index) => (
              <li key={index}>{org}</li>
            ))}
          </ul>
        </section>

        <section className="town-shops">
          <h3>Shops and Buildings</h3>
          {town.shops.map((shop, index) => (
            <div key={index} className="shop-card">
              <h4>
                {shop.name} ({shop.type})
              </h4>
              <p>
                <strong>Owner:</strong> {shop.owner.name} ({shop.owner.gender}{" "}
                {shop.owner.race})
              </p>
              <p>
                <strong>Location:</strong> {shop.location}
              </p>
              <p>
                <strong>Description:</strong> {shop.description}
              </p>

              {shop.specials.length > 0 && (
                <>
                  <p>
                    <strong>Special Items:</strong>
                  </p>
                  <ul>
                    {shop.specials.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        {item.name} ({item.source}) - {item.price} gp
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {shop.patrons.length > 0 && (
                <>
                  <p>
                    <strong>Current Patrons:</strong>
                  </p>
                  <ul>
                    {shop.patrons.map((patron, patronIndex) => (
                      <li key={patronIndex}>
                        {patron.name} ({patron.gender} {patron.race})
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default ViewTownDetails;
