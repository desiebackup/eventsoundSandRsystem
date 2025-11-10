import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/adminnav/Home.css";

export default function Home() {
  const [stats, setStats] = useState({
    totals: { income: 0, pending: 0, reservations: 0 },
    recent: [],
  });
  const [showAll, setShowAll] = useState(false);
  const [modalData, setModalData] = useState({ type: null, list: [] });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!axios.defaults.headers.common["Authorization"]) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    axios
      .get("/api/admin/stats")
      .then((res) => {
        // 🧠 Handle possible data shapes safely
        const data = res.data || {};
        const totals =
          data.totals ||
          data.data?.totals || {
            income: 0,
            pending: 0,
            reservations: 0,
          };
        const recent =
          data.recent ||
          data.data?.recent ||
          data.activities ||
          [];
        setStats({ totals, recent });
      })
      .catch((err) => console.error("Failed to fetch stats", err));
  }, []);

  // Compute totals client-side from detailed endpoints to ensure consistent rules:
  // - Total Payments (income): include down payment for all events. If a payment is fully paid, include its balance as well (down + balance).
  // - Pending Balances (pending): sum of balances for unpaid events.
  // - Total Reservations (reservations): count of approved reservations.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const headers = { headers: { Authorization: `Bearer ${token}` } };

  // Use available endpoints: payments and reservations. There is no dedicated
  // pending-balances or approved-reservations endpoint, so we'll fetch payments
  // and reservations and filter client-side.
  const p1 = axios.get("/api/admin/payments", headers).catch((e) => ({ data: [] }));
  const p2 = axios.get("/api/admin/payments", headers).catch((e) => ({ data: [] }));
  const p3 = axios.get("/api/reservations", headers).catch((e) => ({ data: [] }));

    Promise.all([p1, p2, p3])
      .then(([paymentsRes, pendingRes, reservationsRes]) => {
        const payments = Array.isArray(paymentsRes.data)
          ? paymentsRes.data
          : Array.isArray(paymentsRes.data?.data)
          ? paymentsRes.data.data
          : [];

        // pendingRes is actually payments; we'll filter to unpaid/pending balances
        const allPaymentsForPending = Array.isArray(pendingRes.data)
          ? pendingRes.data
          : Array.isArray(pendingRes.data?.data)
          ? pendingRes.data.data
          : [];

        const pending = allPaymentsForPending.filter((p) => {
          const status = (p.status || "").toString().toLowerCase();
          const balance = Number(p.balance ?? 0) || 0;
          // treat as pending if not refunded and not fully paid and has a positive balance
          return status !== "paid" && status !== "fully_paid" && status !== "refunded" && balance > 0;
        });

        const allReservations = Array.isArray(reservationsRes.data)
          ? reservationsRes.data
          : Array.isArray(reservationsRes.data?.data)
          ? reservationsRes.data.data
          : [];

        // Only include approved reservations for the reservations count/list
        const reservations = allReservations.filter((r) => (r.status || '').toString().toLowerCase() === 'approved');

        // Total payments: include down_payment for all; if fully paid include balance as well
        const income = payments.reduce((acc, p) => {
          const down = Number(p.down_payment ?? p.downPayment ?? p.down_payment_amount ?? 0) || 0;
          const balance = Number(p.balance ?? 0) || 0;
          const status = (p.status || "").toString().toLowerCase();

          // Always add down payment
          let add = down;

          // If fully paid (status indicates paid or balance is zero), include balance too
          if (status === "paid" || status === "fully_paid" || balance === 0) {
            add += balance;
          }

          return acc + add;
        }, 0);

        // Pending: sum balances for unpaid events (from payments) and also
        // include approved reservations that don't yet have a payment record
        const pendingFromPayments = pending.reduce((acc, p) => {
          const balance = Number(p.balance ?? 0) || 0;
          return acc + balance;
        }, 0);

        // Find approved reservations that may be missing payment entries and sum their balances
        const reservationsWithoutPayments = allReservations.filter((r) => {
          const status = (r.status || '').toString().toLowerCase();
          const hasPayment = !!(r.payment || r.payment_id);
          return status === 'approved' && !hasPayment && Number(r.total_balance ?? r.totalBalance ?? 0) > 0;
        });

        const pendingFromReservations = reservationsWithoutPayments.reduce((acc, r) => {
          return acc + (Number(r.total_balance ?? r.totalBalance ?? 0) || 0);
        }, 0);

        const pendingTotal = pendingFromPayments + pendingFromReservations;

        // Reservations: count of approved reservations
        const reservationsCount = reservations.length;

        setStats((prev) => ({
          ...prev,
          totals: {
            income: income || prev.totals.income || 0,
            pending: pendingTotal || prev.totals.pending || 0,
            reservations: reservationsCount || prev.totals.reservations || 0,
          },
        }));
      })
      .catch((err) => console.error("Failed to compute totals", err));
  }, []);

  // Normalize recent activities to an array (handle paginated shapes: { data: [...] })
  const recentArray = Array.isArray(stats.recent)
    ? stats.recent
    : Array.isArray(stats.recent?.data)
    ? stats.recent.data
    : Array.isArray(stats.recent?.activities)
    ? stats.recent.activities
    : [];

  const displayedActivities = showAll ? recentArray : recentArray.slice(0, 10);

  // ✅ Fetch detailed lists for each card
  const fetchDetails = async (type) => {
    try {
      let endpoint = "";
      if (type === "income") endpoint = "/api/admin/payments";
      else if (type === "pending") endpoint = "/api/admin/payments"; // we'll filter client-side
      else if (type === "reservations") endpoint = "/api/reservations"; // filter approved client-side

      if (!endpoint) return;

      const res = await axios.get(endpoint);
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      // Post-process lists for types that need filtering
      let finalList = list;
      if (type === 'pending') {
        finalList = list.filter((p) => {
          const status = (p.status || '').toString().toLowerCase();
          const balance = Number(p.balance ?? 0) || 0;
          return status !== 'paid' && status !== 'fully_paid' && status !== 'refunded' && balance > 0;
        });
      } else if (type === 'reservations') {
        finalList = list.filter((r) => (r.status || '').toString().toLowerCase() === 'approved');
      }

      setModalData({ type, list: finalList });
      setShowModal(true);
    } catch (err) {
      console.error("Error loading details:", err);
      alert("Failed to load details. Check console for more info.");
    }
  };

  const getModalTitle = () => {
    switch (modalData.type) {
      case "income":
        return "Events with Down Payment / Fully Paid";
      case "pending":
        return "Pending Balances";
      case "reservations":
        return "Approved Reservations";
      default:
        return "";
    }
  };

  return (
    <div className="admin-home">
      <h2 className="dashboard-title">Dashboard Overview</h2>

      {/* ===== Summary Cards ===== */}
      <div className="stats-grid">
        <div
          className="stat-card income clickable"
          onClick={() => fetchDetails("income")}
        >
          <h3>Total Payments</h3>
          <p className="stat-number">
            ₱{Number(stats.totals.income || 0).toLocaleString()}
          </p>
        </div>

        <div
          className="stat-card pending clickable"
          onClick={() => fetchDetails("pending")}
        >
          <h3>Pending Balances</h3>
          <p className="stat-number">
            ₱{Number(stats.totals.pending || 0).toLocaleString()}
          </p>
        </div>

        <div
          className="stat-card reservations clickable"
          onClick={() => fetchDetails("reservations")}
        >
          <h3>Total Reservations</h3>
          <p className="stat-number">{stats.totals.reservations || 0}</p>
        </div>
      </div>

      {/* ===== Recent Activities ===== */}
      <div className="recent-section">
        <div className="recent-header">
          <h3>Recent Activities</h3>

          {/* ✅ FIX: ensure it shows if >10 entries after load */}
          {recentArray.length > 10 && (
            <button
              className="show-more-btn"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show Less" : "Show More"}
            </button>
          )}
        </div>

        <div className="recent-container">
          <ul>
            {recentArray.length === 0 && <li>No recent activity</li>}
            {displayedActivities.map((act, i) => (
              <li key={i} className="activity-item">
                <span className="activity-message">
                  {act.message || act.action || "Activity recorded"}
                </span>
                <span className="activity-time">
                  {act.time
                    ? new Date(act.time).toLocaleString()
                    : act.created_at
                    ? new Date(act.created_at).toLocaleString()
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ===== Modal for Details ===== */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button className="close-btn" onClick={() => setShowModal(false)}>
              ✕
            </button>
            <h3>{getModalTitle()}</h3>

            {modalData.list.length === 0 ? (
              <p className="no-data">No data found.</p>
            ) : (
              <ul className="modal-list">
                {modalData.list.map((item, index) => {
                  const reservation = item.reservation ?? (item.payment && item.payment.reservation) ?? null;

                  const eventName =
                    item.event_name ||
                    item.name ||
                    reservation?.event_name ||
                    reservation?.name ||
                    "Unnamed Event";

                  const computeReservationTotal = (r) => {
                    if (!r) return 0;
                    const direct = Number(r.total_price ?? r.totalPrice ?? r.total ?? 0) || 0;
                    if (direct > 0) return direct;
                    const svcPrice = Number(r.service?.price ?? r.service_price ?? 0) || 0;
                    let customTotal = 0;
                    try {
                      const customs = Array.isArray(r.custom_services)
                        ? r.custom_services
                        : typeof r.custom_services === 'string' && r.custom_services.length
                        ? JSON.parse(r.custom_services)
                        : [];
                      customTotal = customs.reduce((acc, c) => {
                        const price = Number(c.price ?? c.total ?? 0) || 0;
                        const qty = Number(c.quantity ?? 1) || 1;
                        return acc + price * qty;
                      }, 0);
                    } catch (e) {
                      customTotal = 0;
                    }
                    return svcPrice + customTotal;
                  };

                  const down = Number(item.down_payment ?? item.downPayment ?? item.down_payment_amount ?? reservation?.total_downpayment ?? 0) || 0;
                  const balance = Number(item.balance ?? reservation?.total_balance ?? 0) || 0;
                  const statusStr = (item.status ?? reservation?.status ?? "").toString().toLowerCase();
                  const isFullyPaid = statusStr === "paid" || statusStr === "fully_paid" || balance === 0;

                  let price = 0;
                  if (modalData.type === 'income') {
                    price = isFullyPaid ? down + balance : down;
                  } else if (modalData.type === 'pending') {
                    price = balance || down || computeReservationTotal(reservation) || 0;
                  } else if (modalData.type === 'reservations') {
                    price = Number(item.total_price ?? item.totalPrice ?? item.total ?? computeReservationTotal(item) ?? 0) || computeReservationTotal(item) || 0;
                  } else {
                    price = Number(item.total_price ?? item.amount ?? item.price ?? 0) || 0;
                  }

                  const date = item.event_date || item.date || item.created_at || item.updated_at || reservation?.call_date || reservation?.created_at || null;

                  const status = modalData.type === 'income' ? (isFullyPaid ? 'Fully Paid' : 'Down Payment') : null;

                  return (
                    <li key={index} className="modal-item">
                      <strong>{eventName}</strong>
                      <span className="detail"> {' '} – ₱{Number(price).toLocaleString()}</span>
                      {modalData.type === 'income' && (
                        <span className={`detail ${status === 'Fully Paid' ? 'paid' : 'down'}`}> {' '} – {status}</span>
                      )}
                      {modalData.type === 'pending' && reservation && (
                        <span className="detail"> {' '} – Total: ₱{Number(computeReservationTotal(reservation)).toLocaleString()}</span>
                      )}
                      {modalData.type === 'reservations' && date && (
                        <span className="detail"> {' '} – {new Date(date).toLocaleDateString()}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
