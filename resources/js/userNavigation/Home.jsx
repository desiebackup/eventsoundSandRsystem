import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiCalendar } from "react-icons/fi";
import "../../css/usernav/Home.css";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:8000";

const Home = () => {
  const [reservations, setReservations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [userName, setUserName] = useState("");
  const [recentActivity, setRecentActivity] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/welcome");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    const fetchAll = async () => {
      try {
        const [userRes, reservationsRes, paymentsRes] = await Promise.all([
          axios.get("/api/user", { headers }), // your user endpoint
          axios.get("/api/reservations", { headers }), // reservations
          axios.get("/api/user/payments", { headers }), // payments
        ]);

        // USER NAME (defensive)
        const user = userRes?.data || {};
        setUserName(
          user.firstname ? `${user.firstname} ${user.lastname}` : user.name || "User"
        );

        // RESERVATIONS (defensive)
        const resData =
          Array.isArray(reservationsRes.data)
            ? reservationsRes.data
            : Array.isArray(reservationsRes.data.data)
            ? reservationsRes.data.data
            : Array.isArray(reservationsRes.data.reservations)
            ? reservationsRes.data.reservations
            : [];
        setReservations(resData);

        // PAYMENTS (defensive)
        const payData =
          Array.isArray(paymentsRes.data)
            ? paymentsRes.data
            : Array.isArray(paymentsRes.data.data)
            ? paymentsRes.data.data
            : Array.isArray(paymentsRes.data.payments)
            ? paymentsRes.data.payments
            : [];
        setPayments(payData);

        // Load local activity if any
        const activity = JSON.parse(localStorage.getItem("user_activity")) || [];
        setRecentActivity(activity);

        // debug logs so you can inspect response
        // open browser console and check the shapes
        // eslint-disable-next-line no-console
        console.log("user:", userRes.data, "reservations:", resData, "payments:", payData);
      } catch (err) {
        console.error("Error fetching user/reservations/payments:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/welcome");
        }
      }
    };

    fetchAll();
  }, [navigate]);

  // filters
  const approvedEvents = Array.isArray(reservations)
    ? reservations.filter((r) => String(r.status).toLowerCase() === "approved")
    : [];
  const pendingEvents = Array.isArray(reservations)
    ? reservations.filter((r) => String(r.status).toLowerCase() === "pending")
    : [];

  // ===== TOTAL PAYMENT calculation (from payments array) =====
  // Rules:
  // - sum every payment.down_payment
  // - if payment.status is 'paid' (fully paid) add payment.balance as well
  // - ignore refunded/canceled payments
  const totalPayment = Array.isArray(payments)
    ? payments.reduce((acc, p) => {
        // ensure numeric values
        const status = String(p.status || "").toLowerCase();
        const down = Number(p.down_payment ?? p.down ?? 0) || 0;
        // balance field might be stored or could be total_price - down
        let balance = 0;
        if (p.balance !== undefined && p.balance !== null) {
          balance = Number(p.balance) || 0;
        } else if (p.total_price !== undefined && p.total_price !== null) {
          balance = (Number(p.total_price) || 0) - down;
        }

        // always add downpayment (actual paid amount)
        let add = down;

        // if fully-paid, add remaining balance
        if (status === "paid" || status === "paid in full") {
          add += balance;
        }

        // skip refunded / canceled
        if (status === "refunded" || status === "canceled") {
          return acc;
        }

        return acc + add;
      }, 0)
    : 0;

  const totalPaymentFormatted = totalPayment.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // navigation helpers
  const goToReservationPage = () => {
    navigate("/user/reservation");
  };

  const handleCardClick = (type) => {
    if (type === "approved") {
      setFilteredReservations(approvedEvents);
      setFilterType("Approved");
    } else if (type === "pending") {
      setFilteredReservations(pendingEvents);
      setFilterType("Pending");
    }
  };

  const resetFilter = () => {
    setFilteredReservations([]);
    setFilterType("");
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Welcome Back, {userName || "User"} 👋</h1>

      <div className="home-banner">
        <div>
          <h2>Last-minute prep? No problem</h2>
          <p>We are here to make sure every beat, word, and vibe comes alive.</p>
        </div>
        <button className="schedule-btn" onClick={goToReservationPage}>
          <FiCalendar className="icon" />
          Schedule New Event
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card clickable" onClick={() => handleCardClick("approved")}>
          <h3>Upcoming Events</h3>
          <p className="stat-value">{approvedEvents.length}</p>
          <span className="stat-note">Approved and ready</span>
        </div>

        <div className="stat-card clickable" onClick={() => handleCardClick("pending")}>
          <h3>Active Services</h3>
          <p className="stat-value">{pendingEvents.length}</p>
          <span className="stat-note yellow">Pending admin approval</span>
        </div>

        <div className="stat-card clickable">
          <h3>Total Payment</h3>
          <p className="stat-value money">₱ {totalPaymentFormatted}</p>
          <span className="stat-note gold">Down payments + fully paid balances</span>
        </div>
      </div>

      {/* Filtered reservations view */}
      {filteredReservations.length > 0 && (
        <div className="section-card">
          <div className="section-header">
            <h2>{filterType === "Approved" ? "Approved Reservations" : "Pending Reservations"}</h2>
            <button className="view-all" onClick={resetFilter}>Back →</button>
          </div>

          {filteredReservations.map((item) => (
            <div key={item.id} className="reservation-item">
              <div className="reservation-date">
                {item.call_date ? new Date(item.call_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
              </div>
              <div className="reservation-details">
                <h3>{item.event_name}</h3>
                <p>{item.service_name || item.service?.name || "Service Package"}</p>
                <span className="reservation-time">
                  {item.start_time || "—"} {item.end_time ? `- ${item.end_time}` : ""}
                </span>
              </div>
              <div className="reservation-status">{item.status}</div>
            </div>
          ))}
        </div>
      )}

      <div className="section-card">
        <h2>Recent Activity</h2>
        {recentActivity.length > 0 ? (
          recentActivity.map((item, i) => (
            <div key={i} className="activity-row">
              <span className={`activity-icon ${item.type}`}></span>
              <p dangerouslySetInnerHTML={{ __html: item.message }} />
              <span className="activity-time">{item.time}</span>
            </div>
          ))
        ) : (
          <p className="no-activity">No recent activity yet.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
