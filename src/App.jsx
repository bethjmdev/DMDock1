import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthContext";
import AppRouter from "./router";
// import Navbar from "./components/Navbar";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* <Navbar /> */}
        <AppRouter />
      </Router>
    </AuthProvider>
  );
}

export default App;
