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

  // Scroll helper: shows the sections (hides any form) and scrolls to the element,
  // compensating for the fixed navbar height so the section isn't hidden under the bar.
  const scrollToSection = (e, id) => {
    e.preventDefault();

    // If a form is open, close it to reveal sections
    setShowForm(false);

    // Small delay ensures the DOM layout updates after hiding form (helps on fast toggles)
    setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;

      const NAV_HEIGHT = 90; // match your CSS .top-nav height + extra spacing (adjust if needed)
      const top = el.getBoundingClientRect().top + window.pageYOffset - NAV_HEIGHT;

      window.scrollTo({
        top,
        behavior: "smooth",
      });
    }, 50);
  };

  return (
    <div className="welcome-container">
      {/* ---------- NAVIGATION ---------- */}
      <nav className="top-nav">
        <div className="nav-left">
          <span className="logo">🎵 SoundEventPro</span>
        </div>

        <div className="nav-center">
          {/* use onClick to run scroll helper and prevent default anchor behavior */}
          <a href="#home" className="nav-link" onClick={(e) => scrollToSection(e, "home")}>
            Home
          </a>
          <a href="#about" className="nav-link" onClick={(e) => scrollToSection(e, "about")}>
            About
          </a>
          <a href="#contact" className="nav-link" onClick={(e) => scrollToSection(e, "contact")}>
            Contact
          </a>
        </div>

        <div className="nav-right">
          <button
            className="nav-btn"
            onClick={() => {
              setShowForm(true);
              setIsSignUp(false);
            }}
          >
            Log In
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

      {/* ---------- CONTENT ---------- */}
      <div className="content">
        {!showForm && (
          <>
            {/* HOME SECTION */}
            <section id="home" className="hero-section">
              <h1>Schedule Your Perfect Sound Experience</h1>
              <p>
                Professional audio solutions for events of any size.{" "}
                <br />
                From intimate gatherings to massive concerts, we make your sound dreams reality.
              </p>
              <button className="primary-btn" onClick={handleGetStarted}>
                Get Started Today
              </button>
            </section>

            {/* ABOUT SECTION */}
            <section id="about" className="info-section">
              <h2>About</h2>
              <p>
                Our system simplifies the process of scheduling and reserving sound equipment.
                Manage your events, equipment, and sound team with ease — all in one platform.
              </p>
            </section>

            {/* CONTACT SECTION */}
            <section id="contact" className="info-section">
              <h2>Contact</h2>
              <p>
                Have questions or need help? Reach out to our support team at{" "}
                <strong>support@soundeventpro.com</strong>.
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
