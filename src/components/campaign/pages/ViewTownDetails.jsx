import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../firebase";
import "./TownGenerator.css";
import { useAuth } from "../../auth/AuthContext";

const ViewTownDetails = () => {
  const [town, setTown] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { campaignId, townId } = useParams();
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState([]);

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

    const fetchTownNotes = async () => {
      try {
        const q = query(
          collection(db, "TownNotes"),
          where("townId", "==", townId)
        );

        const querySnapshot = await getDocs(q);
        const notesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt
            ? new Date(doc.data().createdAt)
            : null,
        }));

        notesList.sort((a, b) => b.createdAt - a.createdAt);

        setNotes(notesList);
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };

    const fetchData = async () => {
      try {
        await fetchTown();
        await fetchTownNotes();
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [townId]);

  const formatDate = (date) => {
    if (!date) return "Unknown date";
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

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

        <section className="notes-section">
          <div className="notes-header">
            <h3>Notes</h3>
            <button
              onClick={() =>
                navigate(`/campaign/${campaignId}/towns/${townId}/add-note`)
              }
              className="add-note-button"
            >
              Add Note
            </button>
          </div>

          {notes.length === 0 ? (
            <p className="no-notes">
              No notes yet. Add one to track important information!
            </p>
          ) : (
            <div className="notes-grid">
              {notes.map((note) => (
                <div key={note.id} className="note-card">
                  <div className="note-header">
                    <h4>{note.title}</h4>
                    <span className="note-date">
                      {formatDate(note.createdAt)}
                    </span>
                  </div>
                  <div className="note-content">
                    <p>{note.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ViewTownDetails;
