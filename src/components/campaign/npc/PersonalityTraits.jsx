import React from "react";

const PersonalityTraits = ({ traits }) => {
  return (
    <div className="mt-4 space-y-2">
      {traits.map((trait, index) => (
        <p key={index} className="text-gray-700">
          {trait}
        </p>
      ))}
    </div>
  );
};

export default PersonalityTraits;
