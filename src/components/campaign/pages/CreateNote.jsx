import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../../../firebase"; // adjust path as needed
import "./Notes.css";

const CreateNote = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { campaignId } = useParams(); // Get campaignId from URL params

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await addDoc(collection(db, "Notes"), {
        title,
        content,
        campaignId,
        dmId: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Navigate back to notes page with the correct campaign ID
      navigate(`/campaign/${campaignId}/notes`);
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="notes-container">
      <div className="notes-header">
        <h2 className="text-2xl font-bold text-gray-800">Create New Note</h2>
        <button
          onClick={() => navigate(`/campaign/${campaignId}/notes`)}
          className="auth-button"
          style={{ width: "auto", padding: "0.5rem 1rem" }}
        >
          Back to Notes
        </button>
      </div>

      <div className="note-card create-note-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="title-input-container">
            <label htmlFor="title" className="form-label">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              required
              className="title-input"
            />
          </div>

          <div className="content-input-container">
            <label htmlFor="content" className="form-label">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              required
              className="content-input"
            />
          </div>

          <div className="flex gap-4 justify-end mt-6">
            <button
              type="submit"
              disabled={saving}
              className="auth-button"
              style={{ padding: "0.75rem 2rem" }}
            >
              {saving ? "Saving..." : "Save Note"}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/campaign/${campaignId}/notes`)}
              className="cancel-button"
              style={{ padding: "0.75rem 2rem" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNote;
