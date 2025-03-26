import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthContext";
import AppRouter from "./router";
import FloatingNavButton from "./components/FloatingNavButton";
// import Navbar from "./components/Navbar";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* <Navbar /> */}
        <AppRouter />
        <FloatingNavButton />
      </Router>
    </AuthProvider>
  );
}

export default App;
