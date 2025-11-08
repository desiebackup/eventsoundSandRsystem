import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../css/adminnav/Payments.css";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refundFile, setRefundFile] = useState(null);
  const [processing, setProcessing] = useState(false);

  // === FETCH PAYMENTS ===
  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await axios.get("/api/admin/payments");
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.data)
        ? res.data.data
        : [];
      setPayments(data);
    } catch (err) {
      console.error("Error loading payments:", err);
      setPayments([]);
    }
  };

  // === MARK AS PAID ===
  const markAsPaid = async (id) => {
    if (!confirm("Mark this payment as fully paid in person?")) return;
    try {
      await axios.post(`/api/admin/payments/${id}/paid`);
      setPayments((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "paid" } : p))
      );
      alert("Payment marked as paid.");
    } catch (err) {
      console.error(err);
      alert("Failed to mark as paid.");
    }
  };

  // === OPEN REFUND MODAL ===
  const openRefundModal = (payment) => {
    setSelectedPayment(payment);
    setRefundFile(null);
  };

  // === SUBMIT REFUND ===
  const submitRefund = async () => {
    if (!selectedPayment) return;
    if (!refundFile) return alert("Please upload a refund receipt image.");
    if (!confirm("Upload refund receipt and mark payment as refunded?")) return;

    setProcessing(true);
    const fd = new FormData();
    fd.append("refund_receipt", refundFile);

    try {
      await axios.post(`/api/admin/payments/${selectedPayment.id}/refund`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPayments((prev) =>
        prev.map((p) =>
          p.id === selectedPayment.id
            ? { ...p, status: "refunded", refund_receipt: "uploaded" }
            : p
        )
      );

      alert("Refund processed successfully.");
      setSelectedPayment(null);
      setRefundFile(null);
    } catch (err) {
      console.error(err);
      alert("Refund failed. Check the file and try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="payments-page">
      <div className="payments-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Total Price</th>
              <th>Down Payment</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Proof</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {Array.isArray(payments) && payments.length > 0 ? (
              payments.map((p) => {
                const total = Number(p.total_price ?? 0);
                const down = Number(p.down_payment ?? 0);
                const balance = Number(p.balance ?? total - down);

                // Normalize status (e.g., "Paid", "PAID", "paid" → "paid")
                const status = String(p.status || "unpaid").toLowerCase();

                // Disable both buttons if paid or refunded
                const isDisabled =
                  status === "paid" || status === "refunded";

                const user =
                  p.user || p.reservation?.user || p.reservation?.client || null;
                const clientName = user
                  ? `${user.firstname} ${user.lastname}`
                  : "N/A";

                const downProof =
                  p.proof_image || p.reservation?.down_payment || null;
                const refundProof = p.refund_receipt || null;

                return (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{clientName}</td>
                    <td>₱{total.toLocaleString()}</td>
                    <td>₱{down.toLocaleString()}</td>
                    <td>₱{balance.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${status}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>

                    {/* === Proof column === */}
                    <td>
                      {status === "refunded" && refundProof ? (
                        <a
                          href={`/storage/${refundProof}`}
                          target="_blank"
                          rel="noreferrer"
                          className="proof-link refund"
                        >
                          View Refund Receipt
                        </a>
                      ) : downProof ? (
                        <a
                          href={`/storage/${downProof}`}
                          target="_blank"
                          rel="noreferrer"
                          className="proof-link downpayment"
                        >
                          View Downpayment
                        </a>
                      ) : (
                        <em>No Proof</em>
                      )}
                    </td>

                    {/* === Action buttons === */}
                    <td className="action-buttons">
                      <button
                        className="btn-paid"
                        onClick={() => markAsPaid(p.id)}
                        disabled={isDisabled}
                        title={
                          isDisabled
                            ? "Already Paid or Refunded"
                            : "Mark as Paid"
                        }
                      >
                        Paid
                      </button>

                      <button
                        className="btn-refund"
                        onClick={() => openRefundModal(p)}
                        disabled={isDisabled}
                        title={
                          isDisabled
                            ? "Already Paid or Refunded"
                            : "Issue Refund"
                        }
                      >
                        Refund
                      </button>
                    </td>
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
      {selectedPayment && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button
              className="close-btn"
              onClick={() => setSelectedPayment(null)}
            >
              ✕
            </button>

            <h3>Refund - Payment #{selectedPayment.id}</h3>

            <p>
              <strong>User:</strong>{" "}
              {selectedPayment.reservation?.user
                ? `${selectedPayment.reservation.user.firstname} ${selectedPayment.reservation.user.lastname}`
                : "N/A"}
            </p>
            <p>
              <strong>Refund Amount (Down Payment):</strong> ₱
              {Number(selectedPayment.down_payment ?? 0).toLocaleString()}
            </p>
            <p>
              <strong>Status:</strong> {selectedPayment.status}
            </p>

            <hr />
            <h4>Refund Details (From User)</h4>
            <p>
              <strong>Bank Name:</strong>{" "}
              {selectedPayment.user?.refund_bank_name ||
                selectedPayment.reservation?.user?.refund_bank_name ||
                "—"}
            </p>
            <p>
              <strong>Account Name:</strong>{" "}
              {selectedPayment.user?.refund_account_name ||
                selectedPayment.reservation?.user?.refund_account_name ||
                "—"}
            </p>
            <p>
              <strong>Account Number:</strong>{" "}
              {selectedPayment.user?.refund_account_number ||
                selectedPayment.reservation?.user?.refund_account_number ||
                "—"}
            </p>

            <hr />
            <h4>Upload Refund Receipt</h4>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setRefundFile(e.target.files?.[0] ?? null)}
            />

            <div className="button-group">
              <button
                className="btn-refund-cancel"
                onClick={() => {
                  setSelectedPayment(null);
                  setRefundFile(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn-confirm-refund"
                onClick={submitRefund}
                disabled={processing}
              >
                {processing ? "Processing…" : "Confirm Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}