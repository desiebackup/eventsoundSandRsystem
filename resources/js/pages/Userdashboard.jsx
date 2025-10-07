import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaBoxOpen, FaCreditCard, FaUserCog } from "react-icons/fa";
import Home from "../userNavigation/Home";
import SoundPackage from "../userNavigation/SoundPackage";
import PaymentHistory from "../userNavigation/Paymenthistory";
import TermsAndCondition from "../userNavigation/Termsandcondition";
import "../../css/pages/UserDashboard.css";

const Userdashboard = () => {
  return (
    <Router>
      <div className="user-dashboard">
        {/* Sidebar */}
        <aside className="sidebar">
          <h2 className="sidebar-title">Event Sound System</h2>
          <ul>
            <li>
              <NavLink to="/home" className={({ isActive }) => (isActive ? "active" : "")}>
                <FaHome className="icon" /> Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/reservations" className={({ isActive }) => (isActive ? "active" : "")}>
                <FaCalendarAlt className="icon" /> My Reservations
              </NavLink>
            </li>
            <li>
              <NavLink to="/soundpackage" className={({ isActive }) => (isActive ? "active" : "")}>
                <FaBoxOpen className="icon" /> Sound Packages
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
          </ul>
        </aside>

        {/* Main content */}
        <main className="main-content">
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/soundpackage" element={<SoundPackage />} />
            <Route path="/payment" element={<PaymentHistory />} />
            <Route path="/termsandcondition" element={<TermsAndCondition />} />
            <Route path="*" element={<Home />} /> {/* default route */}
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default Userdashboard;
