import React from "react";
import { NavLink, Routes, Route } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaBoxOpen,
  FaCalendarAlt,
  FaCreditCard,
  FaCog,
} from "react-icons/fa";
import "../../css/pages/AdminDashboard.css";

// Import your admin pages
import AdminHome from "../adminNavigation/AdminHome";
import ManageUsers from "../adminNavigation/ManageUsers";
import ManageServices from "../adminNavigation/ManageServices";
import ManageReservations from "../adminNavigation/ManageReservations";
import Payments from "../adminNavigation/Payments";

export default function Admindashboard({ admin }) {
  return (
    <div className="dashboard-wrap">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-top">
          <div className="brand">
            <span className="brand-icon">🎧</span>
            <span className="brand-text">EventSound Admin</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/admin/home"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <FaHome className="nav-icon" /> <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <FaUsers className="nav-icon" /> <span>Manage Users</span>
          </NavLink>

          <NavLink
            to="/admin/services"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <FaBoxOpen className="nav-icon" /> <span>Service Packages</span>
          </NavLink>

          <NavLink
            to="/admin/reservations"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <FaCalendarAlt className="nav-icon" /> <span>Reservations</span>
          </NavLink>

          <NavLink
            to="/admin/payments"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <FaCreditCard className="nav-icon" /> <span>Payments</span>
          </NavLink>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <FaCog className="nav-icon" /> <span>Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <small>© {new Date().getFullYear()} EventSound</small>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-main">
        <header className="topbar">
          <div className="topbar-left">
            <h2>Admin Panel</h2>
          </div>

          <div className="topbar-right">
            <div className="user-chip">
              <img
                src="/images/admin-avatar.png"
                alt="Admin avatar"
                className="user-avatar"
              />
              <span className="user-name">{admin?.name || "Admin"}</span>
            </div>
          </div>
        </header>

        <section className="content-area">
          <Routes>
            <Route path="/home" element={<AdminHome />} />
            <Route path="/users" element={<ManageUsers />} />
            <Route path="/services" element={<ManageServices />} />
            <Route path="/reservations" element={<ManageReservations />} />
            <Route path="/payments" element={<Payments />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}
