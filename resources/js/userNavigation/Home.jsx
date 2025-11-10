import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiCalendar } from "react-icons/fi";
import "../../css/usernav/Home.css";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:8000";

const Home = () => {
  const [reservations, setReservations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [userName, setUserName] = useState("");
  const [recentActivity, setRecentActivity] = useState([]);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalData, setModalData] = useState([]);

  const navigate = useNavigate();

  // --- FETCH DATA ---
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
          axios.get("/api/user", { headers }),
          axios.get("/api/reservations", { headers }),
          axios.get("/api/user/payments", { headers }),
        ]);

        const user = userRes?.data || {};
        setUserName(
          user.firstname
            ? `${user.firstname} ${user.lastname}`
            : user.name || "User"
        );

        const resData = Array.isArray(reservationsRes.data)
          ? reservationsRes.data
          : reservationsRes.data.data ||
            reservationsRes.data.reservations ||
            [];
        setReservations(resData);

        const payData = Array.isArray(paymentsRes.data)
          ? paymentsRes.data
          : paymentsRes.data.data || paymentsRes.data.payments || [];
        setPayments(payData);

        setRecentActivity(buildNotifications(resData, payData));
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        if (err?.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/welcome");
        }
      }
    };

    fetchAll();
  }, [navigate]);

  // --- BUILD RECENT ACTIVITY LOGS ---
  const buildNotifications = (reservationsArr = [], paymentsArr = []) => {
    const logs = [];

    (reservationsArr || []).forEach((r) => {
      const title = r.event_name || "Event";
      const status = String(r.status || "").toLowerCase();

      if (status === "pending") {
        logs.push({
          type: "booking",
          message: `You booked a reservation for <b>${title}</b>. Awaiting admin approval.`,
          time: new Date(r.created_at || Date.now()).toLocaleString(),
        });
      } else if (status === "approved") {
        logs.push({
          type: "confirmation",
          message: `Your event <b>${title}</b> was <b>approved</b> by admin.`,
          time: new Date(r.updated_at || Date.now()).toLocaleString(),
        });
      } else if (status === "cancelled" || status === "canceled") {
        logs.push({
          type: "cancel",
          message: `Your event <b>${title}</b> was <b>cancelled</b>.`,
          time: new Date(r.updated_at || Date.now()).toLocaleString(),
        });
      }
    });

    (paymentsArr || []).forEach((p) => {
      const eventName = p.reservation?.event_name || "Event";
      const status = String(p.status || "").toLowerCase();
      const actionStatus = String(p.action_status || "").toLowerCase();
      const remarks = String(p.remarks || "").toLowerCase();

      if (
        status === "paid" ||
        status === "paid in full" ||
        status === "fully paid"
      ) {
        logs.push({
          type: "payment",
          message: `Your event <b>${eventName}</b> is now <b>fully paid</b>.`,
          time: new Date(p.updated_at || Date.now()).toLocaleString(),
        });
      } else if (
        status === "partial" ||
        status === "downpaid" ||
        (p.down_payment && Number(p.balance ?? 0) > 0)
      ) {
        logs.push({
          type: "payment",
          message: `You made a <b>downpayment</b> for <b>${eventName}</b>.`,
          time: new Date(p.updated_at || Date.now()).toLocaleString(),
        });
      }

      if (
        status.includes("refund") ||
        actionStatus.includes("refund") ||
        remarks.includes("refund")
      ) {
        logs.push({
          type: "refund",
          message: `You received a <b>refund</b> for <b>${eventName}</b>.`,
          time: new Date(p.updated_at || Date.now()).toLocaleString(),
        });
      }
    });

    return logs.sort((a, b) => new Date(b.time) - new Date(a.time));
  };

  // --- FILTERS ---
  const pendingEvents = reservations.filter(
    (r) => String(r.status).toLowerCase() === "pending"
  );

  const upcomingEvents = reservations.filter((r) => {
    const status = String(r.status || "").toLowerCase();
    if (status !== "approved") return false;

    const payment = payments.find(
      (p) => p.reservation_id === r.id || p.reservation?.id === r.id
    );

    if (!payment) return true;

    const payStatus = String(payment.status || "").toLowerCase();
    const isExcluded = [
      "paid",
      "paid in full",
      "fully paid",
      "refunded",
      "cancelled",
      "canceled",
    ].includes(payStatus);

    return !isExcluded;
  });

  // --- TOTAL PAYMENT ---
  const computeTotalPayment = useCallback(() => {
    if (!Array.isArray(payments)) return 0;
    let total = 0;
    payments.forEach((p) => {
      const status = String(p.status || "").toLowerCase();
      if (["refunded", "canceled", "cancelled"].includes(status)) return;

      const down = Number(p.down_payment ?? 0);
      const totalPrice = Number(p.total_price ?? 0);
      const balance = Number(p.balance ?? 0);

      if (["paid", "paid in full", "fully paid"].includes(status)) {
        total += totalPrice || down + balance;
      } else if (down > 0) {
        total += down;
      }
    });
    return total;
  }, [payments]);

  const totalPayment = computeTotalPayment();
  const totalPaymentFormatted = totalPayment.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // --- CANCEL RESERVATION ---
  const handleCancelReservation = async (id, eventName) => {
    if (!window.confirm(`Cancel reservation for ${eventName}?`)) return;

    try {
      // Use DELETE endpoint; server cancels for non-admin users
      await axios.delete(`/api/reservations/${id}`);
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "cancelled" } : r))
      );
      // If a modal is open that contains this reservation, remove it so cancelled items disappear immediately
      setModalData((prev) => prev.filter((d) => d.id !== id));

      setRecentActivity((prev) => [
        {
          type: "cancel",
          message: `Your event <b>${eventName}</b> was <b>cancelled</b>.`,
          time: new Date().toLocaleString(),
        },
        ...prev,
      ]);

      // If there is a payment related to this reservation, inform the user refund will be processed
      const relatedPayment = payments.find((p) => p.reservation_id === id || p.reservation?.id === id);
      if (relatedPayment) {
        alert("Reservation cancelled successfully. Please wait a moment while the admin processes your refund.");
      } else {
        alert("Reservation cancelled successfully.");
      }
    } catch (err) {
      console.error("Cancel reservation failed:", err);
      alert("Failed to cancel reservation. Try again.");
    }
  };

  // --- MODAL HELPERS ---
  const openModal = (title, type) => {
    let data = [];

    if (type === "upcoming") {
      data = upcomingEvents.map((r) => {
        const pay = payments.find(
          (p) => p.reservation_id === r.id || p.reservation?.id === r.id
        );
        return { ...r, payment: pay || null };
      });
    } else if (type === "pending") {
      data = pendingEvents.map((r) => {
        const pay = payments.find(
          (p) => p.reservation_id === r.id || p.reservation?.id === r.id
        );
        return { ...r, payment: pay || null };
      });
    } else if (type === "payments") {
      data = payments.filter(
        (p) =>
          !["refunded", "canceled", "cancelled"].includes(
            String(p.status || "").toLowerCase()
          )
      );
    }

    setModalTitle(title);
    setModalData(data);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalTitle("");
    setModalData([]);
  };

  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const visibleActivities = showAllActivities
    ? recentActivity
    : recentActivity.slice(0, 10);

  const goToReservationPage = () => navigate("/userdashboard/reservation");

  // --- RENDER ---
  return (
    <div className="home-container">
      <h1 className="home-title">Welcome, {userName || "User"}!</h1>

      {/* Banner */}
      <div className="home-banner">
        <div>
          <h2>Last-minute prep? No problem</h2>
          <p>
            We’re here to make sure every beat and vibe comes alive.
          </p>
        </div>
        <button className="schedule-btn" onClick={goToReservationPage}>
          <FiCalendar className="icon" />
          Schedule New Event
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div
          className="stat-card"
          onClick={() =>
            openModal("Upcoming Events (Needs Payment)", "upcoming")
          }
        >
          <h3>Upcoming Events</h3>
          <p className="stat-value">{upcomingEvents.length}</p>
          <span className="stat-event">Approved, needs full payment</span>
        </div>

        <div
          className="stat-card"
          onClick={() =>
            openModal("Active Services (Pending Approval)", "pending")
          }
        >
          <h3>Active Services</h3>
          <p className="stat-value">{pendingEvents.length}</p>
          <span className="stat-active">Pending admin approval</span>
        </div>

        <div
          className="stat-card"
          onClick={() => openModal("Payment Summary", "payments")}
        >
          <h3>Total Payment</h3>
          <p className="stat-value money">₱ {totalPaymentFormatted}</p>
          <span className="stat-payment">
            Down payments + fully paid totals
          </span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="section-card">
        <h2>Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <p className="no-activity">No recent activity yet.</p>
        ) : (
          <>
            {visibleActivities.map((a, i) => (
              <div key={i} className="activity-row">
                <span className={`activity-icon ${a.type}`}></span>
                <p dangerouslySetInnerHTML={{ __html: a.message }} />
                <span className="activity-time">
                  {new Date(a.time).toLocaleString()}
                </span>
              </div>
            ))}
            {recentActivity.length > 10 && (
              <div>
                <button
                  className="view-all"
                  onClick={() => setShowAllActivities((s) => !s)}
                >
                  {showAllActivities
                    ? "Show less"
                    : `Show more (${recentActivity.length - 10} more)`}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {modalVisible && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className={`modal-content ${
              modalTitle.includes("Upcoming")
                ? "upcoming"
                : modalTitle.includes("Active")
                ? "pending"
                : modalTitle.includes("Payment")
                ? "payments"
                : ""
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>{modalTitle}</h3>
              <button className="close-button" onClick={closeModal}>
                ✖
              </button>
            </div>

            <div className="modal-body">
              {modalData.length === 0 ? (
                <p>No records.</p>
              ) : (
                modalData.map((item, idx) => {
                  const payment = item.payment || item;
                  const eventName =
                    item.event_name ||
                    payment.reservation?.event_name ||
                    "Untitled Event";
                  const status = String(
                    payment.status || item.status || ""
                  ).toLowerCase();
                  const down = Number(payment?.down_payment ?? 0);
                  const total = Number(payment?.total_price ?? 0);
                  const balance = Number(payment?.balance ?? 0);

                  let amount = 0;
                  let label = "";

                  const computeDownForItem = (it, pay) => {
                    // priority: explicit payment.down_payment -> reservation.total_downpayment -> service.down_payment -> fallback 50% of total price
                    const pd = Number(pay?.down_payment ?? 0);
                    if (pd > 0) return pd;

                    const resDown = Number(it.total_downpayment ?? 0);
                    if (resDown > 0) return resDown;

                    const svcDown = Number(it.service?.down_payment ?? 0);
                    if (svcDown > 0) return svcDown;

                    // compute from custom services if present
                    try {
                      const customs = Array.isArray(it.custom_services)
                        ? it.custom_services
                        : typeof it.custom_services === 'string'
                        ? JSON.parse(it.custom_services)
                        : [];
                      const customDown = customs.reduce((acc, c) => acc + (Number(c.down_payment ?? 0) * (Number(c.quantity ?? 1))), 0);
                      if (customDown > 0) return customDown;
                    } catch (e) {
                      // ignore parse errors
                    }

                    // last resort: 50% of computed total price
                    const t = Number(pay?.total_price ?? it.total_price ?? 0);
                    return t > 0 ? t * 0.5 : 0;
                  };

                  // ✅ Active Services: Always show downpayment only
                  if (modalTitle.includes("Active Services")) {
                    amount = computeDownForItem(item, payment);
                    label = "Downpayment";
                  } else if (modalTitle.includes("Upcoming")) {
                    amount =
                      balance > 0 ? balance : Math.max(0, total - down);
                    label = "Balance";
                  } else if (modalTitle.includes("Payment Summary")) {
                    if (["paid", "paid in full", "fully paid"].includes(status)) {
                      amount = total;
                      label = "Fully Paid";
                    } else {
                      amount = down;
                      label = "Downpayment";
                    }
                  }

                  return (
                    <div key={idx} className="modal-item">
                      <div className="modal-item-header">
                        <strong>{eventName}</strong>
                        <span className="modal-amount">
                          ₱{" "}
                          {isNaN(amount)
                            ? "0.00"
                            : amount.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                        </span>
                      </div>

                      <div className="modal-item-info">
                        <span>
                          {item.call_date && (
                            <>
                              Date:{" "}
                              {new Date(
                                item.call_date
                              ).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </>
                          )}
                        </span>
                        <span className="modal-label">{label}</span>
                      </div>

                      {modalTitle.includes("Active Services") &&
                        String(item.status || "").toLowerCase() !== "cancelled" && (
                          <button
                            className="cancel-btn"
                            onClick={() =>
                              handleCancelReservation(item.id, eventName)
                            }
                          >
                            Cancel Reservation
                          </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
