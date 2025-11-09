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
      // fetch payments and reservations so we can merge cancelled reservations into the admin payments table
      const [paymentsRes, reservationsRes] = await Promise.all([
        axios.get("/api/admin/payments"),
        axios.get("/api/reservations"),
      ]);

      const paymentsData = Array.isArray(paymentsRes.data)
        ? paymentsRes.data
        : Array.isArray(paymentsRes.data.data)
        ? paymentsRes.data.data
        : [];

      const reservations = Array.isArray(reservationsRes.data)
        ? reservationsRes.data
        : Array.isArray(reservationsRes.data?.data)
        ? reservationsRes.data.data
        : Array.isArray(reservationsRes.data?.reservations)
        ? reservationsRes.data.reservations
        : [];

      // map reservations by id
      const reservationsById = {};
      reservations.forEach((r) => {
        if (r && r.id) reservationsById[r.id] = r;
      });

      // attach reservation objects to payments when possible
      const paymentsByReservation = {};
      paymentsData.forEach((p) => {
        const rid = p.reservation_id ?? (p.reservation && p.reservation.id) ?? null;
        if (!p.reservation && rid && reservationsById[rid]) p.reservation = reservationsById[rid];
        if (rid) paymentsByReservation[rid] = p;
      });

      // create synthetic payment entries for cancelled reservations that don't have a payment record
      const synthetic = [];
      const safeParse = (data) => {
        try {
          return typeof data === 'string' ? JSON.parse(data) : data || [];
        } catch {
          return [];
        }
      };

      reservations.forEach((r) => {
        const status = String(r.status || '').toLowerCase();
        if ((status === 'cancelled' || status === 'canceled') && !paymentsByReservation[r.id]) {
          // compute totals similar to ManageReservations.computeTotals
          const customs = safeParse(r.custom_services);
          let totalPrice = 0;
          let totalDown = 0;
          if (r.service) {
            totalPrice += Number(r.service.price || 0);
            totalDown += Number(r.service.down_payment || 0);
          }
          (customs || []).forEach((c) => {
            totalPrice += (Number(c.price || 0)) * (Number(c.quantity || 1));
            totalDown += (Number(c.down_payment || 0)) * (Number(c.quantity || 1));
          });

          synthetic.push({
            id: `res-${r.id}`,
            synthetic: true,
            reservation: r,
            total_price: totalPrice,
            down_payment: totalDown,
            balance: 0,
            status: 'cancelled',
            created_at: r.created_at ?? r.updated_at ?? null,
          });
        }
      });

      // sort combined by created_at (newest first). If created_at missing, fall back to reservation id or payment id
      const combined = [...paymentsData, ...synthetic].sort((a, b) => {
        const getTime = (obj) => {
          const t = obj.created_at ?? obj.updated_at ?? (obj.reservation && (obj.reservation.created_at ?? obj.reservation.updated_at)) ?? null;
          if (t) return new Date(t).getTime();
          // fallback to numeric ids (reservations often have lower ids -> older). Multiply to keep scale
          const rid = obj.reservation?.id ?? null;
          if (rid) return Number(rid) * 1000;
          if (typeof obj.id === 'string' && obj.id.startsWith('res-')) return Number(obj.id.split('-')[1]) * 1000;
          return Number(obj.id) || 0;
        };
        return getTime(b) - getTime(a);
      });

      setPayments(combined);
    } catch (err) {
      console.error("Error loading payments or reservations:", err);
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
      // If this is a synthetic reservation entry (no real payment record), create a payment first
      let paymentId = selectedPayment.id;
      if (selectedPayment.synthetic || (typeof selectedPayment.id === 'string' && selectedPayment.id.startsWith('res-'))) {
        // create a payment record for this reservation so we can attach the refund
        const payload = {
          reservation_id: selectedPayment.reservation?.id,
          user_id: selectedPayment.reservation?.user?.id ?? null,
          total_price: selectedPayment.total_price ?? 0,
          down_payment: selectedPayment.down_payment ?? 0,
          balance: selectedPayment.balance ?? 0,
        };
        try {
          const created = await axios.post(`/api/admin/payments`, payload);
          const createdPayment = created.data.payment || created.data;
          if (!createdPayment || !createdPayment.id) throw new Error('Failed to create payment record');
          paymentId = createdPayment.id;

          // replace the synthetic entry in the list with the newly created payment object
          setPayments((prev) => prev.map((p) => (p.id === selectedPayment.id ? createdPayment : p)));
        } catch (createErr) {
          console.error('Create payment failed', createErr);
          const msg = createErr?.response?.data?.message || createErr?.message || 'Failed to create payment record';
          alert(`Failed to create payment record for refund. ${msg}`);
          setProcessing(false);
          return;
        }
      }

      // guard: ensure paymentId is numeric (server expects payment id, not synthetic id)
      if (typeof paymentId === 'string' && paymentId.startsWith('res-')) {
        alert('Cannot perform refund: payment id invalid. Please refresh and try again.');
        setProcessing(false);
        return;
      }

      // now upload refund receipt to the payment refund endpoint
      await axios.post(`/api/admin/payments/${paymentId}/refund`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPayments((prev) =>
        prev.map((p) =>
          // match by payment id (number) or by previous synthetic id replaced above
          (p.id === paymentId || p.id === selectedPayment.id)
            ? { ...p, status: "refunded", refund_receipt: "uploaded" }
            : p
        )
      );

      alert("Refund processed successfully.");
      setSelectedPayment(null);
      setRefundFile(null);
    } catch (err) {
      console.error(err);
      // Try to surface server message if present
      const serverMsg = err?.response?.data?.message || err?.message;
      alert(`Refund failed. ${serverMsg || 'Check the file and try again.'}`);
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

                // Determine cancellation and button disabled states
                const isCancelledReservation =
                  p.reservation && ['cancelled','canceled'].includes(String(p.reservation.status || '').toLowerCase());

                // Disable 'Paid' button if already paid/refunded OR if the reservation was cancelled
                const paidDisabled = status === "paid" || status === "refunded" || isCancelledReservation;

                // Disable 'Refund' button for already refunded OR fully paid payments
                // (refunds should be processed only for cancellations/refund flows)
                const refundDisabled = status === "refunded" || status === "paid";

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
                    {/* Show numeric reservation id only (strip any 'res-' prefix) */}
                    <td>{
                      (typeof p.id === 'string' && p.id.startsWith('res-'))
                        ? p.id.split('-')[1]
                        : (p.reservation?.id ?? p.id)
                    }</td>
                    <td>
                      <div className="client-cell">
                        <div className="client-name">{clientName}</div>
                        <div className="event-name">
                          {p.reservation?.event_name || p.event_name || "—"}
                        </div>
                      </div>
                    </td>
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
                        disabled={paidDisabled}
                        title={
                          paidDisabled
                            ? isCancelledReservation
                              ? "Reservation cancelled — cannot mark paid"
                              : "Already Paid or Refunded"
                            : "Mark as Paid"
                        }
                      >
                        Paid
                      </button>

                      <button
                        className="btn-refund"
                        onClick={() => openRefundModal(p)}
                        disabled={refundDisabled}
                        title={
                          refundDisabled
                            ? status === 'paid'
                              ? 'Cannot refund a fully paid reservation from here'
                              : 'Already Refunded'
                            : 'Issue Refund'
                        }
                      >
                        Refund
                      </button>

                      {/* Allow deleting the reservation once the payment has been refunded or marked paid */}
                      {p.reservation && (status === 'refunded' || status === 'paid') && (
                        <button
                          className="btn-delete"
                          onClick={async () => {
                            if (!confirm('Delete reservation and remove record? This is permanent.')) return;
                            try {
                              await axios.delete(`/api/reservations/${p.reservation.id}`);
                              // remove this payment row from the table
                              setPayments((prev) => prev.filter((pp) => pp.id !== p.id && pp.id !== `res-${p.reservation.id}` && pp.id !== p.reservation.id));
                              alert('Reservation deleted.');
                            } catch (err) {
                              console.error('Failed to delete reservation', err);
                              alert('Failed to delete reservation.');
                            }
                          }}
                        >
                          Delete
                        </button>
                      )}
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