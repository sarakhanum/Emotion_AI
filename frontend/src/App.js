import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Signup from "./components/Signup";
import Profile from "./components/Profile";
import MoodTracker from "./components/MoodTracker";
import WeeklyReports from "./components/WeeklyReports";
import ChatAssistant from "./components/ChatAssistant";
import RewardsZone from "./components/RewardsZone";
import TasksSuggestions from "./components/TasksSuggestions";
import Predictions from "./components/Predictions";
import SidebarLayout from "./components/SidebarLayout";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={
          <SidebarLayout>
            <Dashboard />
          </SidebarLayout>
        } />
        <Route path="/profile" element={
          <SidebarLayout>
            <Profile />
          </SidebarLayout>
        } />
        <Route path="/mood-tracker" element={
          <SidebarLayout>
            <MoodTracker />
          </SidebarLayout>
        } />
        <Route path="/weekly-reports" element={
          <SidebarLayout>
            <WeeklyReports />
          </SidebarLayout>
        } />
        <Route path="/chat-assistant" element={
          <SidebarLayout>
            <ChatAssistant />
          </SidebarLayout>
        } />
        <Route path="/rewards-zone" element={
          <SidebarLayout>
            <RewardsZone />
          </SidebarLayout>
        } />
        <Route path="/tasks-suggestions" element={
          <SidebarLayout>
            <TasksSuggestions />
          </SidebarLayout>
        } />
        <Route path="/predictions" element={
          <SidebarLayout>
            <Predictions />
          </SidebarLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;