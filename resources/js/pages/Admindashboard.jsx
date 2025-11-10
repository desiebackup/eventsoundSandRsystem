import React, { useState } from "react";
import {
  NavLink,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaBoxOpen,
  FaCalendarAlt,
  FaCreditCard,
  FaEnvelope,
  FaChevronDown,
  FaClipboardList,
} from "react-icons/fa";
import "../../css/pages/AdminDashboard.css";
import logo from "../../img/logo.png";
import avatarDefault from "../../img/avatar.png"; // ✅ Default avatar
import Home from "../adminNavigation/Home";
import ManageUsers from "../adminNavigation/ManageUsers";
import ManageServices from "../adminNavigation/ManageServices";
import ManageReservations from "../adminNavigation/ManageReservations";
import Payments from "../adminNavigation/Payments";
import Inventory from "../adminNavigation/Inventory";
import ViewProfile from "../adminNavigation/dropdown/ViewProfile";
import ViewAddAdmin from "../adminNavigation/dropdown/ViewAddAdmin";
import Message from "../adminNavigation/Message"; // ✅ Added Messages Page

function AdminDropdown({ user = {}, onLogout, onProfile, onAddAdmin }) {
  const [open, setOpen] = useState(false);

  const toggleDropdown = () => setOpen((prev) => !prev);
  const closeDropdown = () => setOpen(false);

  return (
    <div className="admin-dropdown">
      {/* Avatar and Name */}
      <button className="dropdown-toggle" onClick={toggleDropdown}>
        <img
          src={user?.avatar || avatarDefault}
          alt="Admin Avatar"
          className="admin-avatar"
        />
        <span className="admin-name">{user?.username || "Admin"}</span>
        <FaChevronDown className={`dropdown-arrow ${open ? "open" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <ul className="dropdown-menu" onMouseLeave={closeDropdown}>
          <li
            onClick={() => {
              onProfile();
              closeDropdown();
            }}
          >
            View Profile
          </li>
          <li
            onClick={() => {
              onAddAdmin();
              closeDropdown();
            }}
          >
            View/Add Admin
          </li>
          <li
            className="logout"
            onClick={() => {
              onLogout();
              closeDropdown();
            }}
          >
            Logout
          </li>
        </ul>
      )}
    </div>
  );
}

/* ==============================
   MAIN ADMIN DASHBOARD
============================== */
export default function AdminDashboard({ user = {} }) {
  const navigate = useNavigate();

  const handleLogout = () => navigate("/", { replace: true });
  const handleProfile = () => navigate("/admindashboard/viewprofile");
  const handleAddAdmin = () => navigate("/admindashboard/viewaddadmin");

  return (
    <div className="dashboard-wrap">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-top">
          <div className="logoo-frame">
            <img src={logo} alt="EventSound Logo" className="logoo" />
          </div>
          <div className="brand">
            <span className="brand-text">Event Sound Pro</span>
            <hr />
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/admindashboard/home"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <FaHome className="nav-icon" /> <span>Home</span>
          </NavLink>

          <NavLink
            to="/admindashboard/manageusers"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <FaUsers className="nav-icon" /> <span>Users</span>
          </NavLink>

          <NavLink
            to="/admindashboard/manageservices"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <FaBoxOpen className="nav-icon" /> <span>Service Packages</span>
          </NavLink>

          <NavLink
            to="/admindashboard/managereservations"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <FaCalendarAlt className="nav-icon" /> <span>Reservations</span>
          </NavLink>

          <NavLink
            to="/admindashboard/payments"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <FaCreditCard className="nav-icon" /> <span>Payments</span>
          </NavLink>

          <NavLink
            to="/admindashboard/inventory"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <FaClipboardList className="nav-icon" /> <span>Inventory</span>
          </NavLink>

          {/* ✅ Added Messages link */}
          <NavLink
            to="/admindashboard/messages"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <FaEnvelope className="nav-icon" /> <span>Messages</span>
          </NavLink>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-main">
        <header className="topbar">
          <div className="topbar-left">
            <h2>Admin Panel</h2>
          </div>

          <div className="topbar-right">
            <AdminDropdown
              user={user}
              onLogout={handleLogout}
              onProfile={handleProfile}
              onAddAdmin={handleAddAdmin}
            />
          </div>
        </header>

        <section className="content-area">
          <Routes>
            <Route index element={<Home />} />
            <Route path="home" element={<Home />} />
            <Route path="manageusers" element={<ManageUsers />} />
            <Route path="manageservices" element={<ManageServices />} />
            <Route path="managereservations" element={<ManageReservations />} />
            <Route path="payments" element={<Payments />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="messages" element={<Message />} /> {/* ✅ Added */}
            <Route path="viewprofile" element={<ViewProfile />} />
            <Route path="viewaddadmin" element={<ViewAddAdmin />} />
            <Route path="*" element={<Navigate to="home" replace />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}