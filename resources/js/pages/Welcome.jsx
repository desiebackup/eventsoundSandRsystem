import React, { useState, useEffect } from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import SignUp from "../sign/SignUp";
import SignIn from "../sign/SignIn";
import "../../css/pages/Welcome.css";

import logo from "../../img/eventsoundpro-logo.png";
import about1 from "../../img/about1.jpg";
import about2 from "../../img/about2.jpg";
import about3 from "../../img/about3.jpg";
import about4 from "../../img/about4.jpg";
import about5 from "../../img/about5.jpg";


export default function Welcome() {
  const [showForm, setShowForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = [about1, about2, about3, about4, about5];

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
      setScrolled(window.scrollY > 20);

      const sections = ["home", "about", "contact"];
      let current = "home";
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 100) {
          current = id;
        }
      });
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-slide the about images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal-left, .reveal-bottom");

    const handleScrollAnimation = () => {
      for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const revealTop = reveals[i].getBoundingClientRect().top;
        const revealPoint = 150;

        if (revealTop < windowHeight - revealPoint) {
          reveals[i].classList.add("active");
        } else {
          reveals[i].classList.remove("active");
        }
      }
    };

    window.addEventListener("scroll", handleScrollAnimation);
    handleScrollAnimation();
    return () => window.removeEventListener("scroll", handleScrollAnimation);
  }, []);


  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <div className="welcome-container">
      {/* ===================== NAVIGATION BAR ===================== */}
      <nav className={`top-nav ${scrolled ? "nav-scrolled" : "nav-transparent"}`}>
        <div className="nav-left">
          <a href="/" onClick={() => window.location.reload()} className="logo-link">
            <img src={logo} alt="Event Sound Pro Logo" className="nav-logo" />
          </a>
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
          <div className="overlay-lights"></div>

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

        {/* ABOUT SECTION */}
        <section id="about" className="about-section">
          <div className="about-content">
            <div className="about-text reveal-left">
              <h2>About Event Sound Pro</h2>
              <p>
                With over 15 years of experience in professional audio production,
                we’ve powered thousands of successful events across the globe.
                Our team of certified audio engineers and state-of-the-art equipment
                ensures every note, every word, and every moment is heard with crystal clarity.
              </p>
              <p>
                From intimate weddings to massive festivals, corporate presentations
                to live concerts — we bring the same level of dedication and expertise
                to every project. Your sound is our passion.
              </p>

              <ul className="about-features">
                <li>🎵 Premium Sound Quality</li>
                <li>💡 Creative Lighting Effects</li>
                <li>👨‍🔧 Expert Audio Engineers</li>
                <li>🎤 Custom Packages for Every Event</li>
              </ul>

              <blockquote className="about-quote">
                “Your event, our passion — bringing your sound to life.”
              </blockquote>

              <div className="about-stats reveal-bottom">
                <div><h3>15+</h3><p>Years Experience</p></div>
                <div><h3>1000+</h3><p>Events Powered</p></div>
                <div><h3>500+</h3><p>Happy Clients</p></div>
              </div>
              
              <button className="about-btn" onClick={handleGetStarted}>
                Start Your Project
              </button>
            </div>

            {/* SLIDER SECTION */}
            <div className="about-slider">
              <div
                className="slider-wrapper"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {slides.map((img, i) => (
                  <img key={i} src={img} alt={`About slide ${i + 1}`} />
                ))}
              </div>

              <button className="prev" onClick={prevSlide}>❮</button>
              <button className="next" onClick={nextSlide}>❯</button>

              <div className="dots">
                {slides.map((_, i) => (
                  <span
                    key={i}
                    className={`dot ${i === currentIndex ? "active" : ""}`}
                    onClick={() => setCurrentIndex(i)}
                  ></span>
                ))}
              </div>
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
                <li><FaPhone className="icon" /> +63 936 681 1261</li>
                <li><FaEnvelope className="icon" /> grouptwo@gmail.com</li>
                <li><FaMapMarkerAlt className="icon" /> Poblacion, Trinidad, Bohol</li>
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
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
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

      {/* SIGNUP / SIGNIN FORM */}
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
