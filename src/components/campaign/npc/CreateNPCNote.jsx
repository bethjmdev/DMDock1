import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../../../firebase";

const CreateNPCNote = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { campaignId, npcId } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await addDoc(collection(db, "NPCNotes"), {
        title,
        content,
        npcId,
        campaignId,
        dmId: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      navigate(`/campaign/${campaignId}/npcs/${npcId}`);
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="create-note-container">
      <h2>Add Note to NPC</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Note content"
          required
        />
        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Note"}
        </button>
      </form>
    </div>
  );
};

export default CreateNPCNote;
