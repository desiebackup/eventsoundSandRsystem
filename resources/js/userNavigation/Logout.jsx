import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Lock } from "lucide-react";
import "../../css/usernav/Logout.css";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:8000";

export default function Logout() {
  const [step, setStep] = useState("confirm"); // "confirm" | "done"
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("/logout");
      setStep("done");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  if (step === "done") {
    return (
      <div className="logout-container">
        <div className="logout-card">
          <div className="logout-icon">
            <Lock size={50} className="icon-blue" />
          </div>
          <h2 className="logout-title">You Have Been Logged Out</h2>
          <p className="logout-text">
            Thank you for using the Event Sound Scheduling and Reservation System.
            Your session has been successfully terminated.
          </p>
          <div className="logout-buttons">
            <button onClick={() => navigate("/login")} className="btn-primary">
              Log Back In
            </button>
            <button onClick={() => navigate("/")} className="btn-secondary">
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation step
  return (
    <div className="logout-container">
      <div className="logout-card">
        <div className="logout-icon">
          <Lock size={50} className="icon-blue" />
        </div>
        <h2 className="logout-title">Are you sure you want to log out?</h2>
        <p className="logout-text">
          Your session will be ended and you’ll be redirected to the login page.
        </p>
        <div className="logout-buttons">
          <button onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleLogout} className="btn-primary">
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
