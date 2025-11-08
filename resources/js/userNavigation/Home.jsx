import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiCalendar } from "react-icons/fi";
import "../../css/usernav/Home.css";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:8000";

const Home = () => {
  const [reservations, setReservations] = useState([]);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  // Example stats
  const upcomingEvents = 4;
  const activeServices = 3;
  const totalSpend = 12500;

  // Example Upcoming Reservations (placeholder)
  const upcomingReservations = [
    {
      date: "DEC 15",
      title: "Annual Company Gala",
      package: "Premium PA System, 2 Technicians",
      time: "19:00 - 23:00 @ Grand Ballroom",
      status: "ok",
    },
    {
      date: "JAN 20",
      title: "New Product Launch (Awaiting Final Payment)",
      package: "Basic Package, On-Site Technician",
      time: "10:00 - 12:00 @ Conference Hall C",
      status: "warning",
    },
  ];

  // Example Recent Activity Log
  const recentActivity = [
    {
      type: "confirmation",
      message: "Technician assigned to *Annual Company Gala*.",
      time: "1 hour ago",
    },
    {
      type: "update",
      message: "**Service Package** updated for the *New Product Launch*.",
      time: "3 hours ago",
    },
    {
      type: "invoice",
      message: "New invoice **INV-2024-107** generated for Q4.",
      time: "1 day ago",
    },
  ];

  // Fetch reservations + user info
  useEffect(() => {
    axios
      .get("/api/user/reservations")
      .then((res) => {
        setReservations(res.data);
      })
      .catch((err) => console.error(err));

    axios
      .get("/api/user/profile")
      .then((res) => {
        setUserName(res.data.name); // API should return { name: "Imee" }
      })
      .catch((err) => console.error(err));
  }, []);

  // Navigate to Reservation page
  const goToReservationPage = () => {
    navigate("/reservation"); // ✅ Make sure your route exists
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Welcome Back, {userName || "User"}!</h1>

      {/* Banner */}
      <div className="home-banner">
        <div>
          <h2>Last-minute prep? No problem</h2>
          <p>We are here to make sure every word and beat is heard. Let’s get you set up.</p>
        </div>
        <button className="schedule-btn" onClick={goToReservationPage}>
          <FiCalendar className="icon" />
          Schedule New Event
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Upcoming Events</h3>
          <p className="stat-value">{upcomingEvents}</p>
          <span className="stat-note">+1 new this month</span>
        </div>

        <div className="stat-card">
          <h3>Active Services</h3>
          <p className="stat-value">{activeServices}</p>
          <span className="stat-note yellow">Awaiting confirmation</span>
        </div>

        <div className="stat-card">
          <h3>Total Spend</h3>
          <p className="stat-value money">₱ {totalSpend.toLocaleString()}</p>
          <span className="stat-note gold">Estimated total costs so far</span>
        </div>
      </div>

      {/* Upcoming Reservations */}
      <div className="section-card">
        <div className="section-header">
          <h2>Your Reservations</h2>
          <a href="#" className="view-all">View All →</a>
        </div>

        {upcomingReservations.map((item, index) => (
          <div key={index} className="reservation-item">
            <div className="reservation-date">{item.date}</div>
            <div className="reservation-details">
              <h3>{item.title}</h3>
              <p>{item.package}</p>
              <span className="reservation-time">{item.time}</span>
            </div>
            {item.status === "warning" && <span className="warn-icon">⚠️</span>}
            {item.status === "ok" && <span className="arrow-icon">›</span>}
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="section-card">
        <h2>Recent Activity</h2>
        {recentActivity.map((item, i) => (
          <div key={i} className="activity-row">
            <span className={`activity-icon ${item.type}`}></span>
            <p dangerouslySetInnerHTML={{ __html: item.message }} />
            <span className="activity-time">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
