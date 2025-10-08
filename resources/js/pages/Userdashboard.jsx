import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaBoxOpen, FaCreditCard, FaSignOutAlt } from "react-icons/fa";
import axios from "axios";
import Home from "../userNavigation/Home";
import Reservation from "../userNavigation/Reservation";
import ServicePackage from "../userNavigation/ServicePackage";
import Profile from "../userNavigation/Profile";
import Logout from "../userNavigation/Logout";
import "../../css/pages/UserDashboard.css";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:8000";

const Userdashboard = () => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("/logout"); // Laravel Breeze logout endpoint
      setShowLogoutConfirm(false);
      navigate("/logout"); // Redirect to logout confirmation page
    } catch (error) {
      console.error("Logout failed:", error);
      alert("An error occurred during logout. Please try again.");
    }
  };

  return (
    <div className="user-dashboard">
      {/* ===== Sidebar ===== */}
      <aside className="sidebar">
        <h2 className="sidebar-title">Event Sound System</h2>
        <ul className="nav-links">
          <li>
            <NavLink to="/home" className={({ isActive }) => (isActive ? "active" : "")}>
              <FaHome className="icon" /> Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/reservations" className={({ isActive }) => (isActive ? "active" : "")}>
              <FaCalendarAlt className="icon" /> Reservations
            </NavLink>
          </li>
          <li>
            <NavLink to="/servicepackage" className={({ isActive }) => (isActive ? "active" : "")}>
              <FaBoxOpen className="icon" /> Service Package
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile" className={({ isActive }) => (isActive ? "active" : "")}>
              <FaCreditCard className="icon" /> Profile
            </NavLink>
          </li>
          <li>
            <button className="logout-btn" onClick={() => setShowLogoutConfirm(true)}>
              <FaSignOutAlt className="icon" /> Logout
            </button>
          </li>
        </ul>
      </aside>

      {/* ===== Main Content ===== */}
      <main className="main-content">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/reservations" element={<Reservation />} />
          <Route path="/servicepackage" element={<ServicePackage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      {/* ===== Logout Confirmation Modal ===== */}
      {showLogoutConfirm && (
        <div className="logout-modal">
          <div className="logout-dialog">
            <div className="logout-icon">🔒</div>
            <h3>Are you sure you want to log out?</h3>
            <p>Your session will end and you’ll be redirected to the login page.</p>
            <div className="logout-buttons">
              <button className="cancel-btn" onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const UserDashboardWrapper = () => (
  <Router>
    <Userdashboard />
  </Router>
);

export default UserDashboardWrapper;
