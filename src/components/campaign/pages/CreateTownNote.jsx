import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../auth/AuthContext";
import "./TownGenerator.css";

const CreateTownNote = () => {
  const { campaignId, townId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "TownNotes"), {
        title,
        content,
        townId,
        campaignId,
        createdAt: new Date().toISOString(),
        userId: currentUser.uid,
      });

      navigate(`/campaign/${campaignId}/towns/${townId}`);
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Failed to add note");
    }
  };

  return (
    <div className="create-note-container">
      <h2>Add Note</h2>
      <form onSubmit={handleSubmit} className="note-form">
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">Content:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <div className="form-buttons">
          <button type="submit" className="submit-button">
            Save Note
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

export default CreateTownNote;
