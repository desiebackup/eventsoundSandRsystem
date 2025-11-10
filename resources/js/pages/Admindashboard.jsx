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
import avatarDefault from "../../img/admin-avatar.png"; // ✅ Default avatar
import Home from "../adminNavigation/Home";
import ManageUsers from "../adminNavigation/ManageUsers";
import ManageServices from "../adminNavigation/ManageServices";
import ManageReservations from "../adminNavigation/ManageReservations";
import Payments from "../adminNavigation/Payments";
import Inventory from "../adminNavigation/Inventory";
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
        {/* Prefer first + last name, then name, then username, else fall back to 'Admin' */}
        {(() => {
          // Support multiple possible user field shapes returned by the API:
          // prefer first_name / last_name, then firstname / lastname, then name, then username
          const first = user?.first_name ?? user?.firstname ?? user?.name ?? user?.username ?? "";
          const last = user?.last_name ?? user?.lastname ?? "";
          const combined = [first, last].filter(Boolean).join(" ").trim();
          const displayName = combined || user?.name || user?.username || "Admin";
          return <span className="admin-name">{displayName}</span>;
        })()}
        <FaChevronDown className={`dropdown-arrow ${open ? "open" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <ul className="dropdown-menu" onMouseLeave={closeDropdown}>
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

  return (
    <div className="dashboard-wrap">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-top">
          <div className="logoo-frame">
            <img src={logo} alt="EventSound Logo" className="logoo" />
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
            to="/admindashboard/users"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <FaUsers className="nav-icon" /> <span>Users</span>
          </NavLink>

          <NavLink
            to="/admindashboard/servicepackages"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <FaBoxOpen className="nav-icon" /> <span>Service Packages</span>
          </NavLink>

          <NavLink
            to="/admindashboard/reservations"
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
            />
          </div>
        </header>

        <section className="content-area">
          <Routes>
            <Route index element={<Home />} />
            <Route path="home" element={<Home />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="servicepackages" element={<ManageServices />} />
            <Route path="reservations" element={<ManageReservations />} />
            <Route path="payments" element={<Payments />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="messages" element={<Message />} /> {/* ✅ Added */}
            <Route path="*" element={<Navigate to="home" replace />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}