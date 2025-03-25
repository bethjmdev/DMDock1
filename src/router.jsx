import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import SignInForm from "./components/auth/SignInForm";
import SignUpForm from "./components/auth/SignUpForm";
import CampaignControl from "./components/CampaignControl";
import NewCampaign from "./components/NewCampaign";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/signin" element={<SignInForm />} />
      <Route path="/signup" element={<SignUpForm />} />
      <Route
        path="/campaigns"
        element={
          <ProtectedRoute>
            <CampaignControl />
          </ProtectedRoute>
        }
      />
      <Route
        path="/new-campaign"
        element={
          <ProtectedRoute>
            <NewCampaign />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/campaigns" replace />} />
    </Routes>
  );
};

export default AppRouter;
