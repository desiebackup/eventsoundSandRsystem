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

  axios.defaults.withXSRFToken = true;
  axios.defaults.withCredentials = true;
  axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

  // === FETCH USER PAYMENTS & REFUND DETAILS ===
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [paymentsRes, refundRes] = await Promise.allSettled([
          axios.get("/api/user/payments"),
          axios.get("/api/user/refund-details"),
        ]);

        // ✅ Payments
        if (paymentsRes.status === "fulfilled") {
          const data = Array.isArray(paymentsRes.value.data)
            ? paymentsRes.value.data
            : Array.isArray(paymentsRes.value.data.data)
            ? paymentsRes.value.data.data
            : paymentsRes.value.data.payments || [];
          setPayments(data);
        }

        // ✅ Refund Details
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

  // === SAVE REFUND DETAILS ===
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

  // === COMPUTE TOTAL BALANCES AND PAYMENTS ===
  const unpaidPayments = Array.isArray(payments)
    ? payments.filter(
        (p) =>
          String(p.status).toLowerCase() === "unpaid" ||
          Number(p.balance) > 0
      )
    : [];

  const totalBalanceDue = unpaidPayments.reduce(
    (sum, p) => sum + Number(p.balance ?? 0),
    0
  );

  const totalDownPayment = payments.reduce(
    (sum, p) => sum + Number(p.down_payment ?? 0),
    0
  );

  const hasUnpaid = unpaidPayments.length > 0;

  return (
    <div className="pay-wrapper">
      <h2 className="pay-title">Payment & Invoice Center</h2>

      {/* === TOTAL BALANCE SUMMARY === */}
      {hasUnpaid ? (
        <div className="balance-box">
          <p className="balance-label">Total Remaining Balance</p>
          <h1 className="balance-amount">
            ₱
            {totalBalanceDue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </h1>
          <p className="balance-info">
            You currently have {unpaidPayments.length} unpaid{" "}
            {unpaidPayments.length > 1 ? "reservations" : "reservation"} that
            must be paid <b>in person</b>.
          </p>
          <p style={{ opacity: 0.85 }}>
            Total down payments made:{" "}
            <b>
              ₱
              {totalDownPayment.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </b>
          </p>
        </div>
      ) : (
        <div className="balance-box paid">
          <p className="balance-label">No Pending Balances</p>
          <h1 className="balance-amount">₱0.00</h1>
          <p className="balance-info">
            All your reservations are paid in full!
          </p>
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
                <p className="refund-bank">
                  <b>{refundDetails.refund_bank_name}</b> (Account Ending:{" "}
                  {refundDetails.refund_account_number.slice(-4)})
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
              All manual refunds (e.g., cancellations) will be sent to this
              account.
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

      {/* === PAYMENT HISTORY TABLE === */}
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

                let actionContent;
                if (status === "paid" || status === "paid in full") {
                  actionContent = (
                    <span className="action-link paid-full">Fully Paid</span>
                  );
                } else if (status === "unpaid" || status === "balance due") {
                  actionContent = (
                    <span className="action-link pay-in-person">
                      Pay In Person
                    </span>
                  );
                } else if (status === "refunded" || status === "canceled") {
                  actionContent = (
                    <div className="refund-status">
                      <span className="action-link refund-sent">
                        REFUND SENT
                      </span>
                      {p.refund_receipt && (
                        <a
                          href={`/storage/${p.refund_receipt}`}
                          target="_blank"
                          rel="noreferrer"
                          className="view-receipt"
                        >
                          <i className="fas fa-file-invoice"></i> View Receipt
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
                    <td>₱{Number(p.balance ?? 0).toLocaleString()}</td>
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

      {/* === REFUND MODAL === */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Update Refund Details</h3>

            <input
              type="text"
              placeholder="Bank Name"
              value={refundDetails.refund_bank_name}
              onChange={(e) =>
                setRefundDetails({
                  ...refundDetails,
                  refund_bank_name: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Account Number"
              value={refundDetails.refund_account_number}
              onChange={(e) =>
                setRefundDetails({
                  ...refundDetails,
                  refund_account_number: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Account Name"
              value={refundDetails.refund_account_name}
              onChange={(e) =>
                setRefundDetails({
                  ...refundDetails,
                  refund_account_name: e.target.value,
                })
              }
            />

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
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
