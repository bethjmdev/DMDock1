import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./components/auth/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import SignInForm from "./components/auth/SignInForm";
import SignUpForm from "./components/auth/SignUpForm";

import Players from "./components/campaign/pages/Players";
import AddPlayerForm from "./components/campaign/player/AddPlayerForm";
import EditPlayer from "./components/campaign/player/EditPlayer";

import CampaignControl from "./components/CampaignControl";

import NewCampaign from "./components/campaign/modCampaign/NewCampaign";
import CampaignView from "./components/campaign/modCampaign/CampaignView";

import NPC from "./components/campaign/pages/NPC";
import EditNPC from "./components/campaign/npc/EditNPC";
import AddNPCForm from "./components/campaign/npc/AddNPCForm";

import Monster from "./components/campaign/pages/Monster";
import EditMonster from "./components/campaign/monster/EditMonster";
import AddMonster from "./components/campaign/monster/AddMonster";
import MonsterDetail from "./components/campaign/pages/MonsterDetail";

import WeatherGenerator from "./components/campaign/pages/WeatherGenerator";
import EncounterGenerator from "./components/campaign/pages/EncounterGenerator";
import TownGenerator from "./components/campaign/pages/TownGenerator";
import NPCGenerator from "./components/campaign/pages/NPCGenerator";
import SpellSlotTracker from "./components/campaign/pages/SpellSlotTracker";
import DateTracker from "./components/campaign/pages/DateTracker";
import EncounterList from "./components/campaign/pages/EncounterList";
import MonsterList from "./components/campaign/pages/MonsterList";
import Notes from "./components/campaign/pages/Notes";
import CreateNote from "./components/campaign/pages/CreateNote";
import ViewNote from "./components/campaign/pages/ViewNote";
import ViewEncounter from "./components/campaign/pages/ViewEncounter";
import CreateEncounterNote from "./components/campaign/encounter/CreateEncounterNote";

import CustomCalendar from "./components/campaign/weather/CustomCalendar";
import ViewNPC from "./components/campaign/npc/ViewNPC";
import CreateNPCNote from "./components/campaign/npc/CreateNPCNote";
import ViewTowns from "./components/campaign/pages/ViewTowns";
import ViewTownDetails from "./components/campaign/pages/ViewTownDetails";

const AppRouter = () => {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route
        path="/campaign/:campaignId/players"
        element={currentUser ? <Players /> : <Navigate to="/login" />}
      />
      <Route
        path="/campaign/:campaignId/monster"
        element={currentUser ? <Monster /> : <Navigate to="/login" />}
      />
      <Route
        path="/campaign/:campaignId/players/add"
        element={currentUser ? <AddPlayerForm /> : <Navigate to="/login" />}
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
        path="/campaign/:campaignId/npc"
        element={
          <ProtectedRoute>
            <NPC />
          </ProtectedRoute>
        }
      />

      <Route
        path="/campaign/:campaignId/customcalendar"
        element={
          <ProtectedRoute>
            <CustomCalendar />
          </ProtectedRoute>
        }
      />

      <Route
        path="/campaign/:campaignId/weather"
        element={
          <ProtectedRoute>
            <WeatherGenerator />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaign/:campaignId/encounter-generator"
        element={
          <ProtectedRoute>
            <EncounterGenerator />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaign/:campaignId/town-generator"
        element={
          <ProtectedRoute>
            <TownGenerator />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaign/:campaignId/npc-generator"
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
        path="/campaign/:campaignId/date"
        element={
          <ProtectedRoute>
            <DateTracker />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaign/:campaignId/encounter"
        element={
          <ProtectedRoute>
            <EncounterList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/campaign/:campaignId/notes"
        element={
          <ProtectedRoute>
            <Notes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/campaign/:campaignId/monsterslist"
        element={
          <ProtectedRoute>
            <MonsterList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/campaign/:campaignId/monsters/:monsterId"
        element={<MonsterDetail />}
      />

      <Route
        path="/campaign/:campaignId/notes/create-note"
        element={
          <ProtectedRoute>
            <CreateNote />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaign/:campaignId/notes/:noteId"
        element={<ViewNote />}
      />
      <Route
        path="/campaign/:campaignId/players/edit/:playerId"
        element={<EditPlayer />}
      />
      <Route
        path="/campaign/:campaignId/npcs/edit/:npcId"
        element={<EditNPC />}
      />
      <Route
        path="/campaign/:campaignId/monsters/edit/:monsterId"
        element={<EditMonster />}
      />

      <Route
        path="/campaign/:campaignId/npc/add"
        element={currentUser ? <AddNPCForm /> : <Navigate to="/login" />}
      />
      <Route
        path="/campaign/:campaignId/monster/add"
        element={currentUser ? <AddMonster /> : <Navigate to="/login" />}
      />
      <Route
        path="/campaign/:campaignId/encounters/:encounterId"
        element={
          <ProtectedRoute>
            <ViewEncounter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaign/:campaignId/encounters/:encounterId/add-note"
        element={
          <ProtectedRoute>
            <CreateEncounterNote />
          </ProtectedRoute>
        }
      />
      <Route path="/campaign/:campaignId/npcs/:npcId" element={<ViewNPC />} />
      <Route
        path="/campaign/:campaignId/npcs/:npcId/add-note"
        element={<CreateNPCNote />}
      />
      <Route path="/" element={<Navigate to="/campaigns" replace />} />
      <Route
        path="/campaign/:campaignId/towns"
        element={
          <ProtectedRoute>
            <ViewTowns />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaign/:campaignId/towns/:townId"
        element={
          <ProtectedRoute>
            <ViewTownDetails />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRouter;
