import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthContext";
import AppRouter from "./router";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRouter />
      </Router>
    </AuthProvider>
  );
}

export default App;
