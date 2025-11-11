import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/adminnav/Home.css";

export default function Home() {
  const [stats, setStats] = useState({
    totals: { income: 0, pending: 0, reservations: 0 },
    recent: [],
    recentTotal: 0,
  });
  const [showAll, setShowAll] = useState(false);
  const [modalData, setModalData] = useState({ type: null, list: [] });
  const [showModal, setShowModal] = useState(false);

  async function fetchStats(full = false) {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      if (!axios.defaults.headers.common["Authorization"]) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const url = `/api/admin/stats${full ? "?full=1" : ""}`;
      const res = await axios.get(url);
      const data = res.data || {};

      const totals = data.totals || data.data?.totals || { income: 0, pending: 0, reservations: 0 };

      const rawRecent = data.recent ?? data.data?.recent ?? data.activities ?? data.data ?? [];
      let recent = [];
      if (Array.isArray(rawRecent)) recent = rawRecent;
      else if (Array.isArray(rawRecent?.data)) recent = rawRecent.data;
      else if (Array.isArray(rawRecent?.activities)) recent = rawRecent.activities;
      else if (typeof rawRecent === 'object' && rawRecent !== null) {
        const vals = Object.values(rawRecent).find((v) => Array.isArray(v));
        recent = vals || [];
      }

      const reportedTotalFromTop = Number(data.recent_total ?? data.recentTotal ?? data.total_recent ?? 0) || 0;
      const reportedTotal = reportedTotalFromTop || (rawRecent && (rawRecent.meta?.total ?? rawRecent.total ?? rawRecent.total_count)) || recent.length;

      setStats((prev) => ({ ...prev, totals, recent, recentTotal: Number(reportedTotal) || recent.length }));
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  }

  useEffect(() => {
    fetchStats(false);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const headers = { headers: { Authorization: `Bearer ${token}` } };

    const pPayments = axios.get("/api/admin/payments", headers).catch(() => ({ data: [] }));
    const pPending = axios.get("/api/admin/payments", headers).catch(() => ({ data: [] }));
    const pReservations = axios.get("/api/reservations", headers).catch(() => ({ data: [] }));

    Promise.all([pPayments, pPending, pReservations])
      .then(([paymentsRes, pendingRes, reservationsRes]) => {
        const payments = Array.isArray(paymentsRes.data) ? paymentsRes.data : Array.isArray(paymentsRes.data?.data) ? paymentsRes.data.data : [];
        const allPaymentsForPending = Array.isArray(pendingRes.data) ? pendingRes.data : Array.isArray(pendingRes.data?.data) ? pendingRes.data.data : [];

        const pending = allPaymentsForPending.filter((p) => {
          const status = (p.status || "").toString().toLowerCase();
          const balance = Number(p.balance ?? 0) || 0;
          return status !== "paid" && status !== "fully_paid" && status !== "refunded" && balance > 0;
        });

        const allReservations = Array.isArray(reservationsRes.data) ? reservationsRes.data : Array.isArray(reservationsRes.data?.data) ? reservationsRes.data.data : [];
        const reservations = allReservations.filter((r) => (r.status || '').toString().toLowerCase() === 'approved');

        const income = payments.reduce((acc, p) => {
          const paymentStatus = (p.status || p.payment_status || p.reservation?.status || "").toString().toLowerCase();

          // Exclude refunded/cancelled payments. Some refunds may not have status set but will have refund metadata.
          const hasRefundMeta = Boolean(p.refund_receipt || p.refunded_at);
          if (['refunded', 'cancelled', 'canceled'].includes(paymentStatus) || hasRefundMeta) return acc;

          const down = Number(p.down_payment ?? p.downPayment ?? p.down_payment_amount ?? 0) || 0;
          const balance = Number(p.balance ?? 0) || 0;
          const totalPrice = Number(p.total_price ?? p.totalPrice ?? p.total ?? 0) || 0;

          if (paymentStatus === 'paid' || paymentStatus === 'fully_paid') return acc + (totalPrice > 0 ? totalPrice : down + balance);
          if (paymentStatus === 'unpaid') return acc + down;
          return acc;
        }, 0);

        const pendingFromPayments = pending.reduce((acc, p) => acc + (Number(p.balance ?? 0) || 0), 0);

        const reservationsWithoutPayments = allReservations.filter((r) => {
          const status = (r.status || '').toString().toLowerCase();
          const hasPayment = !!(r.payment || r.payment_id);
          return status === 'approved' && !hasPayment && Number(r.total_balance ?? r.totalBalance ?? 0) > 0;
        });

        const pendingFromReservations = reservationsWithoutPayments.reduce((acc, r) => acc + (Number(r.total_balance ?? r.totalBalance ?? 0) || 0), 0);

        const pendingTotal = pendingFromPayments + pendingFromReservations;

        setStats((prev) => ({
          ...prev,
          totals: {
            income: income || prev.totals.income || 0,
            pending: pendingTotal || prev.totals.pending || 0,
            reservations: reservations.length || prev.totals.reservations || 0,
          },
        }));
      })
      .catch((err) => console.error("Failed to compute totals", err));
  }, []);

  const recentArray = Array.isArray(stats.recent) ? stats.recent : Array.isArray(stats.recent?.data) ? stats.recent.data : Array.isArray(stats.recent?.activities) ? stats.recent.activities : [];
  const displayedActivities = showAll ? recentArray : recentArray.slice(0, 10);

  const toggleShowMore = async () => {
    if (!showAll) {
      await fetchStats(true);
      setShowAll(true);
    } else {
      await fetchStats(false);
      setShowAll(false);
    }
  };

  const fetchDetails = async (type) => {
    try {
      let endpoint = "";
      if (type === "income") endpoint = "/api/admin/payments";
      else if (type === "pending") endpoint = "/api/admin/payments";
      else if (type === "reservations") endpoint = "/api/reservations";
      if (!endpoint) return;

      const res = await axios.get(endpoint);
      const list = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
      let finalList = list;
      if (type === 'pending') {
        finalList = list.filter((p) => {
          const status = (p.status || '').toString().toLowerCase();
          const balance = Number(p.balance ?? 0) || 0;
          return status !== 'paid' && status !== 'fully_paid' && status !== 'refunded' && balance > 0;
        });
      } else if (type === 'income') {
        // Exclude refunded/cancelled payments or reservations from the income modal
        finalList = list.filter((p) => {
          const reservation = p.reservation ?? (p.payment && p.payment.reservation) ?? null;
          const status = (p.status ?? reservation?.status ?? '').toString().toLowerCase();
          const hasRefundMeta = Boolean(p.refund_receipt || p.refunded_at || reservation?.refund_receipt || reservation?.refunded_at);
          return !(['refunded', 'cancelled', 'canceled'].includes(status) || hasRefundMeta);
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
      case "income": return "Events with Down Payment / Fully Paid";
      case "pending": return "Pending Balances";
      case "reservations": return "Approved Reservations";
      default: return "";
    }
  };

  return (
    <div className="admin-home">
      <h2 className="dashboard-title">Dashboard Overview</h2>

      <div className="stats-grid">
        <div className="stat-card income clickable" onClick={() => fetchDetails("income")}>
          <h3>Total Income</h3>
          <p className="stat-number">₱{Number(stats.totals.income || 0).toLocaleString()}</p>
        </div>

        <div className="stat-card pending clickable" onClick={() => fetchDetails("pending")}>
          <h3>Pending Balances</h3>
          <p className="stat-number">₱{Number(stats.totals.pending || 0).toLocaleString()}</p>
        </div>

        <div className="stat-card reservations clickable" onClick={() => fetchDetails("reservations")}>
          <h3>Total Reservations</h3>
          <p className="stat-number">{stats.totals.reservations || 0}</p>
        </div>
      </div>

      <div className="recent-section">
        <div className="recent-header">
          <h3>Recent Activities</h3>
          {(stats.recentTotal ?? recentArray.length) > 10 && (
            <button className="show-more-btn" onClick={toggleShowMore}>{showAll ? "Show Less" : "Show More"}</button>
          )}
        </div>

        <div className="recent-container">
          <ul>
            {recentArray.length === 0 && <li>No recent activity</li>}
            {displayedActivities.map((act, i) => (
              <li key={i} className="activity-item">
                <span className="activity-message">{act.message || act.action || "Activity recorded"}</span>
                <span className="activity-time">{act.time ? new Date(act.time).toLocaleString() : act.created_at ? new Date(act.created_at).toLocaleString() : ""}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            <h3>{getModalTitle()}</h3>

            {modalData.list.length === 0 ? (
              <p className="no-data">No data found.</p>
            ) : (
              <ul className="modal-list">
                {modalData.list.map((item, index) => {
                  const reservation = item.reservation ?? (item.payment && item.payment.reservation) ?? null;
                  const eventName = item.event_name || item.name || reservation?.event_name || reservation?.name || "Unnamed Event";

                  const computeReservationTotal = (r) => {
                    if (!r) return 0;
                    const direct = Number(r.total_price ?? r.totalPrice ?? r.total ?? 0) || 0;
                    if (direct > 0) return direct;
                    const svcPrice = Number(r.service?.price ?? r.service_price ?? 0) || 0;
                    let customTotal = 0;
                    try {
                      const customs = Array.isArray(r.custom_services) ? r.custom_services : typeof r.custom_services === 'string' && r.custom_services.length ? JSON.parse(r.custom_services) : [];
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
                  const totalPrice = Number(item.total_price ?? item.totalPrice ?? item.total ?? computeReservationTotal(reservation) ?? 0) || 0;
                  const statusStr = (item.status ?? reservation?.status ?? "").toString().toLowerCase();

                  // Detect refunds via status or refund metadata (refund_receipt/refunded_at)
                  const hasRefundMeta = Boolean(item.refund_receipt || item.refunded_at || reservation?.refund_receipt || reservation?.refunded_at);

                  let price = 0;
                  let statusLabel = null;
                  if (modalData.type === 'income') {
                    if (hasRefundMeta || statusStr === 'refunded') {
                      // Do not show refunded down payments in the income modal — display 0 and mark refunded
                      price = 0;
                      statusLabel = 'Refunded';
                    } else if (statusStr === 'paid' || statusStr === 'fully_paid') {
                      price = totalPrice > 0 ? totalPrice : down + balance;
                      statusLabel = 'Fully Paid';
                    } else if (statusStr === 'unpaid') {
                      price = down;
                      statusLabel = 'Down Payment';
                    } else {
                      price = down;
                      statusLabel = balance === 0 ? 'Fully Paid' : 'Down Payment';
                    }
                  } else if (modalData.type === 'pending') {
                    price = balance || down || totalPrice || 0;
                  } else if (modalData.type === 'reservations') {
                    price = totalPrice || 0;
                  } else {
                    price = totalPrice || 0;
                  }

                  const date = item.event_date || item.date || item.created_at || item.updated_at || reservation?.call_date || reservation?.created_at || null;

                  return (
                    <li key={index} className="modal-item">
                      <strong>{eventName}</strong>
                      <span className="detail"> {' '} – ₱{Number(price).toLocaleString()}</span>
                      {modalData.type === 'income' && (
                        <span className={`detail ${statusLabel === 'Fully Paid' ? 'paid' : 'down'}`}> {' '} – {statusLabel}</span>
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
