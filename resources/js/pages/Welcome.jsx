import React, { useState } from "react";
import Background from "../design/Background";
import SignUp from "../sign/SignUp";
import SignIn from "../sign/SignIn";
import "../../css/pages/Welcome.css";

export default function Welcome() {
  const [showForm, setShowForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);

  const handleGetStarted = () => {
    setShowForm(true);
    setIsSignUp(true);
  };

  const handleSwitchToSignIn = () => {
    setShowForm(true);
    setIsSignUp(false);
  };

  return (
    <div className="welcome-container">
      {/* Background */}
      <Background />

      {/* --- HERO / LANDING PAGE --- */}
      {!showForm && (
        <div className="hero-section">
          <h1>Event Sound Scheduling and Reservation System</h1>
          <p>Plan, reserve, and manage your sound events easily.</p>

          <button className="primary-btn" onClick={handleGetStarted}>
            Get Started
          </button>
          <br/>

        </div>
      )}

      {/* --- AUTH FORMS --- */}
      {showForm && (
        <div className="form-wrapper">
          {isSignUp ? (
            <SignUp onSwitchToSignIn={() => setIsSignUp(false)} />
          ) : (
            <SignIn onSwitchToSignUp={() => setIsSignUp(true)} />
          )}
        </div>
      )}
    </div>
  );
}