import { useNavigate, useParams } from "react-router-dom";

const BackToCampaignButton = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams();

  const handleBackToCampaign = () => {
    navigate(`/campaign/${campaignId}`);
  };

  return (
    <button
      onClick={handleBackToCampaign}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
    >
      Back to Campaign
    </button>
  );
};

export default BackToCampaignButton;
