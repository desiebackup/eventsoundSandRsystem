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

  // ensure cookies/XSRF are sent (you already had this, keep it)
  axios.defaults.withXSRFToken = true;
  axios.defaults.withCredentials = true;
  axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

  // --- Fetch payments + refund details ---
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [paymentsRes, refundRes] = await Promise.allSettled([
          axios.get("/api/user/payments"),
          axios.get("/api/user/refund-details"),
        ]);

        // normalize payments response to an array
        if (paymentsRes.status === "fulfilled") {
          const raw = paymentsRes.value.data;
          const data = Array.isArray(raw)
            ? raw
            : Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw?.payments)
            ? raw.payments
            : [];
          setPayments(data);
        } else {
          setPayments([]); // fallback
          console.warn("Failed to fetch payments:", paymentsRes.reason);
        }

        // refund details (single object)
        if (refundRes.status === "fulfilled" && refundRes.value.data) {
          const d = refundRes.value.data;
          setRefundDetails({
            refund_bank_name: d.refund_bank_name ?? "",
            refund_account_number: d.refund_account_number ?? "",
            refund_account_name: d.refund_account_name ?? "",
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchAll();
  }, []);

  // --- Save refund details ---
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

  // --- Filtering logic: consider only active/unpaid reservations ---
  // Exclude statuses that shouldn't contribute to outstanding totals.
  const isActiveUnpaid = (p) => {
    const s = String(p.status ?? "").toLowerCase();
    // treat 'paid', 'refunded', 'canceled' as not active/unpaid
    if (s === "paid" || s === "refunded" || s === "canceled") return false;
    // otherwise if balance > 0 or status explicitly 'unpaid' count it
    const balance = Number(p.balance ?? (Number(p.total_price ?? 0) - Number(p.down_payment ?? 0)));
    return balance > 0 || s === "unpaid" || s === "balance due";
  };

  const activePayments = Array.isArray(payments) ? payments.filter(isActiveUnpaid) : [];

  // Sum outstanding balances for active payments
  const totalRemainingBalance = activePayments.reduce((acc, p) => {
    const balance = Number(p.balance ?? (Number(p.total_price ?? 0) - Number(p.down_payment ?? 0)));
    return acc + Math.max(0, balance);
  }, 0);

  // Sum down payments only for the active (unpaid) reservations — this excludes fully paid / refunded ones
  const totalDownPaymentForOutstanding = activePayments.reduce((acc, p) => {
    return acc + Number(p.down_payment ?? 0);
  }, 0);

  const activeCount = activePayments.length;

  return (
    <div className="pay-wrapper">
      <h2 className="pay-title">Payment & Invoice Center</h2>

      {/* --- SUMMARY BOX --- */}
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

          <p style={{ opacity: 0.9 }}>
            Total down payments toward those unpaid reservations:{" "}
            <b>
              ₱{totalDownPaymentForOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </b>
          </p>
        </div>
      ) : (
        <div className="balance-box paid">
          <p className="balance-label">No Pending Balances</p>
          <h1 className="balance-amount">₱0.00</h1>
          <p className="balance-info">All your reservations are paid in full!</p>
        </div>
      )}

      {/* --- REFUND DETAILS BOX --- */}
      <div className="refund-box">
        <h3 className="section-title">Default Refund Method</h3>
        {refundDetails.refund_bank_name ||
        refundDetails.refund_account_name ||
        refundDetails.refund_account_number ? (
          <>
            <div className="refund-row">
              <div>
                <p className="refund-bank">
                  <b>{refundDetails.refund_bank_name}</b> (Account Ending:{" "}
                  {String(refundDetails.refund_account_number).slice(-4)})
                </p>
                <p className="refund-name">
                  Account Name: {refundDetails.refund_account_name}
                </p>
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

      {/* --- PAYMENT / INVOICE TABLE --- */}
      <h3 className="section-title">Payment History</h3>
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
            {Array.isArray(payments) && payments.length > 0 ? (
              payments.map((p) => {
                const status = String(p.status || "unpaid").toLowerCase();
                const balance = Number(p.balance ?? (Number(p.total_price ?? 0) - Number(p.down_payment ?? 0)));

                let actionContent;
                if (status === "paid" || status === "paid in full") {
                  actionContent = <span className="action-link paid-full">Fully Paid</span>;
                } else if (status === "unpaid" || status === "balance due") {
                  actionContent = <span className="action-link pay-in-person">Pay In Person</span>;
                } else if (status === "refunded" || status === "canceled") {
                  actionContent = (
                    <div className="refund-status">
                      <span className="action-link refund-sent">REFUND SENT</span>
                      {p.refund_receipt && (
                        <a href={`/storage/${p.refund_receipt}`} target="_blank" rel="noreferrer" className="view-receipt">
                          View Receipt
                        </a>
                      )}
                    </div>
                  );
                } else {
                  actionContent = <em>No Action</em>;
                }

                return (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.reservation?.event_name || "N/A"}</td>
                    <td>₱{Number(p.total_price ?? 0).toLocaleString()}</td>
                    <td>₱{Number(p.down_payment ?? 0).toLocaleString()}</td>
                    <td>₱{Math.max(0, balance).toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${status}`}>
                        {status === "paid"
                          ? "Paid in Full"
                          : status === "unpaid"
                          ? "Balance Due"
                          : status === "refunded"
                          ? "Canceled"
                          : status}
                      </span>
                    </td>
                    <td>{actionContent}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  No payment records available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- REFUND DETAILS MODAL --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Update Refund Details</h3>

            <input
              type="text"
              placeholder="Bank Name"
              value={refundDetails.refund_bank_name}
              onChange={(e) => setRefundDetails({ ...refundDetails, refund_bank_name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Account Number"
              value={refundDetails.refund_account_number}
              onChange={(e) => setRefundDetails({ ...refundDetails, refund_account_number: e.target.value })}
            />
            <input
              type="text"
              placeholder="Account Name"
              value={refundDetails.refund_account_name}
              onChange={(e) => setRefundDetails({ ...refundDetails, refund_account_name: e.target.value })}
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
