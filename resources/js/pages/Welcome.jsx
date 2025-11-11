import React, { useState, useEffect } from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import SignUp from "../sign/SignUp";
import SignIn from "../sign/SignIn";
import "../../css/pages/Welcome.css";

import logo from "../../img/logo.png";
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
  const [isTransitioning, setIsTransitioning] = useState(true);

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

  // Navbar scroll effect
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

  // Smooth infinite auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
      setIsTransitioning(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleTransitionEnd = () => {
    if (currentIndex === slides.length) {
      // Instantly reset to the first slide (without animation)
      setIsTransitioning(false);
      setCurrentIndex(0);
    }
  };

  const nextSlide = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Reveal animations
  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal-left, .reveal-bottom");

    const handleScrollAnimation = () => {
      reveals.forEach((el) => {
        const windowHeight = window.innerHeight;
        const revealTop = el.getBoundingClientRect().top;
        const revealPoint = 150;

        if (revealTop < windowHeight - revealPoint) {
          el.classList.add("active");
        } else {
          el.classList.remove("active");
        }
      });
    };

    window.addEventListener("scroll", handleScrollAnimation);
    handleScrollAnimation();
    return () => window.removeEventListener("scroll", handleScrollAnimation);
  }, []);

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
          {["home", "about", "contact"].map((section) => (
            <a
              key={section}
              href={`#${section}`}
              className={activeSection === section ? "active" : ""}
              onClick={(e) => scrollToSection(e, section)}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </a>
          ))}
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
                Event Sound Pro is a complete event solutions provider specializing in professional sound, lighting, and production services.
                Our goal is to make every event — from private celebrations to large-scale programs — seamless, powerful, and unforgettable.
              </p>
              <p>
                We make planning easy with our <strong>Event Scheduling</strong> system that lets clients reserve their dates with confidence.
                Our wide range of <strong>Equipment Rentals</strong> ensures top-quality audio and lighting setups fit for any venue, from intimate gatherings to grand festivals.
              </p>
              <p>
                With reliable <strong>On-Site Support</strong>, our trained technicians and operators handle everything from setup to performance, guaranteeing flawless execution.
                We also offer <strong>Custom Packages</strong> tailored to your budget and needs — giving you full control over your event’s experience.
              </p>
              <p>
                At Event Sound Pro, we don’t just provide equipment — we provide excellence.
                Every event we power is built on precision, passion, and performance that your audience will remember.
              </p>

              <blockquote className="about-quote">
                “Your event, our passion — bringing your sound to life.”
              </blockquote>

              <button className="about-btn" onClick={handleGetStarted}>
                Start Your Project
              </button>
            </div>

            {/* SLIDER SECTION */}
            <div className="about-slider">
              <div
                className="slider-wrapper"
                style={{
                  transform: `translateX(-${currentIndex * 100}%)`,
                  transition: isTransitioning ? "transform 0.8s ease-in-out" : "none",
                }}
                onTransitionEnd={handleTransitionEnd}
              >
                {[...slides, slides[0]].map((img, i) => (
                  <img key={i} src={img} alt={`About slide ${i + 1}`} />
                ))}
              </div>

              <button className="prev" onClick={prevSlide}>❮</button>
              <button className="next" onClick={nextSlide}>❯</button>

              <div className="dots">
                {slides.map((_, i) => (
                  <span
                    key={i}
                    className={`dot ${i === (currentIndex % slides.length) ? "active" : ""}`}
                    onClick={() => setCurrentIndex(i)}
                  ></span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="contact-section">
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
      )}
    </div>
  );
}
