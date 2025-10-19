import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/adminnav/Home.css";

export default function Home() {
  const [stats, setStats] = useState({ totals: { users: 0, reservations: 0, payments: 0, services: 0 }, recent: [] });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return; // don't attempt unauthenticated fetch

    // ensure axios default header is set
    if (!axios.defaults.headers.common['Authorization']) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    axios.get('/api/admin/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error('Failed to fetch stats', err));
  }, []);

  return (
    <div className="admin-page">
      <h2>Dashboard Overview</h2>

      <div className="stats-grid">
        <div className="stat-card users">
          <h3>Users</h3>
          <p className="stat-number">{stats.totals.users}</p>
        </div>
        <div className="stat-card reservations">
          <h3>Reservations</h3>
          <p className="stat-number">{stats.totals.reservations}</p>
        </div>
        <div className="stat-card payments">
          <h3>Payments</h3>
          <p className="stat-number">{stats.totals.payments}</p>
        </div>
        <div className="stat-card services">
          <h3>Services</h3>
          <p className="stat-number">{stats.totals.services}</p>
        </div>
      </div>

      <div className="recent-section">
        <h3>Recent Activities</h3>
        <ul>
          {stats.recent.length === 0 && <li>No recent activity</li>}
          {stats.recent.map((act, i) => (
            <li key={i}>{act.message} <span className="muted">{new Date(act.time).toLocaleString()}</span></li>
          ))}
        </ul>
      </div>
    </div>
  );
}
