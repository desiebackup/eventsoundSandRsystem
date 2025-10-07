import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import {
  FaHome,
  FaCalendarAlt,
  FaBoxOpen,
  FaCreditCard,
  FaUserCog,
  FaFileContract,
  FaSignOutAlt,
} from "react-icons/fa";
import Home from "../userNavigation/Home";
import SoundPackage from "../userNavigation/SoundPackage";
import Paymenthistory from "../userNavigation/Paymenthistory";
import Termsandcondition from "../userNavigation/Termsandcondition";
import "../../css/pages/UserDashboard.css";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";

const Userdashboard = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.reload(); // Refresh to redirect back to login or welcome
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Router>
      <div className="user-dashboard">
        {/* ===== Sidebar ===== */}
        <aside className="sidebar">
          <h2 className="sidebar-title">Event Sound System</h2>
          <ul className="nav-links">
            <li>
              <NavLink to="/home" className={({ isActive }) => (isActive ? "active" : "")}>
                <FaHome className="icon" /> Dashboard
              </NavLink>
            </li>

            <li>
              <NavLink to="/reservations" className={({ isActive }) => (isActive ? "active" : "")}>
                <FaCalendarAlt className="icon" /> My Reservations
              </NavLink>
            </li>

            <li>
              <NavLink to="/soundpackage" className={({ isActive }) => (isActive ? "active" : "")}>
                <FaBoxOpen className="icon" /> Service Package
              </NavLink>
            </li>

            <li>
              <NavLink to="/payment" className={({ isActive }) => (isActive ? "active" : "")}>
                <FaCreditCard className="icon" /> Payment History
              </NavLink>
            </li>

            <li>
              <NavLink to="/profile" className={({ isActive }) => (isActive ? "active" : "")}>
                <FaUserCog className="icon" /> Profile Settings
              </NavLink>
            </li>

            <li>
              <NavLink to="/termsandcondition" className={({ isActive }) => (isActive ? "active" : "")}>
                <FaFileContract className="icon" /> Terms & Condition
              </NavLink>
            </li>

            <li>
              <button className="logout-btn" onClick={handleLogout}>
                <FaSignOutAlt className="icon" /> Logout
              </button>
            </li>
          </ul>
        </aside>

        {/* ===== Main Content ===== */}
        <main className="main-content">
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/reservations" element={<Home />} /> {/* Replace with MyReservations component */}
            <Route path="/soundpackage" element={<SoundPackage />} />
            <Route path="/payment" element={<Paymenthistory />} />
            <Route path="/profile" element={<Termsandcondition />} /> {/* Replace with Profile component */}
            <Route path="/termsandcondition" element={<Termsandcondition />} />
            <Route path="*" element={<Home />} /> {/* Default route */}
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default Userdashboard;
