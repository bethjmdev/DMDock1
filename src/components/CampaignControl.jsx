import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import "./CampaignControl.css";

const CampaignControl = () => {
  const { signOut, currentUser } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const campaignsQuery = query(
      collection(db, "Campaign"),
      where("dmId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      campaignsQuery,
      (querySnapshot) => {
        const campaignList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort campaigns by creation date (newest first)
        const sortedCampaigns = campaignList.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        setCampaigns(sortedCampaigns);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching campaigns:", error);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [currentUser]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="campaign-container">
      <div className="campaign-content">
        <div className="campaign-header">
          <h1>Campaign Control</h1>
        </div>

        <div className="campaign-actions">
          <button
            className="add-campaign-button"
            onClick={() => navigate("/new-campaign")}
          >
            Add Campaign
          </button>
          <button onClick={handleSignOut} className="sign-out-button">
            Sign Out
          </button>
        </div>

        {loading ? (
          <p>Loading campaigns...</p>
        ) : campaigns.length === 0 ? (
          <p>No campaigns found. Create your first campaign!</p>
        ) : (
          <div className="campaign-grid">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="campaign-card"
                onClick={() => {
                  console.log({ title: campaign.name, campaign: campaign });
                  navigate(`/campaign/${campaign.id}`, {
                    state: { title: campaign.name, campaign: campaign },
                  });
                }}
                style={{ cursor: "pointer" }}
              >
                <h2>{campaign.name}</h2>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignControl;
