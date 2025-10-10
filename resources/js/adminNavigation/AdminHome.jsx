import React from "react";
import "../../css/adminnav/AdminHome.css";

export default function AdminHome() {
  return (
    <div className="admin-page">
      <h2>Dashboard Overview</h2>

      <div className="stats-grid">
        <div className="stat-card users">
          <h3>Users</h3>
          <p className="stat-number">120</p>
        </div>
        <div className="stat-card reservations">
          <h3>Reservations</h3>
          <p className="stat-number">45</p>
        </div>
        <div className="stat-card payments">
          <h3>Payments</h3>
          <p className="stat-number">₱35,000</p>
        </div>
        <div className="stat-card services">
          <h3>Services</h3>
          <p className="stat-number">6</p>
        </div>
      </div>

      <div className="recent-section">
        <h3>Recent Activities</h3>
        <ul>
          <li>User <b>John Doe</b> made a reservation for <b>Wedding Event</b>.</li>
          <li>Service package <b>Premium Sound</b> updated.</li>
          <li>Payment received from <b>Mary Smith</b>.</li>
        </ul>
      </div>
    </div>
  );
}
