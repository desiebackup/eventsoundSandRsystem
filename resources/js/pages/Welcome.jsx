import React, { useState } from "react";
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

  const scrollToSection = (e, id) => {
    e.preventDefault();
    setShowForm(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const navHeight = 80; // adjust for navbar height
        const y = el.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 50);
  };

  return (
    <div className="welcome-container">
      {/* NAVIGATION BAR */}
      <nav className="top-nav">
        <div className="nav-left">
          <span className="logo">🎵 SoundEvent Pro</span>
        </div>
        <div className="nav-right">
          <a href="#home" onClick={(e) => scrollToSection(e, "home")}>
            Home
          </a>
          <a href="#about" onClick={(e) => scrollToSection(e, "about")}>
            About
          </a>
          <a href="#contact" onClick={(e) => scrollToSection(e, "contact")}>
            Contact
          </a>
          <button
            className="nav-btn"
            onClick={() => {
              setShowForm(true);
              setIsSignUp(false);
            }}
          >
            Sign In
          </button>
          <button
            className="nav-btn primary"
            onClick={() => {
              setShowForm(true);
              setIsSignUp(true);
            }}
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="content">
        {!showForm && (
          <>
            <section id="home" className="hero-section">
              <h1>Schedule Your Perfect Sound Experience</h1>
              <p>
                Professional audio solutions for events of any size.
                <br />
                From intimate gatherings to massive concerts, we make your sound dreams reality.
              </p>
              <button className="primary-btn" onClick={handleGetStarted}>
                Get Started Today
              </button>
            </section>

            <section id="about" className="info-section">
              <h2>About</h2>
              <p>
                Our platform helps you manage event sound setups with ease. Book, track, and organize
                your events effortlessly.
              </p>
            </section>

            <section id="contact" className="info-section">
              <h2>Contact</h2>
              <p>
                Need help? Reach us at <strong>support@soundeventpro.com</strong> or call
                <strong> +63 912 345 6789</strong>.
              </p>
            </section>
          </>
        )}

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
    </div>
  );
}
