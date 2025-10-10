import React, { useEffect, useState, useRef } from "react";
import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import Home from "../userNavigation/Home";
import Reservation from "../userNavigation/Reservation";
import ServicePackage from "../userNavigation/ServicePackage";
import Payments from "../userNavigation/Payments";
import "../../css/pages/Userdashboard.css";
import logo from "../../img/logo.png";
import avatar from "../../img/avatar.png";
import Profile from "../userNavigation/dropdown/Profile";
import Terms from "../userNavigation/dropdown/Terms";
import PaymentPolicy from "../userNavigation/dropdown/PaymentPolicy";
import ContactUs from "../userNavigation/dropdown/ContactUs";

export default function Userdashboard() {
  const [user, setUser] = useState({ firstname: "", lastname: "" });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/signin");
          return;
        }

        const res = await axios.get("http://127.0.0.1:8000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user:", err);
        navigate("/signin");
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.removeItem("token");
      navigate("/signin");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Dropdown toggle
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="user-dashboard">
      {/* --- TOP NAVBAR --- */}
      <header className="top-navbar">
        <div className="navbar-left">
          <img src={logo} alt="user" className="logo" />
        </div>

        <nav className="navbar-links">
          <NavLink to="/userdashboard/home" className="nav-item">
            Home
          </NavLink>
          <NavLink to="/userdashboard/reservations" className="nav-item">
            Reservation
          </NavLink>
          <NavLink to="/userdashboard/servicepackage" className="nav-item">
            Service Package
          </NavLink>
          <NavLink to="/userdashboard/payments" className="nav-item">
            Payment
          </NavLink>
        </nav>

        {/* --- USER DROPDOWN --- */}
        <div className="navbar-right" ref={dropdownRef}>
          <div className="user-info" onClick={toggleDropdown}>
            <img src={avatar} alt="EventSound Logo" className="user-avatar" />
            <span className="user-name">
              {user.firstname} {user.lastname}
            </span>
            <span className="dropdown-arrow">▾</span>
          </div>

          {isDropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={() => navigate("/userdashboard/profile")}>
                Profile
              </button>
              <button onClick={() => navigate("/userdashboard/terms")}>
                Terms & Conditions
              </button>
              <button onClick={() => navigate("/userdashboard/paymentpolicy")}>
                Payment Policy
              </button>
              <button onClick={() => navigate("/userdashboard/contact")}>
                Contact Us
              </button>
              <hr />
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* --- PAGE CONTENT --- */}
      <main className="dashboard-content">
        <Routes>
          <Route path="home" element={<Home />} />
          <Route path="reservations" element={<Reservation />} />
          <Route path="servicepackage" element={<ServicePackage />} />
          <Route path="payments" element={<Payments />} />
          <Route path="profile" element={<Profile />} />
          <Route path="terms" element={<Terms />} />
          <Route path="paymentpolicy" element={<PaymentPolicy />} />
          <Route path="contact" element={<ContactUs />} />
        </Routes>
      </main>
    </div>
  );
}
