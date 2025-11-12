import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../css/usernav/Payment.css";

export default function Payment() {
  const [payments, setPayments] = useState([]);
  const [refundDetails, setRefundDetails] = useState({
    refund_bank_name: "",
    refund_account_number: "",
    refund_account_name: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [showAllPayments, setShowAllPayments] = useState(false);

  // axios defaults (safe to set once)
  axios.defaults.withCredentials = true;
  axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

  // Helper to normalize API responses that may wrap arrays differently
  const normalizeArray = (raw, alternateKeys = ["data", "payments", "reservations"]) => {
    if (Array.isArray(raw)) return raw;
    for (const k of alternateKeys) {
      if (Array.isArray(raw?.[k])) return raw[k];
    }
    return [];
  };

  // Resolve canonical totals for a payment or synthetic reservation entry.
  const resolveTotals = (p) => {
    let total = Number(p.total_price ?? 0) || 0;
    let down = Number(p.down_payment ?? 0) || 0;

    const r = p.reservation ?? null;
    const add = (a, b) => a + (Number(b ?? 0) || 0);

    if (r) {
      // Prefer explicit reservation totals when present
      const rTotalCandidate = Number(r.total_price ?? r.price ?? r.amount ?? 0) || 0;
      if (rTotalCandidate > 0) total = rTotalCandidate;

      const rTotalDownCandidate = Number(r.total_downpayment ?? 0) || 0;
      const rDownCandidate = Number(r.down_payment ?? 0) || 0;
      if (rTotalDownCandidate > 0) {
        down = rTotalDownCandidate;
      } else if (rDownCandidate > 0) {
        down = rDownCandidate;
      }

      // If no top-level total, derive from components
      if (!total) {
        if (r.service && Number(r.service.price)) total = Number(r.service.price || 0);
        else if (Array.isArray(r.services) && r.services.length) {
          total = r.services.reduce((s, it) => s + (Number(it.price ?? 0) * (Number(it.quantity ?? 1) || 1)), 0);
        } else if (Array.isArray(r.items) && r.items.length) {
          total = r.items.reduce((s, it) => s + (Number(it.price ?? 0) * (Number(it.quantity ?? 1) || 1)), 0);
        }

        // custom services
        try {
          const customs = Array.isArray(r.custom_services)
            ? r.custom_services
            : typeof r.custom_services === "string"
            ? JSON.parse(r.custom_services || "[]")
            : [];
          if (Array.isArray(customs) && customs.length) {
            const customTotal = customs.reduce((acc, c) => acc + (Number(c.price ?? 0) * (Number(c.quantity ?? 1) || 1)), 0);
            total = add(total, customTotal);
            const customDown = customs.reduce((acc, c) => acc + (Number(c.down_payment ?? 0) * (Number(c.quantity ?? 1) || 1)), 0);
            if (!down || down === 0) down = Number(customDown || 0);
          }
        } catch (e) {
          // ignore malformed custom_services
        }
      }

      // Fallback for down: service down_payment or deposit fields
      if (!down || Number(down) === 0) {
        if (r.service && Number(r.service.down_payment) > 0) {
          down = Number(r.service.down_payment || 0);
        } else {
          down = Number(r.deposit ?? r.initial_deposit ?? r.down ?? down) || down;
        }
      }
    }

    // Extra fallbacks on the payment object
    if (!total && Number(p.price)) total = Number(p.price);
    if (!total) {
      const otherPriceFields = ["package_price", "subtotal", "grand_total", "amount", "fee", "base_price", "price_per_day"];
      for (const f of otherPriceFields) {
        if (typeof p[f] !== "undefined" && Number(p[f])) { total = Number(p[f]); break; }
      }
    }
    if (!down) {
      down = Number(p.deposit ?? p.initial_deposit ?? p.down ?? 0) || down;
    }

    // If reservation is cancelled OR payment/reservation is refunded, show balance 0
    const reservationStatus = String(r?.status ?? "").toLowerCase();
    const paymentStatus = String(p?.status ?? "").toLowerCase();
    const finalStates = ["cancelled", "canceled", "refunded"];
    const isFinal = finalStates.includes(reservationStatus) || paymentStatus === "refunded";
    if (isFinal && r) {
      // prefer reservation explicit values when available
      const reservedTotal = Number(r.total_price ?? r.price ?? r.amount ?? 0) || 0;
      const reservedDown = Number(r.total_downpayment ?? r.down_payment ?? r.deposit ?? r.initial_deposit ?? 0) || 0;
      if (reservedTotal) total = reservedTotal;
      if (reservedDown) down = reservedDown;
    }

    let balance = Math.max(0, Number(p.balance ?? (total - down) ?? 0));
    if (isFinal) balance = 0;

    if (isFinal && total === 0 && down === 0) {
      try { console.debug("PaymentsFetcher: final (cancelled/refunded) reservation missing totals", r || p || {}); } catch (e) {}
    }

    return { total, down, balance };
  };

  // Fetch payments, reservations, and refund details
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [paymentsRes, reservationsRes, refundRes] = await Promise.all([
          axios.get("/api/user/payments"),
          axios.get("/api/reservations"),
          axios.get("/api/user/refund-details"),
        ]);

        const paymentsData = normalizeArray(paymentsRes.data, ["data", "payments"]);
        const reservationsData = normalizeArray(reservationsRes.data, ["data", "reservations"]);

        // map reservations
        const reservationsById = {};
        reservationsData.forEach((r) => {
          if (r && r.id) reservationsById[r.id] = r;
        });

        // link payments to reservations
        const paymentsByReservation = {};
        paymentsData.forEach((p) => {
          const rid = p.reservation_id ?? (p.reservation && p.reservation.id) ?? null;
          if (!p.reservation && rid && reservationsById[rid]) p.reservation = reservationsById[rid];
          if (rid) paymentsByReservation[rid] = p;
        });

        // synthetic entries for cancelled reservations that don't have payments
        const syntheticFromCancelled = [];
        reservationsData.forEach((r) => {
          const rstatus = String(r.status || "").toLowerCase();
          if ((rstatus === "cancelled" || rstatus === "canceled") && !paymentsByReservation[r.id]) {
            const { total, down, balance } = resolveTotals({ reservation: r });
            syntheticFromCancelled.push({
              synthetic: true,
              id: `res-${r.id}`,
              reservation: r,
              total_price: total,
              down_payment: down,
              balance: balance,
              status: "cancelled",
              created_at: r.created_at ?? r.updated_at ?? null,
            });
          }
        });

  // combine and set
  const combined = [...paymentsData, ...syntheticFromCancelled];
  setPayments(combined);
  console.debug("Payments count:", combined.length, combined);


        // refund details - normalize into a safe shape so inputs never receive null
        if (typeof refundRes !== "undefined") {
          const rd = refundRes?.data ?? {};
          const source = rd?.data ?? rd ?? {};
          const normalized = {
            refund_bank_name: "",
            refund_account_number: "",
            refund_account_name: "",
            ...source,
          };
          setRefundDetails(normalized);
        }
      } catch (err) {
        console.error("Payments fetch error:", err);
      }
    };

    fetchAll();
  }, []);

    // Save refund details handler
    const handleSaveRefundDetails = async () => {
      try {
        await axios.post("/api/user/refund-details", refundDetails);
        alert("Refund details updated successfully.");
        setShowModal(false);
      } catch (err) {
        console.error("Save refund error:", err);
        alert("Failed to save refund details.");
      }
    };

  const isActiveUnpaid = (p) => {
    const s = String(p.status ?? p.reservation?.status ?? "").toLowerCase();
    if (["paid", "refunded", "canceled", "cancelled"].includes(s)) return false;
    const { balance } = resolveTotals(p);
    return balance > 0;
  };

  const activePayments = payments.filter(isActiveUnpaid);
  const totalRemainingBalance = activePayments.reduce(
    (acc, p) => acc + Math.max(0, resolveTotals(p).balance),
    0
  );
  const totalDownPaymentForOutstanding = activePayments.reduce(
    (acc, p) => acc + resolveTotals(p).down,
    0
  );
  const activeCount = activePayments.length;

