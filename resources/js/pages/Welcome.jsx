import React, { useState, useEffect } from "react";
import SignUp from "../sign/SignUp";
import SignIn from "../sign/SignIn";
import "../../css/pages/Welcome.css";
import logo from "../../img/logo.png";
import aboutImage from "../../img/about.jpg";
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

export default function Welcome() {
  const [showForm, setShowForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const handleGetStarted = () => {
    setShowForm(true);
    setIsSignUp(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (e, id) => {
    e.preventDefault();
    setShowForm(false);
    const el = document.getElementById(id);
    if (el) {
      const navHeight = 80;
      const y = el.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      const sections = ["home", "about", "contact"];
      const scrollPos = window.scrollY + window.innerHeight / 3;

      sections.forEach((section) => {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop - 100;
          const bottom = top + el.offsetHeight;
          if (scrollPos >= top && scrollPos < bottom) {
            setActiveSection(section);
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="welcome-container">
      {/* ===================== NAVIGATION BAR ===================== */}
      <nav
        className={`top-nav ${
          scrolled ? "nav-scrolled" : "nav-transparent"
        }`}
      >
        <div className="nav-left">
          <img src={logo} alt="Event Sound Pro" className="nav-logo" />
          <span className="logo-text">Event Sound Pro</span>
        </div>
        <div className="nav-right">
          <a
            href="#home"
            className={activeSection === "home" ? "active" : ""}
            onClick={(e) => scrollToSection(e, "home")}
          >
            Home
          </a>
          <a
            href="#about"
            className={activeSection === "about" ? "active" : ""}
            onClick={(e) => scrollToSection(e, "about")}
          >
            About
          </a>
          <a
            href="#contact"
            className={activeSection === "contact" ? "active" : ""}
            onClick={(e) => scrollToSection(e, "contact")}
          >
            Contact
          </a>
        </div>
      </nav>

      {/* ===================== MAIN CONTENT ===================== */}
      <div className={`content ${showForm ? "blurred" : ""}`}>
        {/* HERO SECTION */}
        <section id="home" className="hero-section">
          <h1>Schedule Your Perfect Sound Experience</h1>
          <p>
            Professional audio solutions for events of any size.
            <br />
            From intimate gatherings to massive concerts, we make your sound
            dreams reality.
          </p>
          <button className="primary-btn" onClick={handleGetStarted}>
            Get Started Today
          </button>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="about-section">
          <div className="about-content">
            <div className="about-text">
              <h2>About Event Sound Pro</h2>
              <p>
                With over 15 years of experience in professional audio
                production, we’ve powered thousands of successful events across
                the globe. Our team of certified audio engineers and
                state-of-the-art equipment ensures every note, every word, and
                every moment is heard with crystal clarity.
              </p>
              <p>
                From intimate weddings to massive festivals, corporate
                presentations to live concerts — we bring the same level of
                dedication and expertise to every project. Your sound is our
                passion.
              </p>
              <button
                className="about-btn"
                onClick={() => {
                  setShowForm(true);
                  setIsSignUp(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Start Your Project
              </button>
            </div>

            <div className="about-image">
              <img src={aboutImage} alt="Audio mixing console" />
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="contact-section">
          <h1 className="section-title">Get In Touch</h1>
          <p className="section-subtitle">
            Ready to make your event sound amazing? Let’s discuss your needs.
          </p>

          <div className="contact-container">
            <div className="contact-info">
              <h3>Contact Information</h3>
              <ul>
                <li>
                  <FaPhone className="icon" /> +63 936 681 1261
                </li>
                <li>
                  <FaEnvelope className="icon" /> grouptwo@gmail.com
                </li>
                <li>
                  <FaMapMarkerAlt className="icon" /> Poblacion, Trinidad,
                  Bohol
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* FOOTER SECTION */}
        <footer className="footer-section">
          <div className="footer-container">
            <div className="footer-col">
              <h3 className="footer-logo">
                Event<span>Sound Pro</span>
              </h3>
              <p>Professional audio solutions for unforgettable events.</p>
            </div>

            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul>
                <li>
                  <a href="#home">Home</a>
                </li>
                <li>
                  <a href="#about">About</a>
                </li>
                <li>
                  <a href="#contact">Contact</a>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Services</h4>
              <ul>
                <li>Event Scheduling</li>
                <li>Equipment Rentals</li>
                <li>On-Site Support</li>
                <li>Custom Packages</li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Contact</h4>
              <ul>
                <li>+63 912 345 6789</li>
                <li>grouptwo@gmail.com</li>
                <li>Poblacion, Trinidad, Bohol</li>
              </ul>
            </div>
          </div>

          <hr className="footer-divider" />
          <p className="footer-bottom">
            © {new Date().getFullYear()} Event Sound Pro. All rights reserved.
          </p>
        </footer>
      </div>

      {/* ===================== SIGNUP / SIGNIN FORM OVERLAY ===================== */}
      {showForm && (
        <div className="form-overlay">
          <div className="form-wrapper">
            <button
              className="close-form"
              onClick={() => setShowForm(false)}
              title="Close"
            >
              ✕
            </button>
            {isSignUp ? (
              <SignUp onSwitchToSignIn={() => setIsSignUp(false)} />
            ) : (
              <SignIn onSwitchToSignUp={() => setIsSignUp(true)} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
