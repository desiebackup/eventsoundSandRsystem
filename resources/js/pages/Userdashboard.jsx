import React, { useEffect, useState, useRef } from "react";
import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaChevronDown } from "react-icons/fa";
import Home from "../userNavigation/Home";
import Reservation from "../userNavigation/Reservation";
import ServicePackage from "../userNavigation/ServicePackage";
import Payments from "../userNavigation/Payments";
import logo from "../../img/eventsoundpro-logo.png";
import avatar from "../../img/avatar.png";
import Settings from "../userNavigation/dropdown/Settings";
import Terms from "../userNavigation/dropdown/Terms";
import PaymentPolicy from "../userNavigation/dropdown/PaymentPolicy";
import ContactUs from "../userNavigation/dropdown/ContactUs";
import ChatUs from "../userNavigation/dropdown/ChatUs";
import "../../css/design/Theme.css";
import "../../css/pages/Userdashboard.css";

export default function Userdashboard({ user: propUser }) {
  const [user, setUser] = useState(propUser || { firstname: "", lastname: "" });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDropdownItem, setSelectedDropdownItem] = useState(null);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    // If the parent App passed a user prop, use it. Otherwise fall back to fetching.
    const fetchUser = async () => {
      try {
        if (propUser) {
          setUser(propUser);
          return;
        }

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

  // Keep local user state in sync when the parent propUser changes (e.g. after profile update)
  useEffect(() => {
    if (propUser) setUser(propUser);
  }, [propUser]);

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
        <div className="logo-section">
        <div className="logo-frame">
        <img src={logo} alt="EventSound Logo" className="logo" />
     </div>
     </div>

        <nav className="navbar-links">
          <NavLink to="/userdashboard/home" className="nav-item">
            Home
          </NavLink>
          <NavLink to="/userdashboard/reservation" className="nav-item">
            Reservation
          </NavLink>
          <NavLink to="/userdashboard/servicepackage" className="nav-item">
            Service Package
          </NavLink>
          <NavLink to="/userdashboard/payment" className="nav-item">
            Payment
          </NavLink>
        </nav>

        {/* --- USER DROPDOWN --- */}
        <div className="navbar-right" ref={dropdownRef}>
          <div className={`user-info ${isDropdownOpen ? 'active' : ''}`} onClick={toggleDropdown}>
            {/* Show uploaded avatar when available, otherwise show default import */}
            <img
              src={user?.avatar ? `http://127.0.0.1:8000/storage/${user.avatar}` : avatar}
              alt="User"
              className="user-avatar"
            />
            <span className="user-name">
              {user.firstname} {user.lastname}
            </span>
            <FaChevronDown className="dropdown-arrow" />
          </div>

          {isDropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={() => { setSelectedDropdownItem('settings'); navigate("/userdashboard/settings/profile"); }} className={selectedDropdownItem === 'settings' ? 'selected' : ''}>
                Settings
              </button>
              <button onClick={() => { setSelectedDropdownItem('terms'); navigate("/userdashboard/terms"); }} className={selectedDropdownItem === 'terms' ? 'selected' : ''}>
                Terms & Conditions
              </button>
              <button onClick={() => { setSelectedDropdownItem('paymentpolicy'); navigate("/userdashboard/paymentpolicy"); }} className={selectedDropdownItem === 'paymentpolicy' ? 'selected' : ''}>
                Payment Policy
              </button>
              <button onClick={() => { setSelectedDropdownItem('contact'); navigate("/userdashboard/contact"); }} className={selectedDropdownItem === 'contact' ? 'selected' : ''}>
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
          <Route path="reservation" element={<Reservation />} />
          <Route path="servicepackage" element={<ServicePackage />} />
          <Route path="payment" element={<Payments />} />
          <Route path="settings/*" element={<Settings />} />

          <Route path="terms" element={<Terms />} />
          <Route path="paymentpolicy" element={<PaymentPolicy />} />
          <Route path="contact" element={<ContactUs />} />
        </Routes>

      </main>
      <ChatUs/>
    </div>
  );
}