// sort payments newest first (optional for clean order)
// sort payments newest first (optional for clean order)
const sortedPayments = React.useMemo(() => {
  return [...payments].sort((a, b) => {
    const da = new Date(a.created_at || a.reservation?.created_at || 0);
    const db = new Date(b.created_at || b.reservation?.created_at || 0);
    return db - da;
  });
}, [payments]);

// show 10 initially, expand if toggled
const displayedPayments = React.useMemo(() => {
  return showAllPayments ? sortedPayments : sortedPayments.slice(0, 10);
}, [sortedPayments, showAllPayments]);


  return (
    <div className="pay-wrapper">
      <h2 className="pay-title">Payment & Invoice Center</h2>

      {/* === BALANCE SUMMARY === */}
      {activeCount > 0 ? (
        <div className="balance-box">
          <p className="balance-label">Total Remaining Balance</p>
          <h1 className="balance-amount">
            ₱{totalRemainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h1>
          <p className="balance-info">
            You currently have <b>{activeCount}</b> unpaid{" "}
            {activeCount > 1 ? "reservations" : "reservation"} that must be paid{" "}
            <b>in person</b>.
          </p>
        </div>
      ) : (
        <div className="balance-box">
          <p className="balance-label">Total Remaining Balance</p>
          <h1 className="balance-amount">₱0.00</h1>
          <p className="balance-info">No pending balances!</p>
        </div>
      )}

      {/* === REFUND DETAILS === */}
      <div className="refund-box">
        <h3 className="section-title">Default Refund Method</h3>
        {refundDetails.refund_bank_name ||
        refundDetails.refund_account_name ||
        refundDetails.refund_account_number ? (
          <>
            <div className="refund-row">
              <div>
                <p>
                  <b>{refundDetails.refund_bank_name}</b> (Account Ending:{" "}
                  {String(refundDetails.refund_account_number).slice(-4)})
                </p>
                <p>Account Name: {refundDetails.refund_account_name}</p>
              </div>
              <button className="update-btn" onClick={() => setShowModal(true)}>
                Update Details
              </button>
            </div>
            <p className="refund-note">
              All manual refunds (e.g., cancellations) will be sent to this account.
            </p>
          </>
        ) : (
          <div>
            <p>No refund details saved yet.</p>
            <button className="update-btn" onClick={() => setShowModal(true)}>
              Add Refund Details
            </button>
          </div>
        )}
      </div>

      {/* === PAYMENT HISTORY === */}
<div className="payment-history-header">
  <h3 className="section-title">Payment History</h3>
  <div className="header-actions">
    {sortedPayments.length > 10 ? (
      <button
        className="show-more-btn"
        aria-label={showAllPayments ? "Show less payments" : "Show more payments"}
        onClick={() => setShowAllPayments(!showAllPayments)}
      >
        {showAllPayments ? "Show Less" : "Show More"}
      </button>
    ) : (
      <div className="show-more-placeholder" aria-hidden="true" />
    )}
  </div>
</div>




      <div className="invoice-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Event</th>
              <th>Total</th>
              <th>Down Payment</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Action / Refund Status</th>
            </tr>
          </thead>
          <tbody>
            {displayedPayments.length > 0 ? (
              displayedPayments.map((p) => {
                const statusNorm = String(p.status || p.reservation?.status || "unpaid").toLowerCase();
                const { total, down, balance } = resolveTotals(p);
                const rowKey = `${p.synthetic ? 'res' : 'pay'}-${p.id || p.reservation?.id || Math.random()}`;

                // Friendly row ID like the screenshot
                const displayId = p.reservation?.id
                  ? `${p.reservation.id}`
                  : p.synthetic && p.reservation?.id
                  ? `${p.reservation.id}`
                  : `${p.id}`;

                // Map statuses to nicer labels and classes
                let statusClass = statusNorm;
                let statusLabel = statusNorm.charAt(0).toUpperCase() + statusNorm.slice(1);
                if (statusNorm === "paid") {
                  statusClass = "paid";
                  statusLabel = "Paid In Full";
                } else if (statusNorm === "refunded") {
                  statusClass = "refunded";
                  statusLabel = "Refunded";
                } else if (statusNorm === "cancelled" || statusNorm === "canceled") {
                  statusClass = "canceled";
                  statusLabel = "Cancelled";
                } else {
                  // unpaid -> if balance > 0 show Balance Due
                  if (balance > 0) {
                    statusClass = "balance-due";
                    statusLabel = "Balance Due";
                  } else {
                    statusClass = "unpaid";
                    statusLabel = "Unpaid";
                  }
                }

                return (
                  <tr key={rowKey}>
                    <td>{displayId}</td>
                    <td>{p.reservation?.event_name || "N/A"}</td>
                    <td>₱{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td>₱{down.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td>₱{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td>
                      <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
                    </td>
                    <td>
  {statusNorm === "paid" ? (
    <span className="action-link paid-full">Fully Paid</span>
  ) : statusNorm === "unpaid" ? (
    <span className="action-link pay-in-person">Pay In Person</span>
  ) : statusNorm === "refunded" ? (
    <div className="refund-status">
      <span className="action-link refund-sent">Refunded</span>
      {p.refund_receipt && (
        <a
          href={`/storage/${p.refund_receipt}`}
          target="_blank"
          rel="noreferrer"
          className="view-receipt"
        >
          View Receipt
        </a>
      )}
    </div>
  ) : (
    <em>Please wait for your refund.</em>
  )}
</td>

                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  No payment records available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* === REFUND MODAL === */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Update Refund Details</h3>
            <input
              type="text"
              placeholder="Bank Name"
              value={refundDetails.refund_bank_name ?? ""}
              onChange={(e) =>
                setRefundDetails({ ...refundDetails, refund_bank_name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Account Number"
              value={refundDetails.refund_account_number ?? ""}
              onChange={(e) =>
                setRefundDetails({ ...refundDetails, refund_account_number: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Account Name"
              value={refundDetails.refund_account_name ?? ""}
              onChange={(e) =>
                setRefundDetails({ ...refundDetails, refund_account_name: e.target.value })
              }
            />
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleSaveRefundDetails}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}