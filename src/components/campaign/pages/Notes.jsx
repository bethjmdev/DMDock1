import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../../firebase"; // adjust path as needed

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { campaignId } = useParams(); // Get campaignId from URL params

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const q = query(
          collection(db, "Notes"),
          where("campaignId", "==", campaignId),
          where("dmId", "==", auth.currentUser.uid)
        );

        const querySnapshot = await getDocs(q);
        const notesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotes(notesList);
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [campaignId]); // Add campaignId as dependency

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notes</h1>
        <Link
          to="create-note"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Create Note
        </Link>
      </div>

      {loading ? (
        <p>Loading notes...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <Link
              key={note.id}
              to={`note/${note.id}`}
              className="p-4 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold">{note.title}</h3>
              <p className="text-gray-600 text-sm">
                {new Date(note.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notes;
