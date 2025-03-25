import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import SignInForm from "./components/auth/SignInForm";
import SignUpForm from "./components/auth/SignUpForm";
import CampaignControl from "./components/CampaignControl";
import NewCampaign from "./components/NewCampaign";
import CampaignView from "./components/CampaignView";
import Players from "./components/campaign/Players";
import AddPlayerForm from "./components/campaign/AddPlayerForm";
import NPC from "./components/campaign/NPC";
import WeatherGenerator from "./components/campaign/WeatherGenerator";
import EncounterGenerator from "./components/campaign/EncounterGenerator";
import TownGenerator from "./components/campaign/TownGenerator";
import NPCGenerator from "./components/campaign/NPCGenerator";
import SpellSlotTracker from "./components/campaign/SpellSlotTracker";
import DateTracker from "./components/campaign/DateTracker";
import EncounterList from "./components/campaign/EncounterList";
import MonsterList from "./components/campaign/MonsterList";
import Notes from "./components/campaign/Notes";
import { useAuth } from "./components/auth/AuthContext";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/dashboard/Dashboard";
import Campaigns from "./components/campaign/Campaigns";
import AddCampaignForm from "./components/campaign/AddCampaignForm";
import Campaign from "./components/campaign/Campaign";

const AppRouter = () => {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={currentUser ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/register"
        element={currentUser ? <Navigate to="/dashboard" /> : <Register />}
      />
      <Route
        path="/dashboard"
        element={currentUser ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/campaigns"
        element={currentUser ? <Campaigns /> : <Navigate to="/login" />}
      />
      <Route
        path="/campaigns/add"
        element={currentUser ? <AddCampaignForm /> : <Navigate to="/login" />}
      />
      <Route
        path="/campaigns/:campaignId"
        element={currentUser ? <Campaign /> : <Navigate to="/login" />}
      />
      <Route
        path="/campaigns/:campaignId/players"
        element={currentUser ? <Players /> : <Navigate to="/login" />}
      />
      <Route
        path="/campaigns/:campaignId/players/add"
        element={currentUser ? <AddPlayerForm /> : <Navigate to="/login" />}
      />
      <Route
        path="/"
        element={<Navigate to={currentUser ? "/dashboard" : "/login"} />}
      />
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
      <Route
        path="/campaign/:campaignId"
        element={
          <ProtectedRoute>
            <CampaignView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaign/npc"
        element={
          <ProtectedRoute>
            <NPC />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaign/weather"
        element={
          <ProtectedRoute>
            <WeatherGenerator />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaign/encounter"
        element={
          <ProtectedRoute>
            <EncounterGenerator />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaign/town"
        element={
          <ProtectedRoute>
            <TownGenerator />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaign/npc-generator"
        element={
          <ProtectedRoute>
            <NPCGenerator />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaign/spell-slots"
        element={
          <ProtectedRoute>
            <SpellSlotTracker />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaign/date"
        element={
          <ProtectedRoute>
            <DateTracker />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaign/encounter-list"
        element={
          <ProtectedRoute>
            <EncounterList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaign/monsters"
        element={
          <ProtectedRoute>
            <MonsterList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaign/notes"
        element={
          <ProtectedRoute>
            <Notes />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRouter;
